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
        Schema::create('picket_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['late', 'permission_leave', 'incident']);
            $table->string('student_name')->nullable();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->text('reason');
            $table->integer('points')->default(0);
            $table->time('time')->nullable(); // Waktu kejadian/datang/keluar
            $table->foreignId('reporter_id')->constrained('users'); // Petugas piket yang input
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picket_logs');
    }
};
