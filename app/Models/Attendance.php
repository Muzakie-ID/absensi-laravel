<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'schedule_id',
        'user_id',
        'status',
        'notes',
        'photo_proof',
        'location_lat',
        'location_long',
        'check_in_time',
        'subject_name',
        'class_name',
        'schedule_start_time',
        'schedule_end_time'
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
    ];

    /**
     * Jadwal asal absensi. Termasuk jadwal yang sudah di-soft-delete agar
     * riwayat tetap menampilkan guru/kelas/mapel yang sebenarnya.
     * Bisa null jika kelas/mapel/jadwal dihapus permanen; gunakan kolom snapshot.
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
