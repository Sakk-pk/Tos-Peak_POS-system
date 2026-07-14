<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\CatalogAttribute;
use Inertia\Inertia;

class PointOfSaleController extends Controller
{
    /**
     * Public storefront — the customer-facing landing page. No auth required.
     */
    public function storefront()
    {
        return Inertia::render('Storefront/StorefrontPage/StorefrontPage', array_merge(
            $this->posData(),
            ['isStorefront' => true]
        ));
    }

    /**
     * Admin / Cashier POS — requires auth + manage-pos permission.
     */
    public function index()
    {
        return Inertia::render('Admin/POS/POSPage', array_merge(
            $this->posData(),
            ['isStorefront' => false]
        ));
    }

    /**
     * Shared data builder for both storefront and admin POS.
     */
    private function posData(): array
    {
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->orderBy('name', 'asc')
            ->get();

        $categories = Category::orderBy('view_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function($c) {
                $subQuery = CatalogAttribute::where('type', 'sub_category');
                if ($c->name === 'Unisex') {
                    $subQuery->whereIn('name', ['Sneakers']);
                } elseif ($c->name === 'Sport') {
                    $subQuery->whereIn('name', ['Running', 'Boots']);
                } else { // Men, Women
                    $subQuery->whereIn('name', ['Running', 'Sneakers', 'Boots']);
                }
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'sub_categories' => $subQuery->orderBy('view_order', 'asc')
                        ->orderBy('name', 'asc')
                        ->get(['id', 'name'])
                        ->toArray()
                ];
            });

        $subCategories = CatalogAttribute::query()
            ->where('type', 'sub_category')
            ->orderBy('view_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn($sub) => [
                'id' => $sub->id,
                'name' => $sub->name,
                'category_id' => $sub->category_id,
            ]);

        return [
            'products'      => $products,
            'categories'    => $categories,
            'subCategories' => $subCategories,
        ];
    }

    /**
     * Public storefront product detail page. No auth required.
     */
    public function storefrontShow($id)
    {
        return Inertia::render('Storefront/ProductDetail/ProductDetail', array_merge(
            $this->productDetailData($id),
            ['isStorefront' => true]
        ));
    }

    /**
     * Admin / Cashier product detail page. Requires auth + manage-pos.
     */
    public function show($id)
    {
        return Inertia::render('Storefront/ProductDetail/ProductDetail', array_merge(
            $this->productDetailData($id),
            ['isStorefront' => false]
        ));
    }

    /**
     * Shared product detail data builder.
     */
    private function productDetailData($id): array
    {
        $product = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])->findOrFail($id);

        $variants = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->where('name', $product->name)
            ->get();

        $allSizes = CatalogAttribute::where('type', 'size')
            ->orderBy('view_order', 'asc')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        $relatedProducts = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                      ->orWhere('brand_id', $product->brand_id);
            })
            ->latest()
            ->get()
            ->unique('name')
            ->take(4)
            ->values();

        return [
            'product'         => $product,
            'variants'        => $variants,
            'allSizes'        => $allSizes,
            'relatedProducts' => $relatedProducts,
        ];
    }
}
