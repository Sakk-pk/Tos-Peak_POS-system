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
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])->latest()->paginate(10)->appends(request()->query());
        $categories = Category::orderBy('name')->get();
        $subCategories = CatalogAttribute::query()->where('type', 'sub_category')->orderBy('name')->get();
        $colors = CatalogAttribute::query()->where('type', 'color')->orderBy('name')->get();
        $brands = Brand::orderBy('name')->get();
        $sizes = CatalogAttribute::query()->where('type', 'size')->orderBy('name')->get();

        return Inertia::render('Products/ProductsPage', [
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
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return to_route('products.index')->with('success', 'Product created successfully');
    }
}
