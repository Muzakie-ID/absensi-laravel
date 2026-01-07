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
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('subject_name')->nullable()->after('user_id');
            $table->string('class_name')->nullable()->after('subject_name');
            $table->time('schedule_start_time')->nullable()->after('class_name');
            $table->time('schedule_end_time')->nullable()->after('schedule_start_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['subject_name', 'class_name', 'schedule_start_time', 'schedule_end_time']);
        });
    }
};
