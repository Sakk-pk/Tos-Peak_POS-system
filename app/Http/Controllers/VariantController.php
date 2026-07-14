<?php

namespace App\Http\Controllers;

use App\Models\CatalogAttribute;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VariantController extends Controller
{
    /**
     * Display a listing of product variants, including all available catalog sizes.
     */
    public function index(): Response
    {
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->orderBy('name')
            ->get();

        // Retrieve all available sizes in the catalog
        $allSizes = CatalogAttribute::where('type', 'size')
            ->orderBy('view_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Group products by name to represent the product and its variants
        $groupedProducts = $products->groupBy('name')->map(function ($items, $name) use ($allSizes) {
            $first = $items->first();
            
            $price = (float) $first->price;
            $subCategoryName = $first->subCategory?->name ?? ($first->category?->name ?? 'Uncategorized');

            // Find all unique colors used by this product
            $colorsInProduct = $items->map(function ($item) {
                return $item->color;
            })->filter()->unique('id');

            // Fallback if no colors are assigned to this product
            if ($colorsInProduct->isEmpty()) {
                $colorsInProduct = collect([
                    (object) [
                        'id' => null,
                        'name' => 'Default',
                        'value' => '#CCCCCC'
                    ]
                ]);
            }

            // For each color, list all catalog sizes. Show stock if it exists, otherwise 0.
            $variantsList = collect();
            foreach ($colorsInProduct as $color) {
                foreach ($allSizes as $size) {
                    $existing = $items->first(function ($item) use ($color, $size) {
                        return $item->color_id == $color->id && $item->size_id == $size->id;
                    });

                    if ($existing) {
                        $variantsList->push([
                            'id' => $existing->id,
                            'exists' => true,
                            'size_id' => $size->id,
                            'size' => $size->name,
                            'color_id' => $color->id,
                            'color' => [
                                'name' => $color->name ?? 'Default',
                                'value' => $color->value ?? '#CCCCCC',
                            ],
                            'stock' => $existing->stock,
                            'price' => (float) $existing->price,
                        ]);
                    } else {
                        $variantsList->push([
                            'id' => null,
                            'exists' => false,
                            'size_id' => $size->id,
                            'size' => $size->name,
                            'color_id' => $color?->id,
                            'color' => [
                                'name' => $color->name ?? 'Default',
                                'value' => $color->value ?? '#CCCCCC',
                            ],
                            'stock' => 0,
                            'price' => $price,
                        ]);
                    }
                }
            }

            return [
                'name' => $name,
                'sub_category' => $subCategoryName,
                'price' => $price,
                'image' => $first->image,
                'variants' => $variantsList->values(),
            ];
        })->values();

        return Inertia::render('Admin/Products/VariantsPage', [
            'products' => $groupedProducts,
        ]);
    }

    /**
     * Update stock for an existing variant, or create a new variant on-the-fly.
     */
    public function updateStock(Request $request)
    {
        $validated = $request->validate([
            'id' => ['nullable', 'integer', 'exists:products,id'],
            'product_name' => ['required_without:id', 'string'],
            'color_id' => ['required_without:id', 'nullable', 'integer', 'exists:catalog_attributes,id'],
            'size_id' => ['required_without:id', 'integer', 'exists:catalog_attributes,id'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        if (!empty($validated['id'])) {
            $product = Product::findOrFail($validated['id']);
            $product->update([
                'stock' => $validated['stock'],
            ]);
            $id = $product->id;
        } else {
            // Find a parent product to copy details from
            $parentProduct = Product::where('name', $validated['product_name'])->firstOrFail();

            $newProduct = Product::create([
                'category_id' => $parentProduct->category_id,
                'sub_category_id' => $parentProduct->sub_category_id,
                'color_id' => $validated['color_id'],
                'brand_id' => $parentProduct->brand_id,
                'size_id' => $validated['size_id'],
                'name' => $parentProduct->name,
                'description' => $parentProduct->description,
                'price' => $parentProduct->price,
                'stock' => $validated['stock'],
                'image' => $parentProduct->image,
            ]);
            $id = $newProduct->id;
        }

        return response()->json([
            'success' => true,
            'id' => $id,
            'message' => 'Stock updated successfully.'
        ]);
    }
}
