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
        Schema::create('class_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // active, internship, inactive
            $table->string('color')->default('gray'); // green, yellow, red, etc. (Tailwind color name)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_statuses');
    }
};
