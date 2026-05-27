<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_attributes', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('type')->constrained('categories')->nullOnDelete();
        });

        $subCategories = DB::table('catalog_attributes')->where('type', 'sub_category')->get();

        foreach ($subCategories as $subCategory) {
            if (! $subCategory->parent_name) {
                continue;
            }

            $categoryId = DB::table('categories')->where('name', $subCategory->parent_name)->value('id');

            if ($categoryId) {
                DB::table('catalog_attributes')
                    ->where('id', $subCategory->id)
                    ->update(['category_id' => $categoryId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('catalog_attributes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
