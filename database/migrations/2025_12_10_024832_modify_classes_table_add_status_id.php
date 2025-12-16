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
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('class_status_id')->nullable()->after('name')->constrained()->onDelete('set null');
        });

        // Migrate existing data
        $statuses = \App\Models\ClassStatus::all()->pluck('id', 'code');
        
        \App\Models\SchoolClass::chunk(100, function ($classes) use ($statuses) {
            foreach ($classes as $class) {
                // Assuming the old status column is still accessible via raw query or if model still has it
                // But since we haven't dropped it yet, we can access it.
                // However, Eloquent might not see it if we removed it from fillable/casts, but raw DB update is safer here.
                $status = $class->getOriginal('status'); // or just $class->status if not casted
                if (isset($statuses[$status])) {
                    $class->class_status_id = $statuses[$status];
                    $class->save();
                }
            }
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->enum('status', ['active', 'internship', 'inactive'])->default('active')->after('name');
        });

        // Revert data migration (approximate)
        $statuses = \App\Models\ClassStatus::all()->pluck('code', 'id');
        
        \App\Models\SchoolClass::chunk(100, function ($classes) use ($statuses) {
            foreach ($classes as $class) {
                if ($class->class_status_id && isset($statuses[$class->class_status_id])) {
                    $class->status = $statuses[$class->class_status_id];
                    $class->save();
                }
            }
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['class_status_id']);
            $table->dropColumn('class_status_id');
        });
    }
};
