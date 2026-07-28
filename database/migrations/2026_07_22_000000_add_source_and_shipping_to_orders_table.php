<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds order source tracking (storefront vs pos) and shipping snapshot fields.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Distinguish storefront (online) orders from POS (walk-in) orders.
            // Default is 'pos' so all existing orders remain classified as POS orders.
            $table->string('source')->default('pos')->after('user_id');

            // Delivery snapshot — only populated for storefront orders.
            $table->string('shipping_name')->nullable()->after('customer_phone');
            $table->string('shipping_phone')->nullable()->after('shipping_name');
            $table->text('shipping_address')->nullable()->after('shipping_phone');

            // Customer notes from the checkout form.
            $table->text('order_notes')->nullable()->after('shipping_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['source', 'shipping_name', 'shipping_phone', 'shipping_address', 'order_notes']);
        });
    }
};
