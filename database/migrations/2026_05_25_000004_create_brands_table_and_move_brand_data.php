<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('view_order')->default(0);
            $table->timestamps();

            $table->unique('name');
            $table->index('view_order');
        });

        $brandRows = DB::table('catalog_attributes')
            ->where('type', 'brand')
            ->orderBy('id')
            ->get();

        foreach ($brandRows as $row) {
            DB::table('brands')->insert([
                'id' => $row->id,
                'name' => $row->name,
                'view_order' => $row->view_order ?? 0,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE brands AUTO_INCREMENT = ' . ((int) DB::table('brands')->max('id') + 1));
        }

        DB::table('catalog_attributes')->where('type', 'brand')->delete();

        Schema::table('products', function (Blueprint $table) {
            try {
                $table->dropForeign(['brand_id']);
            } catch (\Throwable $e) {
            }

            $table->foreign('brand_id')->references('id')->on('brands')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            try {
                $table->dropForeign(['brand_id']);
            } catch (\Throwable $e) {
            }

            $table->foreign('brand_id')->references('id')->on('catalog_attributes')->nullOnDelete();
        });

        $brandRows = DB::table('brands')->orderBy('id')->get();

        foreach ($brandRows as $row) {
            DB::table('catalog_attributes')->insert([
                'id' => $row->id,
                'type' => 'brand',
                'name' => $row->name,
                'parent_name' => null,
                'value' => null,
                'view_order' => $row->view_order ?? 0,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        Schema::dropIfExists('brands');
    }
};
