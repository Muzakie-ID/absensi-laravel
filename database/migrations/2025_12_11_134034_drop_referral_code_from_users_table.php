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
        // Drop unique index terlebih dahulu agar kompatibel dengan SQLite (dipakai saat testing)
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['referral_code']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code')->nullable()->unique();
        });
    }
};
