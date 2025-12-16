<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PicketLog extends Model
{
    protected $fillable = [
        'type',
        'student_name',
        'class_id',
        'reason',
        'points',
        'time',
        'reporter_id'
    ];

    protected $casts = [
        'time' => 'datetime:H:i',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
