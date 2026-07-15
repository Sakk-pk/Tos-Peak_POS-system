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

        // Helper to retrieve environment variables from $_ENV (local) or getenv() (production)
        $getEnvVar = function ($key) {
            return ($_ENV[$key] ?? '') ?: (getenv($key) ?: '');
        };

        // Dynamically override cached database config at runtime using active environment variables
        $connectionName = $getEnvVar('DB_CONNECTION') ?: 'mysql';
        if ($connectionName === 'DB_CONNECTION') {
            $connectionName = 'mysql';
        }
        
        config([
            'database.default' => $connectionName,
            'database.connections.mysql.host' => $getEnvVar('DB_HOST') ?: ($getEnvVar('MYSQL_HOST') ?: ($getEnvVar('MYSQLHOST') ?: '127.0.0.1')),
            'database.connections.mysql.port' => $getEnvVar('DB_PORT') ?: ($getEnvVar('MYSQL_PORT') ?: ($getEnvVar('MYSQLPORT') ?: '3306')),
            'database.connections.mysql.database' => $getEnvVar('DB_DATABASE') ?: ($getEnvVar('MYSQL_DATABASE') ?: ($getEnvVar('MYSQLDATABASE') ?: 'laravel')),
            'database.connections.mysql.username' => $getEnvVar('DB_USERNAME') ?: ($getEnvVar('MYSQL_USER') ?: ($getEnvVar('MYSQLUSER') ?: 'root')),
            'database.connections.mysql.password' => $getEnvVar('DB_PASSWORD') ?: ($getEnvVar('MYSQL_PASSWORD') ?: ($getEnvVar('MYSQLPASSWORD') ?: '')),
        ]);

        // Self-heal: Automatically migrate and seed database if products table is missing or empty
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('products')) {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('products')) {
                if (\App\Models\Product::count() === 0) {
                    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
                } else {
                    // Update old local image paths to beautiful Unsplash public sneaker images
                    $unsplashImages = [
                        1 => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
                        2 => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop',
                        3 => 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop',
                        4 => 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop',
                    ];
                    foreach ($unsplashImages as $id => $url) {
                        $product = \App\Models\Product::find($id);
                        if ($product && !str_starts_with($product->image, 'http')) {
                            $product->update(['image' => $url]);
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            // Avoid failing during build or if DB is not ready yet
        }
    }
}
