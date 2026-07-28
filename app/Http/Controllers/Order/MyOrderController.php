<?php

namespace App\Http\Controllers\Order;
use App\Http\Controllers\Controller;

use App\Models\Order\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyOrderController extends Controller
{
    /**
     * Retrieve and display the authenticated customer's full order history.
     * Generates a customer-specific order sequence number starting at 1.
     */
    public function getCustomerOrderHistory(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $search = $request->query('search');

        // Fetch all storefront orders belonging strictly to this authenticated customer
        // ordered chronologically (oldest to newest) to assign 1-based customer_order_no
        $allCustomerOrders = Order::with(['orderItems'])
            ->where('user_id', $user->id)
            ->where('source', 'storefront')
            ->orderBy('id', 'asc')
            ->get();

        $counter = 1;
        foreach ($allCustomerOrders as $order) {
            $order->customer_order_no = $counter++;
        }

        // Apply search if provided
        if ($search) {
            $allCustomerOrders = $allCustomerOrders->filter(function ($order) use ($search) {
                return str_contains((string) $order->customer_order_no, $search) ||
                       str_contains(strtolower($order->payment_status), strtolower($search)) ||
                       str_contains(strtolower($order->payment_method), strtolower($search));
            });
        }

        // Sort latest-first for display
        $sortedOrders = $allCustomerOrders->sortByDesc('id')->values();

        // Paginate manually
        $page = (int) $request->query('page', 1);
        $perPage = 10;
        $total = $sortedOrders->count();
        $sliced = $sortedOrders->slice(($page - 1) * $perPage, $perPage)->values();

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $sliced,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Storefront/MyOrders/MyOrders', [
            'orders' => $paginated,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    /**
     * Securely fetch the full details of a specific order owned by the authenticated customer.
     */
    public function getOrderDetails(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $order = Order::with(['orderItems'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }
}

