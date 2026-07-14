<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class PointOfSaleController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'subCategory', 'color', 'brand', 'size'])
            ->where('stock', '>', 0)
            ->latest()
            ->get();

        $categories = Category::orderBy('view_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('PointOfSale/PointOfSalePageNew', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
