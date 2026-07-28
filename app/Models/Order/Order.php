<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Payment\Payment;
use App\Models\User\User;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'source',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'order_notes',
        'subtotal',
        'tax',
        'total_amount',
        'payment_method',
        'payment_status',
        'cash_received',
        'change_amount',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->items();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function payment(): HasOne
    {
        // Returns the latest associated KHQR payment record
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
