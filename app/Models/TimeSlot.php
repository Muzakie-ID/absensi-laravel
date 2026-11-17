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

    /**
     * Ambil urutan KBM (learning_sequence) dari mapping_source.
     * Mendukung format 'kbm_1' maupun '1'. Mengembalikan null untuk slot
     * non-KBM ('fixed', kosong, atau format tidak dikenal).
     */
    public static function parseSequence(?string $mappingSource): ?int
    {
        if ($mappingSource === null) {
            return null;
        }

        if (preg_match('/^\s*(?:kbm_)?(\d+)\s*$/i', $mappingSource, $m)) {
            $sequence = (int) $m[1];
            return $sequence > 0 ? $sequence : null;
        }

        return null;
    }

    public function getLearningSequenceAttribute(): ?int
    {
        return static::parseSequence($this->mapping_source);
    }

    /**
     * Filter slot yang dipetakan ke urutan KBM tertentu (format 'kbm_N' atau 'N').
     */
    public function scopeForSequence($query, int $sequence)
    {
        return $query->whereIn('mapping_source', ['kbm_' . $sequence, (string) $sequence]);
    }

    /**
     * Cari slot waktu di template aktif untuk hari & urutan KBM tertentu.
     */
    public static function findActiveFor(string $day, int $sequence): ?self
    {
        $activeTemplate = ScheduleTemplate::where('is_active', true)->first();
        if (!$activeTemplate) {
            return null;
        }

        return static::where('schedule_template_id', $activeTemplate->id)
            ->where('day', $day)
            ->forSequence($sequence)
            ->first();
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
