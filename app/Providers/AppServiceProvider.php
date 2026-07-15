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

        // Dynamically override cached database config at runtime using active environment variables
        config([
            'database.connections.mysql.host' => env('DB_HOST', env('MYSQL_HOST', env('MYSQLHOST', '127.0.0.1'))),
            'database.connections.mysql.port' => env('DB_PORT', env('MYSQL_PORT', env('MYSQLPORT', '3306'))),
            'database.connections.mysql.database' => env('DB_DATABASE', env('MYSQL_DATABASE', env('MYSQLDATABASE', 'laravel'))),
            'database.connections.mysql.username' => env('DB_USERNAME', env('MYSQL_USER', env('MYSQLUSER', 'root'))),
            'database.connections.mysql.password' => env('DB_PASSWORD', env('MYSQL_PASSWORD', env('MYSQLPASSWORD', ''))),
        ]);
    }
}
