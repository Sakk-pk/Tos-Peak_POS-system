<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
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

        // Force HTTPS URL scheme in production
        if (config('app.env') === 'production' || getenv('APP_ENV') === 'production') {
            URL::forceScheme('https');
        }

        // Dynamically override cached database config at runtime using active environment variables
        $connectionName = getenv('DB_CONNECTION') ?: 'mysql';
        if ($connectionName === 'DB_CONNECTION') {
            $connectionName = 'mysql';
        }
        
        config([
            'database.default' => $connectionName,
            'database.connections.mysql.host' => getenv('DB_HOST') ?: (getenv('MYSQL_HOST') ?: (getenv('MYSQLHOST') ?: '127.0.0.1')),
            'database.connections.mysql.port' => getenv('DB_PORT') ?: (getenv('MYSQL_PORT') ?: (getenv('MYSQLPORT') ?: '3306')),
            'database.connections.mysql.database' => getenv('DB_DATABASE') ?: (getenv('MYSQL_DATABASE') ?: (getenv('MYSQLDATABASE') ?: 'laravel')),
            'database.connections.mysql.username' => getenv('DB_USERNAME') ?: (getenv('MYSQL_USER') ?: (getenv('MYSQLUSER') ?: 'root')),
            'database.connections.mysql.password' => getenv('DB_PASSWORD') ?: (getenv('MYSQL_PASSWORD') ?: (getenv('MYSQLPASSWORD') ?: '')),
        ]);

        // Self-heal: Automatically migrate and seed database if products table is missing or empty
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('products')) {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('products') && \App\Models\Product::count() === 0) {
                \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            // Avoid failing during build or if DB is not ready yet
        }
    }
}
