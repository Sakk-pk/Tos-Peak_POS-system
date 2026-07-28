<?php

namespace App\Http\Middleware;

use App\Models\Customer\Wishlist;
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

    /** Module permissions shared with the permission-driven administration UI. */
    private const ALL_PERMISSIONS = [
        'dashboard', 'pos', 'catalog', 'products', 'inventory', 'orders',
        'customers', 'team-members', 'roles',
    ];

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Flush Spatie's in-process permission cache and eager-load the user's
        // roles + direct permissions *before* any ->can() call is made.
        // Without this, $canMap is built from a bare User model with no loaded
        // relations, causing every permission check to return false regardless
        // of what the DB actually holds.
        if ($user) {
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            $user->load('roles.permissions', 'permissions');
        }

        $canMap = collect(self::ALL_PERMISSIONS)
            ->mapWithKeys(fn (string $permission) => [$permission => $user?->can($permission) ?? false])
            ->all();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'redirect_url'     => $this->getRedirectUrl($user),
                    'points'           => (int) ($user->points ?? 100),
                    'redeemed_vouchers'=> $user->redeemed_vouchers ?: [],
                    // Lean list of role names for UI-only checks (e.g. Admin-only storefront button).
                    // Never use this for server-side authorization — only auth.can and route middleware do that.
                    'role_names'       => $user->getRoleNames()->values()->all(),
                ]) : null,
                'can' => $canMap,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'order'   => fn () => $request->session()->get('order'),
            ],
            // Wishlist product IDs — for hydrating heart icons without extra API calls
            'wishlist_ids' => fn () => $user
                ? Wishlist::where('user_id', $user->id)
                    ->whereHas('product', fn ($q) => $q->where('stock', '>', 0))
                    ->pluck('product_id')
                    ->values()
                    ->all()
                : [],
            // Load Dynamic Categories and their associated Sub-Categories
            'categories' => fn () => \App\Models\Product\Category::orderBy('view_order', 'asc')
                ->orderBy('name', 'asc')
                ->get()
                ->map(function($c) {
                    $subQuery = \App\Models\Product\CatalogAttribute::where('type', 'sub_category');
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
     *
     * By the time this is called, share() has already flushed Spatie's
     * permission cache and eager-loaded roles + permissions on $user, so
     * ->can() calls here are safe and accurate.
     */
    private function getRedirectUrl($user): string
    {
        if (!$user) {
            return '/';
        }

        if (! $user->is_team_member) {
            return '/';
        }

        return $user->can('dashboard') ? '/dashboard'
            : ($user->can('pos') ? '/point-of-sale' : '/');
    }
}
