<?php

namespace App\Support;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class Day
{
    /** Nama hari (format yang disimpan di DB) berdasarkan dayOfWeekIso: 1=Senin ... 7=Minggu. */
    public const NAMES = [
        1 => 'senin',
        2 => 'selasa',
        3 => 'rabu',
        4 => 'kamis',
        5 => 'jumat',
        6 => 'sabtu',
        7 => 'minggu',
    ];

    public static function name(?CarbonInterface $date = null): string
    {
        $date ??= Carbon::now();

        return self::NAMES[$date->dayOfWeekIso];
    }

    public static function today(): string
    {
        return self::name(Carbon::now());
    }
}
