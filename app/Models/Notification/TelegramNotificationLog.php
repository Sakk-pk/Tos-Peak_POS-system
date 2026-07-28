<?php

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product\Product;

class TelegramNotificationLog extends Model
{
    protected $fillable = [
        'type', 'message', 'status', 'error_message', 'retries', 'product_id'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
