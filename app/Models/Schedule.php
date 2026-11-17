<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    // Jadwal yang dihapus/diganti tetap disimpan agar riwayat absensi tidak hilang
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'subject_id',
        'class_id',
        'day',
        'learning_sequence'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
