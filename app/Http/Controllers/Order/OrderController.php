<?php

namespace App\Http\Controllers\Order;
use App\Http\Controllers\Controller;

use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Order\CartItem;
use App\Models\Payment\Payment;
use App\Models\Customer\RewardTransaction;
use App\Services\Notification\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $orders = Order::with(['orderItems'])
            ->when($search, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhere('payment_status', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Orders/OrdersPage', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source'           => 'nullable|string|in:storefront,pos',
            'customer_name'    => 'nullable|string|max:255',
            'customer_email'   => 'nullable|email|max:255',
            'customer_phone'   => 'nullable|string|max:255',
            'shipping_name'    => 'nullable|string|max:255',
            'shipping_phone'   => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:1000',
            'order_notes'      => 'nullable|string|max:2000',
            'payment_method'   => 'required|string|in:cash,card,qr',
            'cash_received'    => 'nullable|numeric',
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'khqr_md5'         => 'nullable|string|max:32',
        ]);

        $authUser = Auth::user();
        // POS permission check applies only to POS cashier operations, not storefront e-commerce checkout
        if (request()->header('X-POS-Request') && $authUser?->is_team_member && ! $authUser->can('pos')) {
            abort(403, 'You do not have the required permission.');
        }

        try {
            $orderData = DB::transaction(function () use ($validated) {
                $nextId = (Order::max('id') ?? 0) + 1;
                $orderNumber = 'TP-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
                while (Order::where('order_number', $orderNumber)->exists()) {
                    $nextId++;
                    $orderNumber = 'TP-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
                }

                $subtotal = 0;
                $itemsToCreate = [];

                foreach ($validated['items'] as $itemData) {
                    // Use pessimistic lock (lockForUpdate) to prevent overselling race conditions
                    $product = Product::with(['brand', 'color', 'size'])
                        ->lockForUpdate()
                        ->findOrFail($itemData['id']);

                    if ($product->stock < $itemData['quantity']) {
                        throw new \Exception("Product '{$product->name}' is out of stock or does not have enough quantity.");
                    }

                    // Decrement stock immediately for ALL payment methods.
                    // For QR orders, stock is reserved (held) while payment is pending.
                    // If the QR order is cancelled, stock will be restored in cancel().
                    $product->stock -= $itemData['quantity'];
                    $product->save();

                    $itemPrice = (float) $product->price;
                    $itemSubtotal = $itemPrice * $itemData['quantity'];
                    $subtotal += $itemSubtotal;

                    $itemsToCreate[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $itemData['quantity'],
                        'price' => $itemPrice,
                        'color' => $product->color?->name,
                        'size' => $product->size?->name,
                        'brand' => $product->brand?->name,
                        'product_image' => $product->image,
                    ];
                }

                $tax = $subtotal * 0.08; // 8% tax matching cart
                $grandTotal = $subtotal + $tax;

                $cashReceived = $validated['cash_received'] ?? null;
                $changeAmount = null;

                if ($validated['payment_method'] === 'cash') {
                    $cash = (float) ($cashReceived ?? $grandTotal);
                    $changeAmount = max(0, $cash - $grandTotal);
                    $cashReceived = $cash;
                } else {
                    $cashReceived = $grandTotal;
                    $changeAmount = 0;
                }

                // If QR, create as Pending, otherwise Paid
                $paymentStatus = ($validated['payment_method'] === 'qr') ? 'Pending' : 'Paid';

                $userId = null;
                if (!empty($validated['customer_email'])) {
                    $matchedUser = \App\Models\User\User::where('email', $validated['customer_email'])->first();
                    if ($matchedUser) {
                        $userId = $matchedUser->id;
                    }
                }
                if (!$userId && Auth::check() && !Auth::user()->is_team_member) {
                    $userId = Auth::id();
                }

                $source = $validated['source'] ?? 'pos';

                // For storefront orders, use the real customer name.
                // For POS orders, fall back to 'Walk-in Customer'.
                $customerName = ($source === 'storefront')
                    ? ($validated['customer_name'] ?: 'Customer')
                    : ($validated['customer_name'] ?: 'Walk-in Customer');

                $order = Order::create([
                    'user_id'          => $userId,
                    'order_number'     => $orderNumber,
                    'source'           => $source,
                    'customer_name'    => $customerName,
                    'customer_email'   => $validated['customer_email'] ?? null,
                    'customer_phone'   => $validated['customer_phone'] ?? null,
                    'shipping_name'    => $validated['shipping_name'] ?? null,
                    'shipping_phone'   => $validated['shipping_phone'] ?? null,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'order_notes'      => $validated['order_notes'] ?? null,
                    'subtotal'         => $subtotal,
                    'tax'              => $tax,
                    'total_amount'     => $grandTotal,
                    'payment_method'   => $validated['payment_method'],
                    'payment_status'   => $paymentStatus,
                    'cash_received'    => $cashReceived,
                    'change_amount'    => $changeAmount,
                ]);

                // Sync phone number back to user profile if not already set
                if (!empty($validated['customer_email']) && !empty($validated['customer_phone'])) {
                    $u = \App\Models\User\User::where('email', $validated['customer_email'])->first();
                    if ($u && empty($u->phone)) {
                        $u->update(['phone' => $validated['customer_phone']]);
                    }
                }

                foreach ($itemsToCreate as $itemInfo) {
                    $order->orderItems()->create($itemInfo);
                }

                // Delete cart items in DB for authenticated user upon order placement
                if ($userId) {
                    CartItem::where('user_id', $userId)->delete();
                }

                $qrString = null;
                $khqrMd5 = null;

                // For QR method, atomically generate QR details and pending payment record
                if ($validated['payment_method'] === 'qr') {
                    $khqrService = app(\App\Services\Payment\KhqrService::class);

                    $khqrData = $khqrService->generateDynamicKhqr($grandTotal, 'USD', $orderNumber);
                    $qrString = $khqrData['qr'];
                    $khqrMd5 = $khqrData['md5'];

                    Payment::create([
                        'order_id'       => $order->id,
                        'amount'         => $grandTotal,
                        'currency'       => 'USD',
                        'khqr_md5'       => $khqrData['md5'],
                        'payment_status' => 'pending',
                    ]);
                } else {
                    Payment::create([
                        'order_id'       => $order->id,
                        'amount'         => $grandTotal,
                        'currency'       => 'USD',
                        'payment_status' => 'paid',
                        'transaction_id' => strtoupper($validated['payment_method']) . '_' . strtoupper(uniqid()),
                        'paid_at'        => now(),
                    ]);
                }

                return [
                    'order' => $order,
                    'qr_string' => $qrString,
                    'khqr_md5' => $khqrMd5
                ];
            });

            $order = $orderData['order'];

            // ── Award points & clear database cart for authenticated storefront customers ──
            try {
                $authUser = Auth::user();
                if ($authUser && !$authUser->is_team_member) {
                    $pointsEarned = (int) round($order->total_amount);
                    $authUser->points = ($authUser->points ?? 0) + $pointsEarned;
                    $authUser->save();

                    RewardTransaction::create([
                        'user_id'      => $authUser->id,
                        'type'         => 'earn',
                        'points'       => $pointsEarned,
                        'description'  => "Earned from order {$order->order_number}",
                        'reference_id' => $order->order_number,
                    ]);

                    // Clear the user's database cart
                    CartItem::where('user_id', $authUser->id)->delete();
                }
            } catch (\Exception $rewardEx) {
                Log::warning('Reward/cart clear failed: ' . $rewardEx->getMessage());
            }

            // ── Telegram payment alert ───────────────────────────────────────
            try {
                if ($order->payment_method !== 'qr') {
                    $order->load('orderItems');
                    app(TelegramService::class)->sendPaymentAlert([
                        'order_number'   => $order->order_number,
                        'customer_name'  => $order->customer_name,
                        'payment_method' => $order->payment_method,
                        'currency'       => 'USD',
                        'subtotal'       => $order->subtotal,
                        'tax'            => $order->tax,
                        'total_amount'   => $order->total_amount,
                        'cash_received'  => $order->cash_received,
                        'items'          => $order->orderItems->map(fn($i) => [
                            'name'     => $i->product_name,
                            'price'    => $i->price,
                            'quantity' => $i->quantity,
                        ])->toArray(),
                    ]);
                }
            } catch (\Exception $telegramEx) {
                Log::warning('Telegram alert failed: ' . $telegramEx->getMessage());
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'order' => $order->load('orderItems'),
                    'qr_string' => $orderData['qr_string'],
                    'khqr_md5' => $orderData['khqr_md5']
                ]);
            }

            return redirect()->back()
                ->with('success', 'Order created successfully.')
                ->with('order', $order->load('orderItems'))
                ->with('qr_string', $orderData['qr_string'])
                ->with('khqr_md5', $orderData['khqr_md5']);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Cancel a pending order and release reserved stock.
     */
    public function cancel(Request $request, $id)
    {
        try {
            $order = Order::with('orderItems')->findOrFail($id);

            if ($order->payment_status !== 'Pending') {
                return redirect()->back()->withErrors(['error' => 'Only pending orders can be cancelled.']);
            }

            DB::transaction(function () use ($order) {
                // Restore stock for every item in the cancelled order,
                // since stock was reserved (decremented) at order creation time.
                foreach ($order->orderItems as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->stock += $item->quantity;
                        $product->save();
                    }
                }

                $order->update(['payment_status' => 'Cancelled']);

                // Mark any linked pending payments as failed
                $order->payments()->where('payment_status', 'pending')->update(['payment_status' => 'failed']);
            });

            return redirect()->back()->with('success', 'Order cancelled and stock released.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
