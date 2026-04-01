<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeacherSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_summary_returns_empty_when_no_attendance_records(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $teacherRole = Role::create(['name' => 'teacher']);

        $admin = User::factory()->create(['role_id' => $adminRole->id]);
        $teacher = User::factory()->create(['role_id' => $teacherRole->id]);

        $response = $this->actingAs($admin)->get(route('admin.teacher-summaries.show', [
            'user' => $teacher->id,
            'month' => 3,
            'year' => 2026,
        ]));

        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/TeacherSummary/Show')
            ->where('stats.total_schedules', 0)
            ->where('stats.present', 0)
            ->where('stats.late', 0)
            ->where('stats.permit', 0)
            ->where('stats.alpha', 0)
            ->where('stats.attendance_percentage', 0)
            ->where('journal', [])
            ->where('filters.month', 3)
            ->where('filters.year', 2026)
        );
    }
}
