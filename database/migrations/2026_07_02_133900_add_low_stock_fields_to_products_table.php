<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('low_stock_threshold')->default(5)->after('stock');
            $table->boolean('low_stock_alert_enabled')->default(true)->after('low_stock_threshold');
            $table->timestamp('last_low_stock_alert_at')->nullable()->after('low_stock_alert_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['low_stock_threshold', 'low_stock_alert_enabled', 'last_low_stock_alert_at']);
        });
    }
};
