<?php

namespace App\Console\Commands;

use App\Jobs\SendTelegramNotification;
use App\Models\Product;
use App\Models\Setting;
use App\Models\TelegramNotificationLog;
use Illuminate\Console\Command;

class LowStockSummaryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:low-stock-summary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a daily summary of low stock items to Telegram';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isGlobalAlertEnabled = config('telegram.alerts_enabled') !== null
            ? filter_var(config('telegram.alerts_enabled'), FILTER_VALIDATE_BOOLEAN)
            : (Setting::where('key', 'telegram_alerts_enabled')->value('value') === 'true');
        
        if (!$isGlobalAlertEnabled) {
            $this->info('Telegram alerts are globally disabled.');
            return;
        }

        $lowStockProducts = Product::whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('low_stock_alert_enabled', true)
            ->get();

        if ($lowStockProducts->isEmpty()) {
            $this->info('No low stock products to report.');
            return;
        }

        // We compile the HTML message here because the Service requires $products
        $count = $lowStockProducts->count();
        $lines = [
            '📋 <b>TOS-PEAK Daily Low Stock Summary</b>',
            "🕒 " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i'),
            '━━━━━━━━━━━━━━━━━━',
            "⚠️ <b>{$count} item(s)</b> are currently low on stock:",
            ''
        ];

        foreach ($lowStockProducts as $product) {
            // Escape manually
            $name = str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $product->name);
            $lines[] = "• {$name} (Stock: {$product->stock} / Threshold: {$product->low_stock_threshold})";
        }

        $lines[] = '';
        $lines[] = '━━━━━━━━━━━━━━━━━━';
        $lines[] = '<i>Please arrange restocking for these items.</i>';

        $message = implode("\n", $lines);

        $log = TelegramNotificationLog::create([
            'type' => 'daily_summary',
            'message' => $message,
            'status' => 'pending'
        ]);

        SendTelegramNotification::dispatch($log, 'daily_summary');

        $this->info('Daily low stock summary dispatched to Telegram.');
    }
}
