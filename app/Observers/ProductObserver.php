<?php

namespace App\Observers;

use App\Jobs\SendTelegramNotification;
use App\Models\Product;
use App\Models\Setting;
use App\Models\TelegramNotificationLog;
use App\Notifications\LowStockNotification;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class ProductObserver
{
    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        // Check if stock changed
        if ($product->wasChanged('stock')) {
            $isGlobalAlertEnabled = config('telegram.alerts_enabled') !== null
                ? filter_var(config('telegram.alerts_enabled'), FILTER_VALIDATE_BOOLEAN)
                : (Setting::where('key', 'telegram_alerts_enabled')->value('value') === 'true');
            $oldStock = (int) $product->getOriginal('stock');
            $newStock = (int) $product->stock;
            $threshold = (int) $product->low_stock_threshold;

            if ($newStock > $oldStock) {
                // Stock went up (restocked), reset the alert timestamp so we can alert on drops
                if (!is_null($product->last_low_stock_alert_at)) {
                    $product->last_low_stock_alert_at = null;
                    $product->saveQuietly();
                }
            } elseif ($newStock < $oldStock) {
                // Stock decreased
                if ($isGlobalAlertEnabled && $product->low_stock_alert_enabled) {
                    if ($newStock === 0) {
                        // Create log for Out of Stock
                        $log = TelegramNotificationLog::create([
                            'type' => 'out_of_stock',
                            'product_id' => $product->id,
                            'message' => 'Out of stock alert for ' . $product->name,
                            'status' => 'pending'
                        ]);

                        SendTelegramNotification::dispatch($log, 'out_of_stock', $product);

                        $product->last_low_stock_alert_at = now();
                        $product->saveQuietly();

                        $roleNames = \DB::table('roles')->whereIn('name', ['Admin', 'Super Admin'])->pluck('name')->toArray();
                        $admins = !empty($roleNames) ? User::role($roleNames)->get() : collect();
                        if ($admins->count() > 0 && class_exists(LowStockNotification::class)) {
                            Notification::send($admins, new LowStockNotification($product));
                        }
                    } elseif ($newStock <= $threshold && $newStock > 0 && is_null($product->last_low_stock_alert_at)) {
                        // Create log for Low Stock
                        $log = TelegramNotificationLog::create([
                            'type' => 'low_stock',
                            'product_id' => $product->id,
                            'message' => 'Low stock alert for ' . $product->name,
                            'status' => 'pending'
                        ]);

                        SendTelegramNotification::dispatch($log, 'low_stock', $product);

                        $product->last_low_stock_alert_at = now();
                        $product->saveQuietly();
                        
                        // Send DB Notification to Admins
                        $roleNames = \DB::table('roles')->whereIn('name', ['Admin', 'Super Admin'])->pluck('name')->toArray();
                        $admins = !empty($roleNames) ? User::role($roleNames)->get() : collect();
                        if ($admins->count() > 0 && class_exists(LowStockNotification::class)) {
                            Notification::send($admins, new LowStockNotification($product));
                        }
                    }
                }
            }
        }
    }
}
