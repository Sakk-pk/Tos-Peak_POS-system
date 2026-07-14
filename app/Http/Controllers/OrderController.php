<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $orders = Order::with(['items'])
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
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'payment_method' => 'required|string|in:cash,card,qr',
            'cash_received' => 'nullable|numeric',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'khqr_md5' => 'nullable|string|max:32',
        ]);

        try {
            $orderData = DB::transaction(function () use ($validated) {
                $orderNumber = 'TP-' . str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
                while (Order::where('order_number', $orderNumber)->exists()) {
                    $orderNumber = 'TP-' . str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
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

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_name' => $validated['customer_name'] ?: 'Walk-in Customer',
                    'customer_email' => $validated['customer_email'] ?? null,
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $grandTotal,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => $paymentStatus,
                    'cash_received' => $cashReceived,
                    'change_amount' => $changeAmount,
                ]);

                // Sync phone number back to user profile if not already set
                if (!empty($validated['customer_email']) && !empty($validated['customer_phone'])) {
                    $u = \App\Models\User::where('email', $validated['customer_email'])->first();
                    if ($u && empty($u->phone)) {
                        $u->update(['phone' => $validated['customer_phone']]);
                    }
                }

                foreach ($itemsToCreate as $itemInfo) {
                    $order->items()->create($itemInfo);
                }

                $qrString = null;
                $khqrMd5 = null;

                // For QR method, atomically generate QR details and pending payment record
                if ($validated['payment_method'] === 'qr') {
                    $khqrService = app(\App\Services\KhqrService::class);
                    $paymentRepo = app(\App\Repositories\PaymentRepositoryInterface::class);

                    $khqrData = $khqrService->generateDynamicKhqr($grandTotal, 'USD', $orderNumber);
                    $qrString = $khqrData['qr'];
                    $khqrMd5 = $khqrData['md5'];

                    $paymentRepo->create([
                        'order_id'       => $order->id,
                        'amount'         => $grandTotal,
                        'currency'       => 'USD',
                        'khqr_md5'       => $khqrData['md5'],
                        'payment_status' => 'pending',
                    ]);
                } else {
                    \App\Models\Payment::create([
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

            // ── Telegram payment alert ───────────────────────────────────────
            try {
                if ($order->payment_method !== 'qr') {
                    $order->load('items');
                    app(TelegramService::class)->sendPaymentAlert([
                        'order_number'   => $order->order_number,
                        'customer_name'  => $order->customer_name,
                        'payment_method' => $order->payment_method,
                        'currency'       => 'USD',
                        'subtotal'       => $order->subtotal,
                        'tax'            => $order->tax,
                        'total_amount'   => $order->total_amount,
                        'cash_received'  => $order->cash_received,
                        'items'          => $order->items->map(fn($i) => [
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
                    'order' => $order->load('items'),
                    'qr_string' => $orderData['qr_string'],
                    'khqr_md5' => $orderData['khqr_md5']
                ]);
            }

            return redirect()->back()
                ->with('success', 'Order created successfully.')
                ->with('order', $order->load('items'))
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
            $order = Order::with('items')->findOrFail($id);

            if ($order->payment_status !== 'Pending') {
                return redirect()->back()->withErrors(['error' => 'Only pending orders can be cancelled.']);
            }

            DB::transaction(function () use ($order) {
                // Restore stock for every item in the cancelled order,
                // since stock was reserved (decremented) at order creation time.
                foreach ($order->items as $item) {
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
