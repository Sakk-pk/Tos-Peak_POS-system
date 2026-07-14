<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TelegramService — Sends payment alert messages and low stock notifications to a Telegram chat.
 */
class TelegramService
{
    protected string $botToken;
    protected string $paymentBotToken;
    protected string $lowStockBotToken;
    protected string $chatId;

    public function __construct()
    {
        // Try getting from config/env first, fallback to DB
        $this->botToken = config('telegram.bot_token') ?: (Setting::where('key', 'telegram_bot_token')->value('value') ?: '');
        $this->paymentBotToken = config('telegram.payment_bot_token') ?: $this->botToken;
        $this->lowStockBotToken = config('telegram.low_stock_bot_token') ?: $this->botToken;
        $this->chatId   = config('telegram.chat_id') ?: (Setting::where('key', 'telegram_chat_id')->value('value') ?: '');
    }

    public function getBotToken(): string
    {
        return $this->botToken;
    }

    public function getPaymentBotToken(): string
    {
        return $this->paymentBotToken;
    }

    public function getLowStockBotToken(): string
    {
        return $this->lowStockBotToken;
    }

    public function isConfigured(?string $token = null): bool
    {
        $activeToken = $token ?: $this->botToken;
        return !empty($activeToken) && !empty($this->chatId);
    }

    /**
     * Send a low stock alert
     */
    public function sendLowStockAlert(\App\Models\Product $product): void
    {
        $token = $this->lowStockBotToken;
        if (!$this->isConfigured($token)) {
            Log::warning('TelegramService: Cannot send low stock alert. Token or Chat ID is empty.');
            return;
        }

        $brand = $product->brand ? $product->brand->name : 'N/A';
        $size = $product->size ? $product->size->name : 'N/A';
        
        $lines = [
            '🟡 <b>LOW STOCK ALERT</b>',
            '',
            "👟 <b>Product:</b> <code>" . $this->escape($product->name) . "</code>",
            "🏢 <b>Brand:</b> " . $this->escape($brand),
            "📏 <b>Size:</b> " . $this->escape($size),
            "⏰ <b>Time:</b> " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i'),
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '📊 <b>Stock Details</b>',
            "• Current Stock: {$product->stock}",
            "• Alert Threshold: {$product->low_stock_threshold}",
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '⚠️ <b>Action Required</b>',
            '',
            'Please prepare to restock this item.',
        ];

        $message = implode("\n", $lines);
        $this->sendMessage($message, 'Low stock alert sent', $token);
    }

    /**
     * Send an out of stock alert
     */
    public function sendOutOfStockAlert(\App\Models\Product $product): void
    {
        $token = $this->lowStockBotToken;
        if (!$this->isConfigured($token)) {
            Log::warning('TelegramService: Cannot send out of stock alert. Token or Chat ID is empty.');
            return;
        }

        $brand = $product->brand ? $product->brand->name : 'N/A';
        $size = $product->size ? $product->size->name : 'N/A';
        
        $lines = [
            '🔴 <b>OUT OF STOCK ALERT</b>',
            '',
            "👟 <b>Product:</b> <code>" . $this->escape($product->name) . "</code>",
            "🏢 <b>Brand:</b> " . $this->escape($brand),
            "📏 <b>Size:</b> " . $this->escape($size),
            "⏰ <b>Time:</b> " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i'),
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '📊 <b>Stock Details</b>',
            "• Current Stock: 0",
            "• Alert Threshold: {$product->low_stock_threshold}",
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '❌ <b>Action Required</b>',
            '',
            'Product is completely sold out. Please restock immediately.',
        ];

        $message = implode("\n", $lines);
        $this->sendMessage($message, 'Out of stock alert sent', $token);
    }

    /**
     * Send daily summary of all low stock products
     */
    public function sendDailySummary($products): void
    {
        $token = $this->lowStockBotToken;
        if (!$this->isConfigured($token)) {
            Log::warning('TelegramService: Cannot send daily summary. Token or Chat ID is empty.');
            return;
        }

        $count = count($products);
        if ($count === 0) return;

        $lines = [
            '📋 <b>DAILY LOW STOCK SUMMARY</b>',
            '',
            "⚠️ <b>Total Items:</b> {$count}",
            "⏰ <b>Time:</b> " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i'),
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '🛒 <b>Items</b>',
        ];

        foreach ($products as $product) {
            $name = $this->escape($product->name);
            $size = $product->size ? $product->size->name : 'N/A';
            $lines[] = "• {$name} (Size {$size}) — Stock: {$product->stock}";
        }

        $lines[] = '';
        $lines[] = '━━━━━━━━━━━━━━━━━━━━';
        $lines[] = '';
        $lines[] = '✅ <b>Summary Generated</b>';
        $lines[] = '';
        $lines[] = 'Please review the inventory and arrange restocking.';

        $message = implode("\n", $lines);
        $this->sendMessage($message, 'Daily low stock summary sent', $token);
    }

    /**
     * Send a payment received alert when an order is completed.
     */
    public function sendPaymentAlert(array $order): void
    {
        $token = $this->paymentBotToken;
        if (!$this->isConfigured($token)) {
            Log::warning('TelegramService: Cannot send payment alert. Token or Chat ID is empty.');
            return;
        }

        $method      = strtoupper($order['payment_method'] ?? 'UNKNOWN');
        $methodEmoji = match ($method) {
            'QR'   => '📱',
            'CASH' => '💵',
            'CARD' => '💳',
            default => '💰',
        };

        $currency = $order['currency'] ?? 'USD';
        $symbol   = $currency === 'KHR' ? '៛' : '$';

        $lines = [
            '🏪 <b>TOS-PEAK POS — New Payment</b>',
            '━━━━━━━━━━━━━━━━━━━━',
            "🧾 <b>Order:</b> <code>" . $this->escape($order['order_number'] ?? 'N/A') . "</code>",
            "📅 <b>Date:</b> " . now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i'),
            '━━━━━━━━━━━━━━━━━━━━',
        ];

        if (!empty($order['items'])) {
            $lines[] = '🛒 <b>Items:</b>';
            foreach ($order['items'] as $item) {
                $qty  = $item['quantity'] ?? 1;
                $name = $this->escape($item['name'] ?? 'Item');
                $subtotal = isset($item['price'])
                    ? $symbol . number_format($item['price'] * $qty, 2)
                    : '';
                $lines[] = "  • {$name} × {$qty}" . ($subtotal ? "  <i>({$subtotal})</i>" : '');
            }
            $lines[] = '━━━━━━━━━━━━━━━━━━━━';
        }

        if (isset($order['subtotal'])) {
            $lines[] = "💲 <b>Subtotal:</b> {$symbol}" . number_format($order['subtotal'], 2);
        }
        if (isset($order['tax'])) {
            $lines[] = "📊 <b>Tax:</b> {$symbol}" . number_format($order['tax'], 2);
        }

        $lines[] = "✅ <b>Total Paid:</b> {$symbol}" . number_format($order['total_amount'] ?? 0, 2);
        $lines[] = "{$methodEmoji} <b>Payment:</b> {$method}";

        if ($method === 'CASH' && isset($order['cash_received'])) {
            $lines[] = "💵 <b>Cash Given:</b> {$symbol}" . number_format($order['cash_received'], 2);
            $change  = ($order['cash_received'] ?? 0) - ($order['total_amount'] ?? 0);
            if ($change >= 0) {
                $lines[] = "🔄 <b>Change:</b> {$symbol}" . number_format($change, 2);
            }
        }

        if (!empty($order['customer_name']) && $order['customer_name'] !== 'Walk-in Customer') {
            $lines[] = "👤 <b>Customer:</b> " . $this->escape($order['customer_name']);
        }

        $lines[] = '━━━━━━━━━━━━━━━━━━━━';
        $lines[] = '✨ <i>Payment confirmed successfully.</i>';

        $this->sendMessage(implode("\n", $lines), "Payment alert sent for order " . ($order['order_number'] ?? 'N/A'), $token);
    }

    /**
     * Send a quick notification when a payment is marked as paid in the database.
     */
    public function sendPaymentStatusAlert(\App\Models\Payment $payment): void
    {
        $token = $this->paymentBotToken;
        if (!$this->isConfigured($token)) {
            Log::warning('TelegramService: Cannot send payment status alert. Token or Chat ID is empty.');
            return;
        }

        $symbol = $payment->currency === 'KHR' ? '៛' : '$';
        $formattedAmount = $symbol . number_format((float) $payment->amount, 2);

        $lines = [
            '🟢 <b>PAYMENT RECEIVED</b>',
            '',
            "🧾 <b>Order:</b> <code>" . ($payment->order ? $payment->order->order_number : 'N/A') . "</code>",
            "💰 <b>Amount:</b> {$formattedAmount} " . ($payment->currency ?? 'USD'),
            "QA <b>Bank:</b> " . ($payment->sender_bank ?? 'Bakong / Partner Bank'),
            "⏰ <b>Time:</b> " . ($payment->paid_at ? $payment->paid_at->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i') : now()->setTimezone('Asia/Phnom_Penh')->format('d M Y, H:i')),
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '👤 <b>Customer</b>',
        ];

        if ($payment->order) {
            $customerName = $payment->order->customer_name;
            if ($payment->order->customer_email) {
                $customerName .= " (" . $payment->order->customer_email . ")";
            }
            $lines[] = $customerName;
        } else {
            $lines[] = 'Walk-in Customer';
        }

        $lines[] = '';
        $lines[] = '🛒 <b>Items</b>';

        if ($payment->order && $payment->order->items && $payment->order->items->count() > 0) {
            foreach ($payment->order->items as $item) {
                $qty = $item->quantity;
                $name = $this->escape($item->product_name);
                $subtotal = $symbol . number_format($item->price * $qty, 2);
                $lines[] = "• {$name} × {$qty} ({$subtotal})";
            }
        } else {
            $lines[] = '• N/A';
        }

        $lines[] = '';
        $lines[] = '━━━━━━━━━━━━━━━━━━━━';
        $lines[] = '';
        $lines[] = "🔖 <b>Transaction ID:</b> <code>" . ($payment->transaction_id ?? 'N/A') . "</code>";

        if ($payment->sender_name) {
            $lines[] = "💳 <b>Account Name:</b> <code>" . $this->escape($payment->sender_name) . "</code>";
        } else {
            $lines[] = "💳 <b>Account Name:</b> N/A";
        }

        if ($payment->sender_account) {
            $lines[] = "🏦 <b>Bank Account:</b> <code>" . $payment->sender_account . "</code>";
        }

        $lines[] = '';
        $lines[] = '━━━━━━━━━━━━━━━━━━━━';
        $lines[] = '';
        $lines[] = '✅ <b>Payment Verified</b>';
        $lines[] = '';
        $lines[] = 'Please prepare the order.';

        $this->sendMessage(implode("\n", $lines), "Payment status alert sent for MD5 " . $payment->khqr_md5, $token);
    }

    /**
     * Send a raw message to the configured Telegram chat.
     */
    public function sendMessage(string $message, string $logSuccessMessage = 'Message sent successfully', ?string $token = null): bool
    {
        $activeToken = $token ?: $this->botToken;
        if (!$this->isConfigured($activeToken)) {
            Log::warning('TelegramService: Cannot send message. Active bot token or chat ID is empty.');
            return false;
        }

        try {
            $response = Http::post(
                "https://api.telegram.org/bot{$activeToken}/sendMessage",
                [
                    'chat_id'    => $this->chatId,
                    'text'       => $message,
                    'parse_mode' => 'HTML',
                ]
            );

            if (!$response->successful()) {
                Log::error('TelegramService: Failed to send message — ' . $response->body());
                return false;
            }

            Log::info('TelegramService: ' . $logSuccessMessage);
            return true;
        } catch (\Exception $e) {
            Log::error('TelegramService: Exception — ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Escape HTML special characters for Telegram HTML parse mode.
     */
    private function escape(string $text): string
     {
         return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $text);
     }
}
