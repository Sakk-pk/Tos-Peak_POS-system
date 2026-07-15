<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CatalogSettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\VariantController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PointOfSaleController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\MyOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// ── Public Storefront ── (no auth required)
Route::get('/', [PointOfSaleController::class, 'storefront'])->name('storefront.index');
Route::get('/shop/{id}', [PointOfSaleController::class, 'storefrontShow'])->name('storefront.show');
Route::get('/cart', [\App\Http\Controllers\CustomerCartController::class, 'index'])->name('cart.index');

// Wishlist product IDs (public — returns [] for guests, real IDs for customers)
Route::get('/api/wishlist/ids', [WishlistController::class, 'ids'])->name('wishlist.ids');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/customer/dashboard', function () { return redirect('/'); })->name('customer.dashboard');
    Route::get('/account/settings', [\App\Http\Controllers\CustomerDashboardController::class, 'settings'])->name('account.settings');
    Route::post('/customer/profile', [\App\Http\Controllers\CustomerDashboardController::class, 'updateProfile'])->name('customer.profile.update');
    Route::post('/customer/password', [\App\Http\Controllers\CustomerDashboardController::class, 'updatePassword'])->name('customer.password.update');
    Route::get('/my-orders', [MyOrderController::class, 'index'])->name('my-orders.index');
    Route::get('/api/my-orders', [MyOrderController::class, 'apiOrders'])->name('my-orders.api');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::delete('/api/wishlist', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/checkout', [\App\Http\Controllers\CustomerCartController::class, 'checkout'])->name('checkout.index');
    Route::get('/order-success', [\App\Http\Controllers\CustomerCartController::class, 'success'])->name('checkout.success');

    // ── Catalog Settings ─────────────────────────────────────────────────────
    Route::get('/catalog-settings', [CatalogSettingsController::class, 'index'])->name('catalog-settings.index')->middleware('check:manage-settings');
    Route::post('/catalog-settings/items', [CatalogSettingsController::class, 'store'])->name('catalog-settings.store')->middleware('check:manage-settings');
    Route::patch('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'update'])->name('catalog-settings.update')->middleware('check:manage-settings');
    Route::delete('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'destroy'])->name('catalog-settings.destroy')->middleware('check:manage-settings');

    // ── Products ─────────────────────────────────────────────────────────────
    Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware('check:manage-products');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware('check:manage-products');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show')->middleware('check:manage-products');
    Route::patch('/products/{id}', [ProductController::class, 'update'])->name('products.update')->middleware('check:manage-products');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('check:manage-products');
    Route::get('/products/{id}/variants', [ProductController::class, 'getVariants'])->name('products.variants')->middleware('check:manage-products');

    // ── Variants ─────────────────────────────────────────────────────────────
    Route::get('/variants', [VariantController::class, 'index'])->name('variants.index')->middleware('check:manage-variants');
    Route::post('/variants/stock', [VariantController::class, 'updateStock'])->name('variants.update-stock')->middleware('check:manage-variants');

    // ── Inventory ────────────────────────────────────────────────────────────
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index')->middleware('check:manage-inventory');
    Route::post('/inventory/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in')->middleware('check:manage-inventory');
    Route::post('/inventory/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust')->middleware('check:manage-inventory');
    Route::post('/inventory/notify-supplier', [InventoryController::class, 'notifySupplier'])->name('inventory.notify-supplier')->middleware('check:manage-inventory');

    // ── POS (Cashier / Admin internal view) ─────────────────────────────────
    Route::get('/point-of-sale', [PointOfSaleController::class, 'index'])->middleware('check:manage-pos')->name('point-of-sale.index');
    Route::get('/point-of-sale/products/{id}', [PointOfSaleController::class, 'show'])->middleware('check:manage-pos')->name('point-of-sale.show');

    // ── Payments History ─────────────────────────────────────────────────────
    Route::get('/payments', [\App\Http\Controllers\PaymentHistoryController::class, 'index'])->name('payments.index')->middleware('check:manage-payments');

    // ── Orders ───────────────────────────────────────────────────────────────
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index')->middleware('check:manage-orders');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel')->middleware('check:manage-orders');

    // ── Customers ─────────────────────────────────────────────────────────────
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('check:manage-customers');

    // ── Categories (internal, managed within Settings) ───────────────────────
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index')->middleware('check:manage-settings');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware('check:manage-settings');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store')->middleware('check:manage-settings');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update')->middleware('check:manage-settings');
    Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit')->middleware('check:manage-settings');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy')->middleware('check:manage-settings');

    // ── Roles & Permissions ──────────────────────────────────────────────────
    Route::prefix('roles')->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware('check:manage-roles');
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware('check:manage-roles');
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware('check:manage-roles');
        Route::post('/', [RolesController::class, 'store'])->name('roles.store')->middleware('check:manage-roles');
        Route::patch('/{id}', [RolesController::class, 'update'])->name('roles.update')->middleware('check:manage-roles');
        Route::delete('/{id}', [RolesController::class, 'destroy'])->name('roles.destroy')->middleware('check:manage-roles');
    });

    // ── Staff Management ─────────────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware('check:manage-staff');
        Route::post('/', [UserController::class, 'store'])->name('users.store')->middleware('check:manage-staff');
        Route::patch('/{id}', [UserController::class, 'update'])->name('users.update')->middleware('check:manage-staff');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('check:manage-staff');
        Route::post('/{id}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate')->middleware('check:manage-staff');
        Route::post('/{id}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate')->middleware('check:manage-staff');
    });

    // Invitations are triggered from Staff page; guard with manage-staff
    Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store')->middleware('check:manage-staff');
    Route::post('/invitations/{id}/resend', [InvitationController::class, 'resend'])->name('invitations.resend')->middleware('check:manage-staff');
    Route::post('/invitations/{id}/cancel', [InvitationController::class, 'cancel'])->name('invitations.cancel')->middleware('check:manage-staff');

    // ── Notifications ────────────────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index')->middleware('check:view-notifications');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead')->middleware('check:view-notifications');
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead'])->name('notifications.markRead')->middleware('check:view-notifications');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy')->middleware('check:view-notifications');

    // ── System Settings (Telegram etc) ───────────────────────────────────────
    Route::get('/system-settings', [\App\Http\Controllers\SystemSettingsController::class, 'index'])->name('system-settings.index')->middleware('check:manage-settings');
    Route::post('/system-settings/telegram', [\App\Http\Controllers\SystemSettingsController::class, 'updateTelegramSettings'])->name('system-settings.telegram.update')->middleware('check:manage-settings');
    Route::post('/system-settings/telegram/test', [\App\Http\Controllers\SystemSettingsController::class, 'testTelegramConnection'])->name('system-settings.telegram.test')->middleware('check:manage-settings');
});

Route::get('/invitations/accept/{token}', [InvitationController::class, 'acceptView'])->name('invitations.accept');
Route::post('/invitations/accept', [InvitationController::class, 'accept'])->name('invitations.accept.post');

require __DIR__.'/auth.php';

