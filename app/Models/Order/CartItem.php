<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product\Product;
use App\Models\User\User;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'size',
        'color',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
