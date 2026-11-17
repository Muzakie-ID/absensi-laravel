<?php

namespace Tests\Unit;

use App\Models\TimeSlot;
use PHPUnit\Framework\TestCase;

class TimeSlotSequenceTest extends TestCase
{
    public function test_parse_sequence_supports_both_formats(): void
    {
        $this->assertSame(1, TimeSlot::parseSequence('kbm_1'));
        $this->assertSame(12, TimeSlot::parseSequence('KBM_12'));
        $this->assertSame(3, TimeSlot::parseSequence('3'));
        $this->assertSame(3, TimeSlot::parseSequence(' 3 '));
    }

    public function test_parse_sequence_returns_null_for_non_learning_slots(): void
    {
        $this->assertNull(TimeSlot::parseSequence(null));
        $this->assertNull(TimeSlot::parseSequence(''));
        $this->assertNull(TimeSlot::parseSequence('fixed'));
        $this->assertNull(TimeSlot::parseSequence('kbm_'));
        $this->assertNull(TimeSlot::parseSequence('0'));
        $this->assertNull(TimeSlot::parseSequence('abc'));
    }
}
