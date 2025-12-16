<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = [
        'schedule_template_id',
        'day',
        'period_order',
        'activity_type_id',
        'start_time',
        'end_time',
        'mapping_source'
    ];

    protected $appends = ['type'];

    public function template()
    {
        return $this->belongsTo(ScheduleTemplate::class, 'schedule_template_id');
    }

    public function activityType()
    {
        return $this->belongsTo(ActivityType::class);
    }

    public function getTypeAttribute()
    {
        if (!$this->activityType) return 'other';
        
        $name = $this->activityType->name;
        
        if (stripos($name, 'KBM') !== false) return 'learning';
        if (stripos($name, 'Upacara') !== false) return 'ceremony';
        if (stripos($name, 'Istirahat') !== false) return 'break';
        if (stripos($name, 'Literasi') !== false) return 'literacy';
        
        return 'other';
    }
}
