<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\CatalogAttribute;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sportsCategory = Category::where('name', 'Sports')->first();
        if (!$sportsCategory) {
            $sportsCategory = Category::create(['name' => 'Sports', 'view_order' => 5]);
        }

        $nikeBrand = Brand::where('name', 'Nike')->first();
        if (!$nikeBrand) {
            $nikeBrand = Brand::create(['name' => 'Nike', 'view_order' => 1]);
        }

        $adidasBrand = Brand::where('name', 'Adidas')->first();
        if (!$adidasBrand) {
            $adidasBrand = Brand::create(['name' => 'Adidas', 'view_order' => 2]);
        }

        $pumaBrand = Brand::where('name', 'Puma')->first();
        if (!$pumaBrand) {
            $pumaBrand = Brand::create(['name' => 'Puma', 'view_order' => 3]);
        }

        $runningSub = CatalogAttribute::where('type', 'sub_category')->where('name', 'Running')->first();
        if (!$runningSub) {
            $runningSub = CatalogAttribute::create(['name' => 'Running', 'type' => 'sub_category', 'category_id' => $sportsCategory->id]);
        }

        $sneakersSub = CatalogAttribute::where('type', 'sub_category')->where('name', 'Sneakers')->first();
        if (!$sneakersSub) {
            $sneakersSub = CatalogAttribute::create(['name' => 'Sneakers', 'type' => 'sub_category', 'category_id' => $sportsCategory->id]);
        }

        $redColor = CatalogAttribute::where('type', 'color')->where('name', 'Red')->first();
        if (!$redColor) {
            $redColor = CatalogAttribute::create(['name' => 'Red', 'type' => 'color', 'value' => '#ef4444']);
        }

        $blackColor = CatalogAttribute::where('type', 'color')->where('name', 'Black')->first();
        if (!$blackColor) {
            $blackColor = CatalogAttribute::create(['name' => 'Black', 'type' => 'color', 'value' => '#111111']);
        }

        $whiteColor = CatalogAttribute::where('type', 'color')->where('name', 'White')->first();
        if (!$whiteColor) {
            $whiteColor = CatalogAttribute::create(['name' => 'White', 'type' => 'color', 'value' => '#ffffff']);
        }

        $size40 = CatalogAttribute::where('type', 'size')->where('name', '40')->first();
        if (!$size40) {
            $size40 = CatalogAttribute::create(['name' => '40', 'type' => 'size']);
        }

        // Now create products
        Product::create([
            'id' => 1,
            'category_id' => $sportsCategory->id,
            'sub_category_id' => $runningSub->id,
            'color_id' => $redColor->id,
            'brand_id' => $nikeBrand->id,
            'size_id' => $size40->id,
            'name' => 'Aero Runner',
            'description' => 'Walk Fast',
            'price' => 39.99,
            'stock' => 11,
            'image' => 'products/AOFCGwnDWLDn8Laz515UmY2jxzt2dUDskicnd4Wv.jpg'
        ]);

        Product::create([
            'id' => 2,
            'category_id' => $sportsCategory->id,
            'sub_category_id' => $sneakersSub->id,
            'color_id' => $blackColor->id,
            'brand_id' => $nikeBrand->id,
            'size_id' => $size40->id,
            'name' => 'Aeron',
            'description' => 'hello',
            'price' => 9.97,
            'stock' => 10,
            'image' => 'products/XlnamR5ByuEacCM6WUqNFF3dWfgRaMVriARO0E35.jpg'
        ]);

        Product::create([
            'id' => 3,
            'category_id' => $sportsCategory->id,
            'sub_category_id' => $runningSub->id,
            'color_id' => $whiteColor->id,
            'brand_id' => $adidasBrand->id,
            'size_id' => $size40->id,
            'name' => 'Runer',
            'description' => 'hi',
            'price' => 20.00,
            'stock' => 15,
            'image' => 'products/wVOV2yPztbKuFi13nsdEAKUidqg8EdvrH2FFGGlz.jpg'
        ]);

        Product::create([
            'id' => 4,
            'category_id' => $sportsCategory->id,
            'sub_category_id' => $sneakersSub->id,
            'color_id' => $blackColor->id,
            'brand_id' => $nikeBrand->id,
            'size_id' => $size40->id,
            'name' => 'SAk',
            'description' => 'hello',
            'price' => 14.00,
            'stock' => 11,
            'image' => 'products/1COA6NKmVhXV0QrsG5mvG5UempcZYC2LNKIDAHRw.jpg'
        ]);
    }
}
