<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Product\CatalogAttribute;

class SyncProductImagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:sync-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan storage/app/public/products/ directory and auto-initialize product entries with categories, brands, colors, and sizes.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $productsDir = storage_path('app/public/products');
        if (!File::exists($productsDir)) {
            File::makeDirectory($productsDir, 0755, true);
            $this->info("Created products storage directory: {$productsDir}");
            return 0;
        }

        $files = File::files($productsDir);
        if (empty($files)) {
            $this->warn("No image files found in {$productsDir}");
            return 0;
        }

        // Ensure default categories, brands, and catalog attributes exist
        $category = Category::firstOrCreate(['name' => 'Sports'], ['view_order' => 1]);
        
        $brands = [
            'Nike' => Brand::firstOrCreate(['name' => 'Nike'], ['view_order' => 1]),
            'Adidas' => Brand::firstOrCreate(['name' => 'Adidas'], ['view_order' => 2]),
            'Puma' => Brand::firstOrCreate(['name' => 'Puma'], ['view_order' => 3]),
        ];

        $subCategory = CatalogAttribute::firstOrCreate(
            ['type' => 'sub_category', 'name' => 'Sneakers'],
            ['category_id' => $category->id]
        );

        $colors = [
            CatalogAttribute::firstOrCreate(['type' => 'color', 'name' => 'Black'], ['value' => '#111111']),
            CatalogAttribute::firstOrCreate(['type' => 'color', 'name' => 'White'], ['value' => '#ffffff']),
            CatalogAttribute::firstOrCreate(['type' => 'color', 'name' => 'Red'], ['value' => '#ef4444']),
        ];

        $sizes = [
            CatalogAttribute::firstOrCreate(['type' => 'size', 'name' => '40']),
            CatalogAttribute::firstOrCreate(['type' => 'size', 'name' => '41']),
            CatalogAttribute::firstOrCreate(['type' => 'size', 'name' => '42']),
        ];

        $createdCount = 0;

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $relativePath = 'products/' . $filename;

            // Check if product already exists with this image path
            $exists = Product::where('image', $relativePath)->exists();
            if ($exists) {
                continue;
            }

            // Generate clean product name from filename
            $nameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);
            $cleanName = preg_replace('/^[0-9]+_?/', '', $nameWithoutExt); // Remove leading timestamp if present
            $cleanName = str_replace(['_', '-'], ' ', $cleanName);
            $cleanName = ucwords($cleanName);

            if (empty($cleanName)) {
                $cleanName = 'Performance Sneaker ' . rand(100, 999);
            }

            // Determine brand from filename or assign round-robin
            $matchedBrand = $brands['Nike'];
            foreach ($brands as $brandName => $brandObj) {
                if (stripos($cleanName, $brandName) !== false) {
                    $matchedBrand = $brandObj;
                    break;
                }
            }

            $selectedColor = $colors[rand(0, count($colors) - 1)];
            $selectedSize = $sizes[rand(0, count($sizes) - 1)];
            $price = rand(45, 160) + 0.99;

            Product::create([
                'category_id' => $category->id,
                'sub_category_id' => $subCategory->id,
                'color_id' => $selectedColor->id,
                'brand_id' => $matchedBrand->id,
                'size_id' => $selectedSize->id,
                'name' => $cleanName,
                'description' => 'Premium performance shoe with comfortable cushioning and durable design.',
                'price' => $price,
                'stock' => rand(10, 30),
                'image' => $relativePath,
                'low_stock_threshold' => 5,
                'low_stock_alert_enabled' => true,
            ]);

            $createdCount++;
            $this->info("Initialized product: {$cleanName} (Image: {$relativePath})");
        }

        $this->info("Product image sync completed! Initialized {$createdCount} new product(s).");
        return 0;
    }
}
