<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bakong KHQR — repository interface bindings
        $this->app->bind(
            \App\Repositories\PaymentRepositoryInterface::class,
            \App\Repositories\PaymentRepository::class
        );
        $this->app->bind(
            \App\Repositories\OrderRepositoryInterface::class,
            \App\Repositories\OrderRepository::class
        );
        $this->app->bind(
            \App\Repositories\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
    }
}
