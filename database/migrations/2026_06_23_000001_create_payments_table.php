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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('khqr_md5')->nullable()->index();
            $table->string('transaction_id')->nullable()->unique();
            $table->string('payment_status')->default('pending'); // pending, paid, failed
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
