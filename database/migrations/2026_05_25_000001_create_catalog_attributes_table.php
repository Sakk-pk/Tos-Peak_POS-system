<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40);
            $table->string('name');
            $table->string('parent_name')->nullable();
            $table->string('value')->nullable();
            $table->unsignedInteger('view_order')->default(0);
            $table->timestamps();

            $table->index(['type', 'view_order']);
            $table->unique(['type', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_attributes');
    }
};
