<?php

namespace App\Observers;

use App\Jobs\SendTelegramNotification;
use App\Models\Product\Product;
use App\Models\Notification\Setting;
use App\Models\Notification\TelegramNotificationLog;

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
                        
                    }
                }
            }
        }
    }
}
