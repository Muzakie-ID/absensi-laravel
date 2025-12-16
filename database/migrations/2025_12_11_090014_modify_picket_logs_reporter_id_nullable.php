<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('picket_logs', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['reporter_id']);
        });

        // Make column nullable using raw SQL to avoid doctrine/dbal dependency
        DB::statement('ALTER TABLE picket_logs MODIFY reporter_id BIGINT UNSIGNED NULL');

        Schema::table('picket_logs', function (Blueprint $table) {
            // Add new foreign key with nullOnDelete
            $table->foreign('reporter_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('picket_logs', function (Blueprint $table) {
            $table->dropForeign(['reporter_id']);
        });

        // Revert to not nullable
        // Warning: This will fail if there are NULL values.
        // We assume this is a rollback immediately after migration or data is clean.
        DB::statement('ALTER TABLE picket_logs MODIFY reporter_id BIGINT UNSIGNED NOT NULL');

        Schema::table('picket_logs', function (Blueprint $table) {
            $table->foreign('reporter_id')
                  ->references('id')
                  ->on('users');
        });
    }
};
