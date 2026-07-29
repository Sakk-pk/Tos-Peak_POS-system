<?php

use App\Http\Controllers\UserManagement\ProfileController;
use App\Http\Controllers\Product\CatalogSettingsController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Product\VariantController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\UserManagement\RolesController;
use App\Http\Controllers\UserManagement\UserController;
use App\Http\Controllers\UserManagement\InvitationController;
use App\Http\Controllers\POS\PointOfSaleController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Order\MyOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Dynamic storage file server (serves uploaded media if symlink is absent or on container restarts)
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        $filePath = public_path('products/' . basename($path));
    }
    if (!file_exists($filePath)) {
        $filePath = public_path($path);
    }
    if (file_exists($filePath) && is_file($filePath)) {
        $mime = mime_content_type($filePath) ?: 'image/png';
        return response()->file($filePath, ['Content-Type' => $mime]);
    }
    return abort(404);
})->where('path', '.*');

// ── Public Storefront ── (no auth required)
Route::get('/', [PointOfSaleController::class, 'storefront'])->name('storefront.index');
Route::get('/shop/{id}', [PointOfSaleController::class, 'storefrontShow'])->name('storefront.show');
Route::get('/cart', [\App\Http\Controllers\Order\CustomerCartController::class, 'index'])->name('cart.index');

// Wishlist product IDs (public — returns [] for guests, real IDs for customers)
Route::get('/api/wishlist/ids', [WishlistController::class, 'ids'])->name('wishlist.ids');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'check:dashboard'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/customer/dashboard', function () { return redirect('/'); })->name('customer.dashboard');
    Route::get('/account/settings', [\App\Http\Controllers\Dashboard\CustomerDashboardController::class, 'settings'])->name('account.settings');
    Route::post('/customer/profile', [\App\Http\Controllers\Dashboard\CustomerDashboardController::class, 'updateProfile'])->name('customer.profile.update');
    Route::post('/customer/password', [\App\Http\Controllers\Dashboard\CustomerDashboardController::class, 'updatePassword'])->name('customer.password.update');
    Route::get('/my-orders', [MyOrderController::class, 'getCustomerOrderHistory'])->name('my-orders.index');
    Route::get('/api/my-orders', [MyOrderController::class, 'apiOrders'])->name('my-orders.api');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::delete('/api/wishlist', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/checkout', [\App\Http\Controllers\Order\CustomerCartController::class, 'checkout'])->name('checkout.index');
    Route::get('/order-success', [\App\Http\Controllers\Order\CustomerCartController::class, 'success'])->name('checkout.success');

    // Cart Endpoints
    Route::get('/api/cart', [\App\Http\Controllers\Order\CartController::class, 'index'])->name('cart.index.api');
    Route::post('/api/cart', [\App\Http\Controllers\Order\CartController::class, 'store'])->name('cart.store.api');
    Route::patch('/api/cart/{productId}', [\App\Http\Controllers\Order\CartController::class, 'update'])->name('cart.update.api');
    Route::delete('/api/cart/{productId}', [\App\Http\Controllers\Order\CartController::class, 'destroy'])->name('cart.destroy.api');
    Route::delete('/api/cart', [\App\Http\Controllers\Order\CartController::class, 'clear'])->name('cart.clear.api');
    Route::post('/api/cart/sync', [\App\Http\Controllers\Order\CartController::class, 'sync'])->name('cart.sync.api');

    // Rewards Endpoints
    Route::get('/api/user-rewards', [\App\Http\Controllers\Customer\RewardsController::class, 'getRewards'])->name('rewards.index.api');
    Route::post('/api/user-rewards/redeem', [\App\Http\Controllers\Customer\RewardsController::class, 'redeemVoucher'])->name('rewards.redeem.api');

    // ── Catalog Settings ─────────────────────────────────────────────────────
    Route::get('/catalog-settings', [CatalogSettingsController::class, 'index'])->name('catalog-settings.index')->middleware('check:catalog');
    Route::post('/catalog-settings/items', [CatalogSettingsController::class, 'store'])->name('catalog-settings.store')->middleware('check:catalog');
    Route::patch('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'update'])->name('catalog-settings.update')->middleware('check:catalog');
    Route::delete('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'destroy'])->name('catalog-settings.destroy')->middleware('check:catalog');

    // ── Products ─────────────────────────────────────────────────────────────
    Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware('check:products');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware('check:products');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show')->middleware('check:products');
    Route::patch('/products/{id}', [ProductController::class, 'update'])->name('products.update')->middleware('check:products');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('check:products');
    Route::get('/products/{id}/variants', [ProductController::class, 'getVariants'])->name('products.variants')->middleware('check:products');

    // ── Variants ─────────────────────────────────────────────────────────────
    Route::get('/variants', [VariantController::class, 'index'])->name('variants.index')->middleware('check:products');
    Route::post('/variants/stock', [VariantController::class, 'updateStock'])->name('variants.update-stock')->middleware('check:products');

    // ── Inventory ────────────────────────────────────────────────────────────
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index')->middleware('check:inventory');
    Route::post('/inventory/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in')->middleware('check:inventory');
    Route::post('/inventory/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust')->middleware('check:inventory');
    Route::post('/inventory/notify-supplier', [InventoryController::class, 'notifySupplier'])->name('inventory.notify-supplier')->middleware('check:inventory');

    // ── POS (Cashier / Admin internal view) ─────────────────────────────────
    Route::get('/point-of-sale', [PointOfSaleController::class, 'index'])->middleware('check:pos')->name('point-of-sale.index');
    Route::get('/point-of-sale/products/{id}', [PointOfSaleController::class, 'show'])->middleware('check:pos')->name('point-of-sale.show');

    // ── Payments History ─────────────────────────────────────────────────────
    Route::get('/payments', [\App\Http\Controllers\Payment\PaymentHistoryController::class, 'index'])->name('payments.index')->middleware('check:orders');

    // ── Orders ───────────────────────────────────────────────────────────────
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index')->middleware('check:orders');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel')->middleware('check:orders');

    // ── Customers ─────────────────────────────────────────────────────────────
    Route::prefix('customers')->middleware('check:customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('/', [CustomerController::class, 'store'])->name('customers.store');
        Route::patch('/{id}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');
        Route::post('/{id}/toggle-status', [CustomerController::class, 'toggleStatus'])->name('customers.toggle-status');
    });

    // ── Categories (Redirect to Catalog Settings) ────────────────────────────
    Route::get('/categories', function () { return redirect()->route('catalog-settings.index'); })->name('categories.index');

    // ── Roles & Permissions ──────────────────────────────────────────────────
    Route::prefix('roles')->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware('check:roles');
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware('check:roles');
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware('check:roles');
        Route::post('/', [RolesController::class, 'store'])->name('roles.store')->middleware('check:roles');
        Route::patch('/{id}', [RolesController::class, 'update'])->name('roles.update')->middleware('check:roles');
        Route::delete('/{id}', [RolesController::class, 'destroy'])->name('roles.destroy')->middleware('check:roles');
    });

    // ── Staff Management ─────────────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware('check:team-members');
        Route::post('/', [UserController::class, 'store'])->name('users.store')->middleware('check:team-members');
        Route::patch('/{id}', [UserController::class, 'update'])->name('users.update')->middleware('check:team-members');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('check:team-members');
        Route::post('/{id}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate')->middleware('check:team-members');
        Route::post('/{id}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate')->middleware('check:team-members');
    });

    // Invitations are managed from the Team Members module.
    Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store')->middleware('check:team-members');
    Route::post('/invitations/{id}/resend', [InvitationController::class, 'resend'])->name('invitations.resend')->middleware('check:team-members');
    Route::post('/invitations/{id}/cancel', [InvitationController::class, 'cancel'])->name('invitations.cancel')->middleware('check:team-members');

    // ── System Settings (Telegram etc) ───────────────────────────────────────
    Route::get('/system-settings', [\App\Http\Controllers\Settings\SystemSettingsController::class, 'index'])->name('system-settings.index')->middleware('check:catalog');
    Route::post('/system-settings/telegram', [\App\Http\Controllers\Settings\SystemSettingsController::class, 'updateTelegramSettings'])->name('system-settings.telegram.update')->middleware('check:catalog');
    Route::post('/system-settings/telegram/test', [\App\Http\Controllers\Settings\SystemSettingsController::class, 'testTelegramConnection'])->name('system-settings.telegram.test')->middleware('check:catalog');
});

Route::get('/invitations/accept/{token}', [InvitationController::class, 'acceptView'])->name('invitations.accept');
Route::post('/invitations/accept', [InvitationController::class, 'accept'])->name('invitations.accept.post');

require __DIR__.'/auth.php';
