<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'brand', 'color', 'size'])
            ->where('stock', '>', 0)
            ->latest()
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description ?? '',
                    'price' => (float) $product->price,
                    'stock' => (int) $product->stock,
                    'image' => $product->image ?? '/images/placeholder-product.png',
                    'category' => $product->category?->name ?? 'Uncategorized',
                    'color' => $product->color?->name ?? 'Default',
                    'size' => $product->size?->name ?? 'One Size',
                    'brand' => $product->brand?->name ?? '',
                ];
            });

        $categories = Category::orderBy('view_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
            ]);

        return Inertia::render('Pos/PosPage', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
