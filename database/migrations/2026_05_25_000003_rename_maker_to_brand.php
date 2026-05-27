<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing catalog attributes from 'maker' -> 'brand'
        DB::table('catalog_attributes')->where('type', 'maker')->update(['type' => 'brand']);

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'maker_id')) {
                // drop foreign constraint then rename
                try {
                    $table->dropForeign(['maker_id']);
                } catch (\Exception $e) {
                    // ignore if constraint name differs
                }

                $table->renameColumn('maker_id', 'brand_id');

                // re-add foreign key to catalog_attributes
                $table->foreign('brand_id')->references('id')->on('catalog_attributes')->nullOnDelete();
            } else {
                $table->foreignId('brand_id')->nullable()->after('color_id')->constrained('catalog_attributes')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        // revert product column name and catalog attribute types
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'brand_id')) {
                try {
                    $table->dropForeign(['brand_id']);
                } catch (\Exception $e) {
                }

                $table->renameColumn('brand_id', 'maker_id');

                $table->foreign('maker_id')->references('id')->on('catalog_attributes')->nullOnDelete();
            }
        });

        DB::table('catalog_attributes')->where('type', 'brand')->update(['type' => 'maker']);
    }
};
