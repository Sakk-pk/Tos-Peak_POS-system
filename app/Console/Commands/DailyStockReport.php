<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class DailyStockReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:daily-stock-report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a daily stock warning report to Telegram (items approaching low stock)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Query products with stock <= 10 units
        $products = Product::where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->get();

        $message = "📋 <b>TOS-PEAK Daily Low Stock Report</b>\n";
        $message .= "🕒 " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i') . "\n";
        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "⚠️ The following items currently have 10 units or less of stock:\n\n";

        if ($products->isEmpty()) {
            $message .= "No products currently have 10 units or less of stock.";
        } else {
            foreach ($products as $product) {
                $message .= "• <b>{$product->name}</b>\n";
                $message .= "  Current Stock: {$product->stock} units\n";
            }
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━";

        $this->sendTelegram($message);
        $this->info('Daily stock warning report sent successfully.');
    }

    public function sendTelegram($message)
    {
        $botToken = env('TELEGRAM_LOW_STOCK_ALERT_BOT_TOKEN', '8963658239:AAG_YxKgL9l3c3CVDXvpSopK8HfD7EI4dpM');
        $chatId = env('TELEGRAM_CHAT_ID', '5650744376');

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
        ]);
    }
}
