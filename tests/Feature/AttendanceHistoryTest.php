<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\SeedsSchoolData;
use Tests\TestCase;

class AttendanceHistoryTest extends TestCase
{
    use RefreshDatabase, SeedsSchoolData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedSchoolData();
    }

    private function attend(Schedule $schedule, string $status = 'present'): Attendance
    {
        return Attendance::create([
            'schedule_id' => $schedule->id,
            'user_id' => $schedule->user_id,
            'status' => $status,
            'subject_name' => $this->subject->name,
            'class_name' => $this->class->name,
            'location_lat' => '0',
            'location_long' => '0',
        ]);
    }

    private function updateSchedule(array $row): void
    {
        $this->actingAs($this->userWithRole('admin'))
            ->put(route('admin.schedules.update', $this->class), [
                'schedules' => [$row + ['day' => 'senin', 'learning_sequence' => 1]],
            ])->assertRedirect();
    }

    public function test_clearing_schedule_keeps_attendance_history(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher);
        $attendance = $this->attend($schedule);

        $this->updateSchedule(['subject_id' => null, 'user_id' => null]);

        $this->assertSoftDeleted($schedule);
        $this->assertNotNull($attendance->fresh());
        $this->assertSame($schedule->id, $attendance->fresh()->schedule->id);
    }

    public function test_changing_teacher_keeps_old_attendance_on_old_teacher(): void
    {
        $oldTeacher = $this->userWithRole('teacher');
        $newTeacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($oldTeacher);
        $attendance = $this->attend($schedule);

        $this->updateSchedule(['subject_id' => $this->subject->id, 'user_id' => $newTeacher->id]);

        // Jadwal lama tetap milik guru lama (soft deleted), jadwal baru untuk guru baru
        $this->assertSoftDeleted($schedule);
        $this->assertSame($oldTeacher->id, $attendance->fresh()->schedule->user_id);

        $active = Schedule::where('class_id', $this->class->id)->sole();
        $this->assertSame($newTeacher->id, $active->user_id);
        $this->assertNotSame($schedule->id, $active->id);
    }

    public function test_changing_teacher_without_attendance_updates_in_place(): void
    {
        $schedule = $this->scheduleFor($this->userWithRole('teacher'));
        $newTeacher = $this->userWithRole('teacher');

        $this->updateSchedule(['subject_id' => $this->subject->id, 'user_id' => $newTeacher->id]);

        $this->assertSame($newTeacher->id, $schedule->fresh()->user_id);
        $this->assertSame(1, Schedule::withTrashed()->count());
    }

    public function test_unchanged_schedule_is_not_recreated(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher);
        $this->attend($schedule);

        $this->updateSchedule(['subject_id' => $this->subject->id, 'user_id' => $teacher->id]);

        $this->assertNotSoftDeleted($schedule);
        $this->assertSame(1, Schedule::withTrashed()->count());
    }

    public function test_hard_deleting_class_keeps_attendance_with_snapshot(): void
    {
        $schedule = $this->scheduleFor($this->userWithRole('teacher'));
        $attendance = $this->attend($schedule, 'sick');

        $this->class->delete();

        $fresh = $attendance->fresh();
        $this->assertNotNull($fresh);
        $this->assertNull($fresh->schedule_id);
        $this->assertSame('X RPL 1', $fresh->class_name);
    }

    public function test_dashboards_render_attendance_without_schedule(): void
    {
        $schedule = $this->scheduleFor($this->userWithRole('teacher'));
        $this->attend($schedule, 'sick');
        $this->class->delete();

        $this->actingAs($this->userWithRole('admin'))->get(route('dashboard'))->assertOk();
        $this->actingAs($this->userWithRole('picket'))->get(route('admin.monitoring'))->assertOk();
    }

    public function test_teacher_summary_counts_replaced_schedule_only_while_it_was_active(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher);
        $schedule->forceFill(['created_at' => '2026-10-01 00:00:00'])->save();

        // Senin 2 Nov: hadir. Senin 9 Nov: tidak absen. Jadwal diganti 10 Nov.
        $attendance = $this->attend($schedule);
        $attendance->forceFill(['created_at' => '2026-11-02 07:50:00', 'check_in_time' => '2026-11-02 07:50:00'])->save();

        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-10 10:00:00'));
        $schedule->delete();
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-30 10:00:00'));

        $this->actingAs($this->userWithRole('admin'))
            ->get(route('admin.teacher-summaries.show', ['user' => $teacher->id, 'month' => 11, 'year' => 2026]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                // 2 Nov & 9 Nov dihitung; 16, 23, 30 Nov tidak (jadwal sudah diganti)
                ->where('stats.total_schedules', 2)
                ->where('stats.present', 1)
                ->where('stats.alpha', 1)
            );
    }

    public function test_soft_deleted_schedule_cannot_be_attended(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher);
        $schedule->delete();

        $this->actingAs($teacher)->get(route('attendance.create', $schedule->id))->assertNotFound();
    }
}
