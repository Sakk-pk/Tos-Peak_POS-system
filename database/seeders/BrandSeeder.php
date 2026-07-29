<?php

namespace Database\Seeders;

use App\Models\Product\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $items = array (
  0 => 
  array (
    'id' => 1,
    'name' => 'Nike',
    'view_order' => 1,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  1 => 
  array (
    'id' => 2,
    'name' => 'Adidas',
    'view_order' => 2,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  2 => 
  array (
    'id' => 3,
    'name' => 'Puma',
    'view_order' => 3,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
);

        foreach ($items as $item) {
            Brand::updateOrCreate(["id" => $item["id"]], $item);
        }
    }
}
