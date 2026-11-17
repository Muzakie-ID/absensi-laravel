<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\TimeSlot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\SeedsSchoolData;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase, SeedsSchoolData;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seedSchoolData();
    }

    private function payload(array $overrides = []): array
    {
        return $overrides + [
            'status' => 'present',
            'photo' => UploadedFile::fake()->image('bukti.jpg'),
            'lat' => '-7.71',
            'long' => '110.01',
            'notes' => 'Materi bab 1',
        ];
    }

    public function test_teacher_can_attend_own_schedule_with_correct_time_snapshot(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 1);

        $this->actingAs($teacher)
            ->post(route('attendance.store', $schedule), $this->payload())
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $attendance = Attendance::sole();
        $this->assertSame($teacher->id, $attendance->user_id);
        // KBM ke-1 = period_order 2 (07:45 - 08:30), bukan period_order 1 (upacara)
        $this->assertStringStartsWith('07:45', $attendance->schedule_start_time);
        $this->assertStringStartsWith('08:30', $attendance->schedule_end_time);
        Storage::disk('public')->assertExists($attendance->photo_proof);
    }

    public function test_teacher_cannot_attend_another_teachers_schedule(): void
    {
        $owner = $this->userWithRole('teacher');
        $other = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($owner, 1);

        $this->actingAs($other)->get(route('attendance.create', $schedule))->assertForbidden();
        $this->actingAs($other)
            ->post(route('attendance.store', $schedule), $this->payload())
            ->assertForbidden();

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_teacher_cannot_attend_twice(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 1);

        $this->actingAs($teacher)->post(route('attendance.store', $schedule), $this->payload());
        $this->actingAs($teacher)
            ->post(route('attendance.store', $schedule), $this->payload(['status' => 'late']))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('message');

        $this->assertDatabaseCount('attendances', 1);
        $this->assertSame('present', Attendance::sole()->status);
    }

    public function test_teacher_cannot_attend_schedule_for_another_day(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 1, 'selasa');

        $this->actingAs($teacher)
            ->post(route('attendance.store', $schedule), $this->payload())
            ->assertSessionHas('error');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_teacher_cannot_attend_after_slot_ended(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 1);

        $this->travelTo(now()->setTime(8, 31));

        $this->actingAs($teacher)
            ->post(route('attendance.store', $schedule), $this->payload())
            ->assertSessionHas('error');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_time_window_check_also_works_with_numeric_mapping_source(): void
    {
        TimeSlot::where('mapping_source', 'kbm_1')->update(['mapping_source' => '1']);

        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 1);
        $this->travelTo(now()->setTime(8, 31));

        $this->actingAs($teacher)
            ->post(route('attendance.store', $schedule), $this->payload())
            ->assertSessionHas('error');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_student_dashboard_shows_subjects_with_kbm_prefixed_mapping(): void
    {
        $teacher = $this->userWithRole('teacher', ['name' => 'Pak Budi']);
        $this->scheduleFor($teacher, 1);
        $student = $this->userWithRole('student', ['school_class_id' => $this->class->id]);

        $this->actingAs($student)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('DashboardStudent')
                ->where('schedule.senin.1.subject', 'Matematika')
                ->where('schedule.senin.1.teacher', 'Pak Budi')
                ->where('schedule.senin.1.status', 'waiting')
            );
    }

    public function test_picket_override_uses_correct_time_snapshot(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher, 2);

        $this->actingAs($this->userWithRole('picket'))
            ->post(route('admin.monitoring.attendance'), [
                'schedule_id' => $schedule->id,
                'status' => 'sick',
            ])->assertRedirect();

        $attendance = Attendance::sole();
        // KBM ke-2 = period_order 3 (08:30 - 09:15)
        $this->assertStringStartsWith('08:30', $attendance->schedule_start_time);
        $this->assertStringStartsWith('09:15', $attendance->schedule_end_time);
    }
}
