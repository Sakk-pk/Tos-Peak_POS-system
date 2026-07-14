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
        
        $defaultThreshold = (int) config('inventory.low_stock_threshold', 15);
        
        // Low Stock Products (stock <= threshold && stock > 0)
        $lowStockCount = Product::whereRaw('stock <= COALESCE(low_stock_threshold, ?) AND stock > 0', [$defaultThreshold])->count();
        
        // Critical Stock Products (stock == 0)
        $criticalStockCount = Product::where('stock', 0)->count();

        // Recent alerts from Telegram logs (types: low_stock, out_of_stock)
        $recentAlerts = \App\Models\TelegramNotificationLog::with('product')
            ->whereIn('type', ['low_stock', 'out_of_stock'])
            ->latest()
            ->limit(5)
            ->get();

        $totalAlertsCount = \App\Models\TelegramNotificationLog::whereIn('type', ['low_stock', 'out_of_stock'])->count();

        $productsCreatedToday = Product::whereDate('created_at', $today)->count();
        $productsCreatedYesterday = Product::whereDate('created_at', $today->copy()->subDay())->count();
        $dailyDelta = $this->formatDelta($productsCreatedToday, $productsCreatedYesterday);

        $recentUsers = User::latest()->limit(6)->get(['id', 'name', 'email', 'created_at']);
        $recentProducts = Product::with('category')
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'stock', 'category_id', 'created_at']);

        // Fetch low stock items for dashboard widget (excluding out of stock)
        $lowStockItems = Product::with('category')
            ->whereRaw('stock <= COALESCE(low_stock_threshold, ?) AND stock > 0', [$defaultThreshold])
            ->orderBy('stock')
            ->limit(6)
            ->get(['id', 'name', 'stock', 'category_id', 'low_stock_threshold']);

        // Fetch critical stock items (out of stock)
        $criticalStockItems = Product::with('category')
            ->where('stock', 0)
            ->orderBy('name')
            ->limit(6)
            ->get(['id', 'name', 'stock', 'category_id']);

        return Inertia::render('Admin/Dashboard/Dashboard', [
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
                        'title' => 'Low Stock',
                        'value' => (string) $lowStockCount,
                        'delta' => null,
                    ],
                    [
                        'id' => 4,
                        'title' => 'Critical Stock',
                        'value' => (string) $criticalStockCount,
                        'delta' => null,
                    ],
                ],
                'recentUsers' => $recentUsers,
                'recentProducts' => $recentProducts,
                'lowStockItems' => $lowStockItems,
                'criticalStockItems' => $criticalStockItems,
                'recentAlerts' => $recentAlerts,
                'totalAlertsCount' => $totalAlertsCount,
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
