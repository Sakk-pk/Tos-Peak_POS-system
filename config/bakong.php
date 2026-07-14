<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bakong KHQR Settings
    |--------------------------------------------------------------------------
    */

    // Bakong wallet account ID (e.g. yourname@bkrt)
    'account_id' => env('BAKONG_MERCHANT_ID', 'mok_chytasenasak@bkrt'),

    // Name shown on the payment screen of banking apps
    'merchant_name' => env('BAKONG_MERCHANT_NAME', 'MOK CHYTASENASAK'),

    'merchant_city' => env('BAKONG_MERCHANT_CITY', 'Phnom Penh'),

    // Store name shown in Tag 62 additional data
    'store_name' => env('BAKONG_STORE_NAME', 'Tos Peak'),

    // Mobile / merchant contact number shown in Tag 62
    'merchant_mobile' => env('BAKONG_MERCHANT_MOBILE', '015859759'),

    // Bank/wallet label shown in the UI
    'bank_name' => env('BAKONG_BANK_NAME', 'Bakong'),

    // Terminal label shown in Tag 62
    'terminal_label' => env('BAKONG_TERMINAL_LABEL', 'POS-01'),

    // Bakong Open API token (JWT) — required for payment status verification
    'api_token' => env('BAKONG_SECRET_KEY', ''),

    // Use test/SIT API endpoint when true
    'is_test' => filter_var(env('BAKONG_IS_TEST', false), FILTER_VALIDATE_BOOLEAN),

    // Webhook HMAC-SHA256 secret — MUST be set via BAKONG_WEBHOOK_SECRET in .env.
    // An empty/unset value will cause all webhook requests to fail validation (safe-by-default).
    'webhook_secret' => env('BAKONG_WEBHOOK_SECRET', ''),
    
    // IP Whitelist for Bakong / National Bank of Cambodia payment notification servers
    'whitelisted_ips' => array_filter(explode(',', env('BAKONG_WHITELISTED_IPS', '127.0.0.1,::1'))),
];
