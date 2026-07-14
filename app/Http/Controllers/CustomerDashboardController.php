<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    /**
     * Render the unified customer dashboard view.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Orders matching user email
        $orders = Order::with(['items'])
            ->where('customer_email', $user->email)
            ->latest()
            ->get();

        // Calculate Overview KPIs
        $totalOrders = $orders->count();
        $pendingOrders = $orders->where('payment_status', 'Pending')->count();
        $completedOrders = $orders->where('payment_status', 'Paid')->count();
        
        // Wishlist items count
        $wishlistCount = Wishlist::where('user_id', $user->id)->count();

        // Wishlists full relation query
        $wishlists = Wishlist::with(['product.category', 'product.brand', 'product.color', 'product.size'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Payments log matching orders
        $orderIds = $orders->pluck('id');
        $payments = Payment::with('order')
            ->whereIn('order_id', $orderIds)
            ->latest()
            ->get();

        return Inertia::render('Storefront/DashboardPage/DashboardPage', [
            'orders' => $orders,
            'wishlists' => $wishlists,
            'payments' => $payments,
            'stats' => [
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
                'completedOrders' => $completedOrders,
                'wishlistCount' => $wishlistCount,
            ],
            'filters' => [
                'tab' => $request->query('tab', 'overview'),
            ]
        ]);
    }

    /**
     * Render the storefront account settings page.
     */
    public function settings(Request $request): Response
    {
        $user = Auth::user();
        
        return Inertia::render('Storefront/AccountSettings/AccountSettings', [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'twoFactorEnabled' => $user->hasTwoFactorEnabled(),
        ]);
    }

    /**
     * Update customer profile info.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                \Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->save();

        return back()->with('success', 'Profile information updated successfully.');
    }

    /**
     * Update customer password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
