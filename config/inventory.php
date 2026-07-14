<?php
// config/inventory.php

return [
    /*
    |--------------------------------------------------------------------------
    | Inventory & Stock Alert Thresholds
    |--------------------------------------------------------------------------
    |
    | This value determines the threshold stock level below which a product
    | is flagged as "Low Stock" across the Dashboard, Inventory list,
    | and supplier notifications.
    |
    */

    'low_stock_threshold' => env('LOW_STOCK_THRESHOLD', 15),
];
