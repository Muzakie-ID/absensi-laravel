<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\ClassStatus;
use App\Models\Holiday;
use App\Models\ScheduleTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\SeedsSchoolData;
use Tests\TestCase;

class AutoAlphaTest extends TestCase
{
    use RefreshDatabase, SeedsSchoolData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedSchoolData();
        $this->travelTo(now()->setTime(23, 10));
    }

    public function test_generates_alpha_for_missing_attendance_with_correct_snapshot(): void
    {
        $teacher = $this->userWithRole('teacher');
        $this->scheduleFor($teacher, 2);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $alpha = Attendance::sole();
        $this->assertSame('alpha', $alpha->status);
        $this->assertSame($teacher->id, $alpha->user_id);
        $this->assertStringStartsWith('08:30', $alpha->schedule_start_time);
    }

    public function test_does_not_duplicate_existing_attendance(): void
    {
        $schedule = $this->scheduleFor($this->userWithRole('teacher'), 1);
        Attendance::create([
            'schedule_id' => $schedule->id,
            'user_id' => $schedule->user_id,
            'status' => 'present',
        ]);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();
        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(1, Attendance::count());
        $this->assertSame('present', Attendance::sole()->status);
    }

    public function test_skips_holidays(): void
    {
        $this->scheduleFor($this->userWithRole('teacher'), 1);
        Holiday::create(['date' => now()->toDateString(), 'description' => 'Libur Nasional']);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }

    public function test_skips_inactive_classes(): void
    {
        $internship = ClassStatus::create(['name' => 'PKL', 'code' => 'internship']);
        $this->class->update(['class_status_id' => $internship->id]);
        $this->scheduleFor($this->userWithRole('teacher'), 1);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }

    public function test_skips_sequence_without_time_slot_in_active_template(): void
    {
        // Template hanya punya KBM 1 & 2; KBM 5 tidak ada hari ini
        $this->scheduleFor($this->userWithRole('teacher'), 5);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }

    public function test_skips_when_no_active_template(): void
    {
        ScheduleTemplate::query()->update(['is_active' => false]);
        $this->scheduleFor($this->userWithRole('teacher'), 1);

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }

    public function test_skips_soft_deleted_schedules(): void
    {
        $this->scheduleFor($this->userWithRole('teacher'), 1)->delete();

        $this->artisan('attendance:auto-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }
}
