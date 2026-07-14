<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyOrderController extends Controller
{
    /**
     * Display the authenticated customer's order history.
     * Matches orders by the customer's email address.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $search = $request->query('search');

        $query = Order::with(['items'])
            ->where('customer_email', $user->email);

        if ($search) {
            $query->where('order_number', 'like', "%{$search}%");
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Storefront/MyOrders/MyOrders', [
            'orders' => $orders,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    /**
     * Return customer orders as JSON for any helper components if needed.
     */
    public function apiOrders(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $orders = Order::with(['items'])
            ->where('customer_email', $user->email)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }
}
