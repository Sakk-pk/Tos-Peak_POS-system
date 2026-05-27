<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Nike', 'view_order' => 1],
            ['name' => 'Adidas', 'view_order' => 2],
            ['name' => 'Puma', 'view_order' => 3],
        ];

        foreach ($items as $item) {
            Brand::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
