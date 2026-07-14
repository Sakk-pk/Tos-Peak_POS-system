<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'sub_category_id',
        'color_id',
        'brand_id',
        'size_id',
        'name',
        'description',
        'price',
        'stock',
        'image',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(CatalogAttribute::class, 'sub_category_id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(CatalogAttribute::class, 'color_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(CatalogAttribute::class, 'size_id');
    }
}
