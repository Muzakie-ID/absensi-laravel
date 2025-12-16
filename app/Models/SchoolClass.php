<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $table = 'classes';
    protected $fillable = ['name', 'level', 'class_status_id'];

    public function classStatus()
    {
        return $this->belongsTo(ClassStatus::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'class_id');
    }

    public function students()
    {
        return $this->hasMany(AllowedRegistration::class, 'school_class_id');
    }
}
