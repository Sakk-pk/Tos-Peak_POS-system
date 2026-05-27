<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('sub_category_id')->nullable()->after('category_id')->constrained('catalog_attributes')->nullOnDelete();
            $table->foreignId('color_id')->nullable()->after('sub_category_id')->constrained('catalog_attributes')->nullOnDelete();
            $table->foreignId('maker_id')->nullable()->after('color_id')->constrained('catalog_attributes')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->after('maker_id')->constrained('catalog_attributes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sub_category_id');
            $table->dropConstrainedForeignId('color_id');
            $table->dropConstrainedForeignId('maker_id');
            $table->dropConstrainedForeignId('size_id');
        });
    }
};
