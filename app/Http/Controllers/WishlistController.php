<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display the authenticated customer's wishlist.
     */
    public function index()
    {
        $userId = Auth::id();
        $products = Product::whereIn('id', function($query) use ($userId) {
            $query->select('product_id')->from('wishlists')->where('user_id', $userId);
        })->with(['color', 'size', 'brand', 'category'])->get();

        return Inertia::render('Storefront/Wishlist/Wishlist', [
            'products' => $products
        ]);
    }

    /**
     * Toggle a product in/out of the wishlist.
     * Returns JSON — used by ProductCard / ProductDetail via fetch.
     */
    public function toggle(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $userId    = Auth::id();
        $productId = $request->product_id;

        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            $wishlisted = false;
        } else {
            Wishlist::create(['user_id' => $userId, 'product_id' => $productId]);
            $wishlisted = true;
        }

        return response()->json([
            'wishlisted' => $wishlisted,
            'product_id' => $productId,
        ]);
    }

    /**
     * Return the set of wishlisted product IDs for the current user.
     * Used to hydrate heart icons on page load.
     */
    public function ids()
    {
        if (!Auth::check()) {
            return response()->json(['ids' => []]);
        }

        $ids = Wishlist::where('user_id', Auth::id())->pluck('product_id');

        return response()->json(['ids' => $ids]);
    }

    /**
     * Remove a specific product from the wishlist (explicit delete).
     */
    public function destroy(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->delete();

        return back()->with('success', 'Removed from wishlist.');
    }
}
