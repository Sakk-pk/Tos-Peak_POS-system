<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->orderBy('name', 'asc')
            ->get()
            ->unique('name')
            ->values();
            
        $categories = Category::orderBy('name')->get();
        $subCategories = CatalogAttribute::query()->where('type', 'sub_category')->orderBy('name')->get();
        $colors = CatalogAttribute::query()->where('type', 'color')->orderBy('name')->get();
        $brands = Brand::orderBy('name')->get();
        $sizes = CatalogAttribute::query()->where('type', 'size')->orderBy('name')->get();

        return Inertia::render('Admin/Products/ProductsPage', [
            'products' => $products,
            'categories' => $categories,
            'subCategories' => $subCategories,
            'colors' => $colors,
            'brands' => $brands,
            'sizes' => $sizes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'sub_category_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'sub_category'),
            ],
            'color_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'color'),
            ],
            'brand_id' => [
                'required',
                Rule::exists('brands', 'id'),
            ],
            'size_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'size'),
            ],
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'low_stock_alert_enabled' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ]);

        if ($request->has('low_stock_alert_enabled')) {
            $validated['low_stock_alert_enabled'] = filter_var($request->low_stock_alert_enabled, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . preg_replace('/[^A-Za-z0-9.]/', '_', $file->getClientOriginalName());
            $validated['image'] = $file->storeAs('products', $filename, 'public');
        }

        $newProduct = Product::create($validated);
 
        return to_route('products.show', $newProduct->id)->with('success', 'Product created successfully');
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $imageRules = $request->hasFile('image')
            ? ['image', 'mimes:jpeg,jpg,png,webp', 'max:2048']
            : ['nullable', 'string'];

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'sub_category_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'sub_category'),
            ],
            'color_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'color'),
            ],
            'brand_id' => [
                'required',
                Rule::exists('brands', 'id'),
            ],
            'size_id' => [
                'required',
                Rule::exists('catalog_attributes', 'id')->where('type', 'size'),
            ],
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'low_stock_alert_enabled' => ['nullable', 'boolean'],
            'image' => $imageRules,
        ]);

        if ($request->has('low_stock_alert_enabled')) {
            $validated['low_stock_alert_enabled'] = filter_var($request->low_stock_alert_enabled, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
            }
            $file = $request->file('image');
            $filename = time() . '_' . preg_replace('/[^A-Za-z0-9.]/', '_', $file->getClientOriginalName());
            $validated['image'] = $file->storeAs('products', $filename, 'public');
        } else {
            unset($validated['image']);
        }

        $oldName = $product->name;
        $product->update($validated);

        // Synchronize shared fields across all variants of this shoe model
        $updateShared = [];
        if (isset($validated['name'])) $updateShared['name'] = $validated['name'];
        if (isset($validated['description'])) $updateShared['description'] = $validated['description'];
        if (isset($validated['brand_id'])) $updateShared['brand_id'] = $validated['brand_id'];
        if (isset($validated['category_id'])) $updateShared['category_id'] = $validated['category_id'];
        if (isset($validated['sub_category_id'])) $updateShared['sub_category_id'] = $validated['sub_category_id'];
        if (isset($validated['image'])) $updateShared['image'] = $validated['image'];

        if (!empty($updateShared)) {
            Product::where('name', $oldName)->update($updateShared);
        }

        return to_route('products.index')->with('success', 'Product updated successfully');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        if ($product->image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
        }

        // Delete all variants with the same name
        Product::where('name', $product->name)->delete();

        return to_route('products.index')->with('success', 'Product and all its variants deleted successfully');
    }

    public function show($id)
    {
        $product = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])->findOrFail($id);
        
        $variants = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->where('name', $product->name)
            ->latest()
            ->get();

        $categories = \App\Models\Category::orderBy('name')->get();
        $subCategories = \App\Models\CatalogAttribute::query()->where('type', 'sub_category')->orderBy('name')->get();
        $colors = \App\Models\CatalogAttribute::query()->where('type', 'color')->orderBy('name')->get();
        $brands = \App\Models\Brand::orderBy('name')->get();
        $sizes = \App\Models\CatalogAttribute::query()->where('type', 'size')->orderBy('name')->get();

        return Inertia::render('Admin/Products/ProductDetailPage', [
            'product' => $product,
            'variants' => $variants,
            'categories' => $categories,
            'subCategories' => $subCategories,
            'colors' => $colors,
            'brands' => $brands,
            'sizes' => $sizes,
        ]);
    }

    public function getVariants($id)
    {
        $product = Product::with(['brand', 'category'])->findOrFail($id);

        $variants = Product::with(['color', 'size'])
            ->where('name', $product->name)
            ->get();

        return response()->json([
            'product_name' => $product->name,
            'description' => $product->description,
            'price' => (float) $product->price,
            'brand' => $product->brand?->name,
            'category' => $product->category?->name,
            'image' => $product->image,
            'variants' => $variants->map(function ($v) {
                return [
                    'id' => $v->id,
                    'color' => [
                        'id' => $v->color?->id,
                        'name' => $v->color?->name ?? 'Default',
                        'value' => $v->color?->value ?? '#CCCCCC',
                    ],
                    'size' => [
                        'id' => $v->size?->id,
                        'name' => $v->size?->name ?? 'N/A',
                    ],
                    'stock' => $v->stock,
                    'price' => (float) $v->price,
                    'sku' => $v->sku,
                    'low_stock_threshold' => $v->low_stock_threshold,
                    'low_stock_alert_enabled' => $v->low_stock_alert_enabled,
                ];
            }),
        ]);
    }
}

