<?php

namespace App\Http\Controllers\Order;
use App\Http\Controllers\Controller;

use App\Models\Order\CartItem;
use App\Models\Product\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart items.
     */
    public function index()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $items = CartItem::with(['product.category', 'product.brand'])
            ->where('user_id', $userId)
            ->get();

        return response()->json([
            'success' => true,
            'cart' => $items->map(fn($item) => [
                'id' => $item->product_id, // must be product id for compat
                'cart_item_id' => $item->id,
                'name' => $item->product->name,
                'price' => floatval($item->product->price),
                'image' => $item->product->image,
                'size' => $item->size ?? 'Unisex',
                'color' => $item->color ?? 'Standard',
                'quantity' => intval($item->quantity),
                'stock' => intval($item->product->stock),
                'category' => $item->product->category?->name ?? '',
                'brand' => $item->product->brand?->name ?? 'TOS-PEAK',
            ])
        ]);
    }

    /**
     * Add or update a product variant in the authenticated user's cart.
     */
    public function store(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $productId = $validated['product_id'];
        $quantity = $validated['quantity'];
        $size = $validated['size'] ?: 'Unisex';
        $color = $validated['color'] ?: 'Standard';

        // Check stock availability
        $product = Product::findOrFail($productId);
        if ($product->stock < $quantity) {
            return response()->json(['success' => false, 'message' => 'Insufficient stock'], 400);
        }

        // Upsert cart item (merge if match found)
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('size', $size)
            ->where('color', $color)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $quantity;
            if ($product->stock < $newQty) {
                $newQty = $product->stock; // cap to max stock
            }
            $cartItem->update(['quantity' => $newQty]);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'size' => $size,
                'color' => $color,
            ]);
        }

        return $this->index();
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function update(Request $request, $productId)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $size = $validated['size'] ?: 'Unisex';
        $color = $validated['color'] ?: 'Standard';

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('size', $size)
            ->where('color', $color)
            ->first();

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Cart item not found'], 404);
        }

        $product = Product::findOrFail($productId);
        if ($product->stock < $validated['quantity']) {
            return response()->json(['success' => false, 'message' => 'Insufficient stock'], 400);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return $this->index();
    }

    /**
     * Remove a product variant from the cart.
     */
    public function destroy(Request $request, $productId)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $size = $request->query('size') ?: 'Unisex';
        $color = $request->query('color') ?: 'Standard';

        CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('size', $size)
            ->where('color', $color)
            ->delete();

        return $this->index();
    }

    /**
     * Clear the authenticated user's cart (used on logout/checkout).
     */
    public function clear()
    {
        $userId = Auth::id();
        if ($userId) {
            CartItem::where('user_id', $userId)->delete();
        }

        return response()->json(['success' => true, 'cart' => []]);
    }

    /**
     * Merge guest localStorage cart items into database on login.
     */
    public function sync(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.color' => 'nullable|string',
        ]);

        foreach ($validated['items'] as $item) {
            $productId = $item['id'];
            $quantity = $item['quantity'];
            $size = $item['size'] ?: 'Unisex';
            $color = $item['color'] ?: 'Standard';

            $product = Product::find($productId);
            if (!$product) continue;

            $cartItem = CartItem::where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('size', $size)
                ->where('color', $color)
                ->first();

            if ($cartItem) {
                $newQty = $cartItem->quantity + $quantity;
                if ($product->stock < $newQty) {
                    $newQty = $product->stock;
                }
                $cartItem->update(['quantity' => $newQty]);
            } else {
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'size' => $size,
                    'color' => $color,
                ]);
            }
        }

        return $this->index();
    }
}
