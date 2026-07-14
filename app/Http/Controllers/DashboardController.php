<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();

        $totalUsers = User::count();
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $lowStockCount = Product::where('stock', '<=', 15)->count();

        $productsCreatedToday = Product::whereDate('created_at', $today)->count();
        $productsCreatedYesterday = Product::whereDate('created_at', $today->copy()->subDay())->count();
        $dailyDelta = $this->formatDelta($productsCreatedToday, $productsCreatedYesterday);

        $recentUsers = User::latest()->limit(6)->get(['id', 'name', 'email', 'created_at']);
        $recentProducts = Product::with('category')
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'stock', 'category_id', 'created_at']);

        $lowStockItems = Product::with('category')
            ->where('stock', '<=', 15)
            ->orderBy('stock')
            ->limit(6)
            ->get(['id', 'name', 'stock', 'category_id']);

        return Inertia::render('Dashboard', [
            'dashboard' => [
                'metrics' => [
                    [
                        'id' => 1,
                        'title' => 'Total Users',
                        'value' => (string) $totalUsers,
                        'delta' => null,
                    ],
                    [
                        'id' => 2,
                        'title' => 'Products',
                        'value' => (string) $totalProducts,
                        'delta' => $dailyDelta,
                    ],
                    [
                        'id' => 3,
                        'title' => 'Categories',
                        'value' => (string) $totalCategories,
                        'delta' => null,
                    ],
                    [
                        'id' => 4,
                        'title' => 'Low Stock',
                        'value' => (string) $lowStockCount,
                        'delta' => null,
                    ],
                ],
                'recentUsers' => $recentUsers,
                'recentProducts' => $recentProducts,
                'lowStockItems' => $lowStockItems,
            ],
        ]);
    }

    private function formatDelta(int $today, int $yesterday): ?string
    {
        if ($yesterday === 0) {
            return $today > 0 ? '+100%' : null;
        }

        $percent = (($today - $yesterday) / $yesterday) * 100;
        $rounded = round($percent, 1);

        return ($rounded >= 0 ? '+' : '') . $rounded . '%';
    }
}
