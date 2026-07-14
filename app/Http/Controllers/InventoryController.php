<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display the inventory management dashboard.
     */
    public function index(Request $request): Response
    {
        // Fetch all products with relevant relationships
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->latest()
            ->get();

        // Get filter inputs
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $brands = Brand::orderBy('name')->get(['id', 'name']);

        // Prepare products with computed SKUs and alert levels
        $inventoryItems = $products->map(function ($product) {
            // Generate a professional SKU if not present: e.g. NKE-042-001 (Brand - Size - ID)
            $brandCode = strtoupper(substr($product->brand?->name ?? 'GEN', 0, 3));
            $sizeCode = $product->size?->name ?? '00';
            $sku = sprintf('%s-%s-%04d', $brandCode, $sizeCode, $product->id);

            // Default alert level (min stock level before warning)
            $alertLevel = $product->low_stock_threshold ?? (int) config('inventory.low_stock_threshold', 15);

            // Status calculation
            if ($product->stock === 0) {
                $status = 'Out of Stock';
            } elseif ($product->stock <= $alertLevel) {
                $status = 'Low Stock';
            } else {
                $status = 'In Stock';
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $sku,
                'brand' => $product->brand?->name ?? 'No Brand',
                'category' => $product->category?->name ?? 'Uncategorized',
                'sub_category' => $product->subCategory?->name ?? 'N/A',
                'size' => $product->size?->name ?? 'N/A',
                'color' => [
                    'name' => $product->color?->name ?? 'Default',
                    'value' => $product->color?->value ?? '#CCCCCC',
                ],
                'stock' => $product->stock,
                'price' => (float) $product->price,
                'alert_level' => $alertLevel,
                'status' => $status,
                'image' => $product->image,
                'last_updated' => $product->updated_at->diffForHumans(),
            ];
        });

        return Inertia::render('Admin/Inventory/InventoryPage', [
            'inventory' => $inventoryItems,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Add stock to an existing item (Stock In).
     */
    public function stockIn(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated) {
            $product = Product::lockForUpdate()->findOrFail($validated['id']);
            $product->stock += $validated['quantity'];
            $product->save();
        });

        $product = Product::findOrFail($validated['id']);
        return back()->with('success', "Successfully added {$validated['quantity']} items to {$product->name} stock.");
    }

    /**
     * Set stock to a specific value (Stock Adjustment).
     */
    public function adjustStock(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product = Product::findOrFail($validated['id']);
        $oldStock = $product->stock;
        $product->update(['stock' => $validated['quantity']]);

        return back()->with('success', "Adjusted stock for {$product->name} from {$oldStock} to {$validated['quantity']}.");
    }

    /**
     * Mock notification to supplier via Telegram.
     */
    public function notifySupplier(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $product = Product::with(['brand', 'size'])->findOrFail($validated['id']);
        
        // This is a placeholder for sending a real message to a Telegram chat bot.
        // We will return a success message that will trigger a notification in the UI.
        return response()->json([
            'success' => true,
            'message' => "Telegram Alert sent to supplier for {$product->brand?->name} {$product->name} (Size {$product->size?->name})."
        ]);
    }
}
