<?php

namespace Database\Seeders;

use App\Models\Product\CatalogAttribute;
use Illuminate\Database\Seeder;

class CatalogAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $items = array (
  0 => 
  array (
    'id' => 1,
    'type' => 'sub_category',
    'category_id' => 10,
    'name' => 'Running',
    'parent_name' => 'Sports',
    'value' => NULL,
    'view_order' => 1,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-07-28T17:05:46.000000Z',
  ),
  1 => 
  array (
    'id' => 2,
    'type' => 'sub_category',
    'category_id' => 10,
    'name' => 'Sneakers',
    'parent_name' => 'Sports',
    'value' => NULL,
    'view_order' => 2,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-07-28T17:05:46.000000Z',
  ),
  2 => 
  array (
    'id' => 3,
    'type' => 'sub_category',
    'category_id' => 10,
    'name' => 'Boots',
    'parent_name' => 'Sports',
    'value' => NULL,
    'view_order' => 3,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-07-28T17:05:46.000000Z',
  ),
  3 => 
  array (
    'id' => 4,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Black',
    'parent_name' => NULL,
    'value' => '#111111',
    'view_order' => 1,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  4 => 
  array (
    'id' => 5,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'White',
    'parent_name' => NULL,
    'value' => '#ffffff',
    'view_order' => 2,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  5 => 
  array (
    'id' => 6,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Red',
    'parent_name' => NULL,
    'value' => '#ef4444',
    'view_order' => 3,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  6 => 
  array (
    'id' => 7,
    'type' => 'size',
    'category_id' => NULL,
    'name' => '38',
    'parent_name' => NULL,
    'value' => NULL,
    'view_order' => 1,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  7 => 
  array (
    'id' => 8,
    'type' => 'size',
    'category_id' => NULL,
    'name' => '39',
    'parent_name' => NULL,
    'value' => NULL,
    'view_order' => 2,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  8 => 
  array (
    'id' => 9,
    'type' => 'size',
    'category_id' => NULL,
    'name' => '40',
    'parent_name' => NULL,
    'value' => NULL,
    'view_order' => 3,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  9 => 
  array (
    'id' => 10,
    'type' => 'size',
    'category_id' => NULL,
    'name' => '41',
    'parent_name' => NULL,
    'value' => NULL,
    'view_order' => 4,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  10 => 
  array (
    'id' => 11,
    'type' => 'size',
    'category_id' => NULL,
    'name' => '42',
    'parent_name' => NULL,
    'value' => NULL,
    'view_order' => 5,
    'created_at' => '2026-06-11T04:55:22.000000Z',
    'updated_at' => '2026-06-11T04:55:22.000000Z',
  ),
  11 => 
  array (
    'id' => 12,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Pink',
    'parent_name' => NULL,
    'value' => '#10b981',
    'view_order' => 4,
    'created_at' => '2026-07-04T09:30:46.000000Z',
    'updated_at' => '2026-07-04T09:30:46.000000Z',
  ),
  12 => 
  array (
    'id' => 14,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Orange',
    'parent_name' => '6',
    'value' => '#f59e0b',
    'view_order' => 5,
    'created_at' => '2026-07-28T16:04:27.000000Z',
    'updated_at' => '2026-07-28T16:04:27.000000Z',
  ),
  13 => 
  array (
    'id' => 15,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Yellow',
    'parent_name' => NULL,
    'value' => '#8b5cf6',
    'view_order' => 6,
    'created_at' => '2026-07-28T16:37:13.000000Z',
    'updated_at' => '2026-07-28T16:37:13.000000Z',
  ),
  14 => 
  array (
    'id' => 16,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Blue',
    'parent_name' => NULL,
    'value' => '#111111',
    'view_order' => 7,
    'created_at' => '2026-07-28T16:37:17.000000Z',
    'updated_at' => '2026-07-28T16:37:17.000000Z',
  ),
  15 => 
  array (
    'id' => 17,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Teal',
    'parent_name' => NULL,
    'value' => '#3b82f6',
    'view_order' => 8,
    'created_at' => '2026-07-28T16:37:20.000000Z',
    'updated_at' => '2026-07-28T16:37:20.000000Z',
  ),
  16 => 
  array (
    'id' => 18,
    'type' => 'color',
    'category_id' => NULL,
    'name' => 'Purple',
    'parent_name' => NULL,
    'value' => '#ef4444',
    'view_order' => 9,
    'created_at' => '2026-07-28T16:37:24.000000Z',
    'updated_at' => '2026-07-28T16:37:24.000000Z',
  ),
);

        foreach ($items as $item) {
            CatalogAttribute::updateOrCreate(["id" => $item["id"]], $item);
        }
    }
}
