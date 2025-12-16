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
        Schema::create('allowed_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('identity_number')->unique(); // NIP atau NIS
            $table->string('name');
            $table->enum('role_type', ['teacher', 'student']);
            $table->boolean('is_registered')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allowed_registrations');
    }
};
