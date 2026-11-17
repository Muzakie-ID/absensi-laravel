<?php

namespace Tests\Concerns;

use App\Models\ActivityType;
use App\Models\ClassStatus;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\ScheduleTemplate;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Data minimal sekolah untuk feature test.
 * Waktu dibekukan di Senin, 16 Nov 2026 pukul 07:50 (jam KBM ke-1 sedang berlangsung).
 */
trait SeedsSchoolData
{
    protected array $roles = [];
    protected SchoolClass $class;
    protected Subject $subject;
    protected ScheduleTemplate $template;

    protected function seedSchoolData(): void
    {
        $this->travelTo(Carbon::parse('2026-11-16 07:50:00', 'Asia/Jakarta'));

        foreach (['admin', 'teacher', 'picket', 'student'] as $name) {
            $this->roles[$name] = Role::firstOrCreate(['name' => $name]);
        }

        $active = ClassStatus::create(['name' => 'Aktif', 'code' => 'active']);
        $this->class = SchoolClass::create(['name' => 'X RPL 1', 'class_status_id' => $active->id]);
        $this->subject = Subject::create(['name' => 'Matematika']);

        $ceremony = ActivityType::create(['name' => 'Upacara']);
        $kbm = ActivityType::create(['name' => 'KBM']);

        $this->template = ScheduleTemplate::create(['name' => 'Reguler', 'is_active' => true]);

        // period_order 1 = upacara, sehingga KBM ke-1 ada di period_order 2.
        $this->slot(1, $ceremony, '07:00', '07:45', 'fixed');
        $this->slot(2, $kbm, '07:45', '08:30', 'kbm_1');
        $this->slot(3, $kbm, '08:30', '09:15', 'kbm_2');
    }

    protected function slot(int $order, ActivityType $type, string $start, string $end, ?string $mapping, string $day = 'senin'): TimeSlot
    {
        return TimeSlot::create([
            'schedule_template_id' => $this->template->id,
            'day' => $day,
            'period_order' => $order,
            'activity_type_id' => $type->id,
            'start_time' => $start,
            'end_time' => $end,
            'mapping_source' => $mapping,
        ]);
    }

    protected function userWithRole(string $role, array $attributes = []): User
    {
        return User::factory()->create(['role_id' => $this->roles[$role]->id] + $attributes);
    }

    protected function scheduleFor(User $teacher, int $sequence = 1, string $day = 'senin'): Schedule
    {
        return Schedule::create([
            'user_id' => $teacher->id,
            'subject_id' => $this->subject->id,
            'class_id' => $this->class->id,
            'day' => $day,
            'learning_sequence' => $sequence,
        ]);
    }
}
