<?php

namespace Database\Seeders;

use App\Models\Product\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = array (
  0 => 
  array (
    'id' => 6,
    'name' => 'Men',
    'view_order' => 1,
    'created_at' => '2026-07-10T16:23:16.000000Z',
    'updated_at' => '2026-07-10T16:23:16.000000Z',
  ),
  1 => 
  array (
    'id' => 7,
    'name' => 'Women',
    'view_order' => 2,
    'created_at' => '2026-07-10T16:23:20.000000Z',
    'updated_at' => '2026-07-10T16:23:20.000000Z',
  ),
  2 => 
  array (
    'id' => 8,
    'name' => 'Unisex',
    'view_order' => 3,
    'created_at' => '2026-07-10T16:23:25.000000Z',
    'updated_at' => '2026-07-10T16:23:25.000000Z',
  ),
  3 => 
  array (
    'id' => 10,
    'name' => 'Sports',
    'view_order' => 1,
    'created_at' => '2026-07-21T07:20:13.000000Z',
    'updated_at' => '2026-07-21T07:20:13.000000Z',
  ),
);

        foreach ($items as $item) {
            Category::updateOrCreate(["id" => $item["id"]], $item);
        }

        Category::whereNotIn('id', array_column($items, 'id'))->delete();
    }
}
