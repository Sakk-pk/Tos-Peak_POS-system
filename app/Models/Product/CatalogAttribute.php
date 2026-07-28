<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Product\Category;

class CatalogAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'category_id',
        'name',
        'parent_name',
        'value',
        'view_order',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
