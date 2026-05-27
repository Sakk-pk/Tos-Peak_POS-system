<?php

namespace Database\Seeders;

use App\Models\CatalogAttribute;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CatalogAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['type' => 'sub_category', 'name' => 'Running', 'category_name' => 'Sports', 'view_order' => 1],
            ['type' => 'sub_category', 'name' => 'Sneakers', 'category_name' => 'Sports', 'view_order' => 2],
            ['type' => 'sub_category', 'name' => 'Boots', 'category_name' => 'Sports', 'view_order' => 3],
            ['type' => 'color', 'name' => 'Black', 'value' => '#111111', 'view_order' => 1],
            ['type' => 'color', 'name' => 'White', 'value' => '#ffffff', 'view_order' => 2],
            ['type' => 'color', 'name' => 'Red', 'value' => '#ef4444', 'view_order' => 3],
            ['type' => 'size', 'name' => '38', 'view_order' => 1],
            ['type' => 'size', 'name' => '39', 'view_order' => 2],
            ['type' => 'size', 'name' => '40', 'view_order' => 3],
            ['type' => 'size', 'name' => '41', 'view_order' => 4],
            ['type' => 'size', 'name' => '42', 'view_order' => 5],
        ];

        foreach ($items as $item) {
            if (($item['type'] ?? null) === 'sub_category') {
                $category = Category::where('name', $item['category_name'])->first();

                if ($category) {
                    $item['category_id'] = $category->id;
                    $item['parent_name'] = $category->name;
                }

                unset($item['category_name']);
            }

            CatalogAttribute::updateOrCreate(
                [
                    'type' => $item['type'],
                    'name' => $item['name'],
                ],
                $item
            );
        }
    }
}
