<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllowedRegistration extends Model
{
    protected $fillable = [
        'identity_number', 
        'name', 
        'role_type', 
        'is_registered', 
        'school_class_id',
        'registration_code'
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->registration_code)) {
                $model->registration_code = self::generateUniqueCode();
            }
        });
    }

    public static function generateUniqueCode()
    {
        do {
            $code = \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
        } while (self::where('registration_code', $code)->exists());
        
        return $code;
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }
}
