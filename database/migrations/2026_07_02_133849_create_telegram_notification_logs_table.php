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
        Schema::create('telegram_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('low_stock');
            $table->text('message');
            $table->string('status')->default('pending'); // pending, sent, failed
            $table->text('error_message')->nullable();
            $table->integer('retries')->default(0);
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_notification_logs');
    }
};
