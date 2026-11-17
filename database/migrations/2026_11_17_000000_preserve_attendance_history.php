<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menjaga riwayat absensi agar tidak ikut terhapus saat jadwal diubah/dihapus:
 * 1. Isi kolom snapshot (subject_name, class_name) untuk data absensi lama yang masih kosong.
 * 2. Jadwal memakai soft delete (kolom deleted_at).
 * 3. FK attendances.schedule_id diubah dari CASCADE menjadi SET NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Backfill snapshot untuk absensi lama sebelum ada kolom snapshot
        DB::table('attendances')
            ->whereNotNull('schedule_id')
            ->where(function ($q) {
                $q->whereNull('subject_name')->orWhereNull('class_name');
            })
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                $schedules = DB::table('schedules')
                    ->leftJoin('subjects', 'subjects.id', '=', 'schedules.subject_id')
                    ->leftJoin('classes', 'classes.id', '=', 'schedules.class_id')
                    ->whereIn('schedules.id', $rows->pluck('schedule_id')->unique())
                    ->get(['schedules.id', 'subjects.name as subject_name', 'classes.name as class_name'])
                    ->keyBy('id');

                foreach ($rows as $row) {
                    $schedule = $schedules[$row->schedule_id] ?? null;
                    if (!$schedule) {
                        continue;
                    }

                    DB::table('attendances')->where('id', $row->id)->update([
                        'subject_name' => $row->subject_name ?? $schedule->subject_name,
                        'class_name' => $row->class_name ?? $schedule->class_name,
                    ]);
                }
            });

        // 2. Soft delete untuk jadwal
        Schema::table('schedules', function (Blueprint $table) {
            $table->softDeletes();
        });

        // 3. CASCADE -> SET NULL
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->unsignedBigInteger('schedule_id')->nullable()->change();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->foreign('schedule_id')->references('id')->on('schedules')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
        });

        // Absensi tanpa jadwal tidak bisa dikembalikan ke kolom NOT NULL
        DB::table('attendances')->whereNull('schedule_id')->delete();

        Schema::table('attendances', function (Blueprint $table) {
            $table->unsignedBigInteger('schedule_id')->nullable(false)->change();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->foreign('schedule_id')->references('id')->on('schedules')->cascadeOnDelete();
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
