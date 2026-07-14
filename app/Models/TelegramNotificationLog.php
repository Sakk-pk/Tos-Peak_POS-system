<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
