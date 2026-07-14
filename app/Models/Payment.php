<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::updated(function ($payment) {
            // Send exactly one alert: only when the payment is paid AND has an associated order.
            $becamePaidWithOrder = $payment->isDirty('payment_status') && $payment->payment_status === 'paid' && $payment->order_id;
            $linkedOrderWhenPaid = $payment->isDirty('order_id') && $payment->order_id && $payment->payment_status === 'paid';

            if ($becamePaidWithOrder || $linkedOrderWhenPaid) {
                try {
                    // Ensure the order relation is fully loaded
                    $payment->load(['order.items']);
                    app(\App\Services\TelegramService::class)->sendPaymentStatusAlert($payment);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Telegram Payment Status Alert failed: ' . $e->getMessage());
                }
            }
        });
    }

    protected $fillable = [
        'order_id',
        'amount',
        'currency',
        'khqr_md5',
        'transaction_id',
        'sender_account',
        'sender_bank',
        'sender_name',
        'payment_status',
        'paid_at',
    ];

    protected $casts = [
        'amount'   => 'decimal:2',
        'paid_at'  => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
