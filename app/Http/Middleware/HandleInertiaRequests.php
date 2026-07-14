<?php

namespace App\Http\Middleware;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * All permissions in the simplified View / Manage model.
     * These are always included in the `auth.can` map so the frontend can
     * reliably check `auth.can['manage-products']` etc. regardless of role.
     */
    private const ALL_PERMISSIONS = [
        'view-dashboard',
        'manage-pos',
        'manage-products',
        'manage-variants',
        'manage-inventory',
        'manage-orders',
        'manage-payments',
        'manage-customers',
        'manage-staff',
        'manage-roles',
        'view-notifications',
        'view-reports',
        'manage-settings',
    ];

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Build can-map: Admin gets everything true; others get their actual perms.
        $canMap = [];
        if ($user) {
            $isAdmin = $user->hasRole('Admin');
            if ($isAdmin) {
                // Admin bypasses all checks on the backend; reflect that in the frontend too
                foreach (self::ALL_PERMISSIONS as $perm) {
                    $canMap[$perm] = true;
                }
            } else {
                // Pre-set all to false, then flip the ones the user actually has
                foreach (self::ALL_PERMISSIONS as $perm) {
                    $canMap[$perm] = false;
                }
                $userPermissions = $user->loadMissing('roles.permissions')
                    ->roles
                    ->flatMap(fn($role) => $role->permissions->pluck('name'))
                    ->unique()
                    ->all();
                foreach ($userPermissions as $perm) {
                    if (isset($canMap[$perm])) {
                        $canMap[$perm] = true;
                    }
                }
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'role'         => $user->roles->first()?->name ?? 'Customer',
                    'redirect_url' => $this->getRedirectUrl($user),
                ]) : null,
                'can' => $canMap,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'order'   => fn () => $request->session()->get('order'),
            ],
            'unread_notifications_count' => fn () => $user
                ? $user->unreadNotifications()->count()
                : 0,
            'lowStockAlerts' => fn () => $user
                ? \App\Models\Product::with(['color', 'size'])
                    ->whereRaw('stock <= COALESCE(low_stock_threshold, ?) AND stock > 0', [
                        (int) config('inventory.low_stock_threshold', 15)
                    ])
                    ->orderBy('stock')
                    ->limit(20)
                    ->get()
                    ->map(fn($p) => [
                        'id'    => $p->id,
                        'name'  => $p->name,
                        'stock' => $p->stock,
                        'size'  => $p->size?->name ?? 'N/A',
                        'color' => $p->color?->name ?? 'N/A',
                    ])
                    ->all()
                : [],
            // Wishlist product IDs — for hydrating heart icons without extra API calls
            'wishlist_ids' => fn () => $user
                ? Wishlist::where('user_id', $user->id)->pluck('product_id')->values()->all()
                : [],
            // Load Dynamic Categories and their associated Sub-Categories
            'categories' => fn () => \App\Models\Category::orderBy('view_order', 'asc')
                ->orderBy('name', 'asc')
                ->get()
                ->map(function($c) {
                    $subQuery = \App\Models\CatalogAttribute::where('type', 'sub_category');
                    if ($c->name === 'Unisex') {
                        $subQuery->whereIn('name', ['Sneakers']);
                    } elseif ($c->name === 'Sport') {
                        $subQuery->whereIn('name', ['Running', 'Boots']);
                    } else { // Men, Women
                        $subQuery->whereIn('name', ['Running', 'Sneakers', 'Boots']);
                    }
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'sub_categories' => $subQuery->orderBy('view_order', 'asc')
                            ->orderBy('name', 'asc')
                            ->get(['id', 'name'])
                            ->toArray()
                    ];
                })->all(),
        ]);
    }

    /**
     * Compute first allowed redirect path for the user.
     */
    private function getRedirectUrl($user): string
    {
        if (!$user) {
            return '/';
        }

        $roleName = $user->roles->first()?->name ?? 'Customer';
        if ($roleName === 'Customer') {
            return '/';
        }

        return '/dashboard';
    }
}
