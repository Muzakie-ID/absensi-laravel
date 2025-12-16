<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleTemplate extends Model
{
    protected $fillable = ['name', 'is_active'];

    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class);
    }
}
