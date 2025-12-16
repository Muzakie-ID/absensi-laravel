<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['date', 'description', 'is_cuti'];

    protected $casts = [
        'date' => 'date',
        'is_cuti' => 'boolean',
    ];
}
