<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Settings
    |--------------------------------------------------------------------------
    | Used by TelegramService to send payment alerts and low stock alerts.
    |*/

    'bot_token'           => env('TELEGRAM_BOT_TOKEN', ''),
    'payment_bot_token'   => env('TELEGRAM_PAYMENT_BOT_TOKEN', ''),
    'low_stock_bot_token' => env('TELEGRAM_LOW_STOCK_ALERT_BOT_TOKEN', ''),
    'chat_id'             => env('TELEGRAM_CHAT_ID', ''),
    'alerts_enabled'      => env('TELEGRAM_ALERTS_ENABLED', true),
];
