<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product\Product;
use App\Models\User\User;

class Wishlist extends Model
{
    protected $fillable = ['user_id', 'product_id'];

    public function product()
    {
        return $this->belongsTo(Product::class)->with(['category', 'brand', 'color', 'size']);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
