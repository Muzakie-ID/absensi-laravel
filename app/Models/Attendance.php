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

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
