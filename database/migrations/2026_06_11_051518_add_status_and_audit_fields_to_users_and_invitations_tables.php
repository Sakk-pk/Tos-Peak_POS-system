<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('Active')->after('is_team_member');
        });

        Schema::table('invitations', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('role');
            $table->foreignId('invited_by')->nullable()->constrained('users')->onDelete('set null')->after('accepted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('invitations', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['invited_by']);
            }
            $table->dropColumn(['status', 'invited_by']);
        });
    }
};
