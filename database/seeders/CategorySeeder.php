<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Electronics', 'view_order' => 1],
            ['name' => 'Apparel', 'view_order' => 2],
            ['name' => 'Home', 'view_order' => 3],
            ['name' => 'Books', 'view_order' => 4],
            ['name' => 'Sports', 'view_order' => 5],
        ];

        foreach ($items as $item) {
            Category::firstOrCreate(['name' => $item['name']], $item);
        }
    }
}
