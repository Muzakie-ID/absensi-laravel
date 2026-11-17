<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\SeedsSchoolData;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase, SeedsSchoolData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedSchoolData();
    }

    public function test_non_admin_cannot_access_admin_pages(): void
    {
        foreach (['teacher', 'picket', 'student'] as $role) {
            $user = $this->userWithRole($role);

            $this->actingAs($user)->get(route('admin.users.index'))->assertForbidden();
            $this->actingAs($user)->get(route('admin.schedules.index'))->assertForbidden();
            $this->actingAs($user)->get(route('admin.holidays.index'))->assertForbidden();
        }
    }

    public function test_admin_can_access_admin_pages(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)->get(route('admin.users.index'))->assertOk();
    }

    public function test_student_cannot_create_admin_account_or_promote_self(): void
    {
        $student = $this->userWithRole('student');

        $this->actingAs($student)->post(route('admin.users.store'), [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'role_id' => $this->roles['admin']->id,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertForbidden();

        $this->actingAs($student)->put(route('admin.users.update', $student), [
            'name' => $student->name,
            'email' => $student->email,
            'role_id' => $this->roles['admin']->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'hacker@example.com']);
        $this->assertSame($this->roles['student']->id, $student->fresh()->role_id);
    }

    public function test_student_cannot_delete_all_holidays(): void
    {
        $this->actingAs($this->userWithRole('student'))
            ->delete(route('admin.holidays.destroy-all'))
            ->assertForbidden();
    }

    public function test_monitoring_requires_picket_access(): void
    {
        $teacher = $this->userWithRole('teacher');
        $this->actingAs($teacher)->get(route('admin.monitoring'))->assertForbidden();
        $this->actingAs($this->userWithRole('student'))->get(route('admin.monitoring'))->assertForbidden();

        // Guru yang terjadwal piket hari ini (Senin) boleh akses
        $teacher->picketSchedules()->create(['day' => 'senin']);
        $this->actingAs($teacher)->get(route('admin.monitoring'))->assertOk();

        $this->actingAs($this->userWithRole('picket'))->get(route('admin.monitoring'))->assertOk();
        $this->actingAs($this->userWithRole('admin'))->get(route('admin.monitoring'))->assertOk();
    }

    public function test_picket_actions_require_picket_access(): void
    {
        $guest = [
            'name' => 'Tamu',
            'meet_who' => 'Kepala Sekolah',
            'purpose' => 'Rapat',
        ];

        $this->actingAs($this->userWithRole('teacher'))
            ->post(route('picket.guests.store'), $guest)
            ->assertForbidden();
        $this->assertDatabaseCount('guest_books', 0);

        $this->actingAs($this->userWithRole('picket'))
            ->post(route('picket.guests.store'), $guest)
            ->assertRedirect();
        $this->assertDatabaseCount('guest_books', 1);
    }

    public function test_teacher_cannot_override_attendance_via_monitoring(): void
    {
        $teacher = $this->userWithRole('teacher');
        $schedule = $this->scheduleFor($teacher);

        $this->actingAs($teacher)->post(route('admin.monitoring.attendance'), [
            'schedule_id' => $schedule->id,
            'status' => 'present',
        ])->assertForbidden();

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_scheduler_endpoint_disabled_without_cron_key(): void
    {
        config(['app.cron_key' => null]);
        $this->get('/scheduler/run?key=default-cron-secret')->assertNotFound();
        $this->get('/scheduler/run')->assertNotFound();
    }

    public function test_scheduler_endpoint_rejects_wrong_key(): void
    {
        config(['app.cron_key' => 'kunci-rahasia-panjang']);
        $this->get('/scheduler/run?key=salah')->assertForbidden();
        $this->get('/scheduler/run')->assertForbidden();
        $this->get('/scheduler/run?key=kunci-rahasia-panjang')->assertOk();
    }
}
