<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CatalogSettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PointOfSaleController;
use App\Http\Controllers\PosController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/catalog-settings', [CatalogSettingsController::class, 'index'])->name('catalog-settings.index');
    Route::post('/catalog-settings/items', [CatalogSettingsController::class, 'store'])->name('catalog-settings.store');
    Route::patch('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'update'])->name('catalog-settings.update');
    Route::delete('/catalog-settings/items/{tab}/{id}', [CatalogSettingsController::class, 'destroy'])->name('catalog-settings.destroy');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');

    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('/point-of-sale', [PointOfSaleController::class, 'index'])->name('point-of-sale.index');


    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index')->middleware(['check:category-list']);
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware(['check:category-create']);
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::prefix('roles')->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware(['check:role-list']);
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware(['check:role-create']);
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware(['check:role-edit']);
        Route::post("/", [RolesController::class, 'store'])->name('roles.store');
        Route::patch("/{id}", [RolesController::class, 'update'])->name('roles.update');
        Route::delete("/{id}", [RolesController::class, 'destroy'])->name('roles.destroy')->middleware(['check:role-delete']);
    });
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware(['check:user-list']);
        Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware(['check:user-create']);
        Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware(['check:user-edit']);
        Route::post("/", [UserController::class, 'store'])->name('users.store');
        Route::patch("/{id}", [UserController::class, 'update'])->name('users.update');
        Route::delete("/{id}", [UserController::class, 'destroy'])->name('users.destroy')->middleware(['check:user-delete']);
    });
});

require __DIR__.'/auth.php';
