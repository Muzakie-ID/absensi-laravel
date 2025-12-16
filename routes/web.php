<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\SchoolClassController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleTemplateController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\AnnouncementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Route Absensi
    Route::get('/attendance/history', [AttendanceController::class, 'history'])->name('attendance.history');
    Route::get('/attendance/{schedule}', [AttendanceController::class, 'create'])->name('attendance.create');
    Route::post('/attendance/{schedule}', [AttendanceController::class, 'store'])->name('attendance.store');

    // Admin Routes
    Route::get('admin/monitoring', [DashboardController::class, 'monitoring'])->name('admin.monitoring');
    Route::post('admin/monitoring/attendance', [DashboardController::class, 'updateAttendance'])->name('admin.monitoring.attendance');
    
    // Picket Routes
    Route::post('picket/logs', [\App\Http\Controllers\PicketController::class, 'storeLog'])->name('picket.logs.store');
    Route::post('picket/guests', [\App\Http\Controllers\PicketController::class, 'storeGuest'])->name('picket.guests.store');
    Route::post('picket/guests/{guestBook}/checkout', [\App\Http\Controllers\PicketController::class, 'checkoutGuest'])->name('picket.guests.checkout');
    Route::get('picket/search-schedule', [\App\Http\Controllers\PicketController::class, 'searchSchedule'])->name('picket.search-schedule');

    Route::resource('admin/classes', SchoolClassController::class)
        ->names('admin.classes')
        ->parameters(['classes' => 'school_class']);
    
    // Class Promotion
    Route::get('admin/class-promotions', [\App\Http\Controllers\Admin\ClassPromotionController::class, 'index'])->name('admin.class-promotions.index');
    Route::post('admin/class-promotions', [\App\Http\Controllers\Admin\ClassPromotionController::class, 'store'])->name('admin.class-promotions.store');
    Route::post('admin/class-promotions/level', [\App\Http\Controllers\Admin\ClassPromotionController::class, 'storeLevel'])->name('admin.class-promotions.store-level');

    Route::resource('admin/class-statuses', \App\Http\Controllers\Admin\ClassStatusController::class)->names('admin.class-statuses');
    Route::resource('admin/subjects', SubjectController::class)->names('admin.subjects');
    Route::resource('admin/users', UserController::class)->names('admin.users');
    Route::get('admin/teacher-summaries/{user}/export', [\App\Http\Controllers\Admin\TeacherSummaryController::class, 'export'])
        ->name('admin.teacher-summaries.export');
    Route::resource('admin/teacher-summaries', \App\Http\Controllers\Admin\TeacherSummaryController::class)
        ->parameters(['teacher-summaries' => 'user'])
        ->only(['index', 'show'])
        ->names('admin.teacher-summaries');
    Route::post('admin/allowed-registrations/check', [\App\Http\Controllers\Admin\AllowedRegistrationController::class, 'check'])->name('admin.allowed-registrations.check');
    Route::get('admin/allowed-registrations/export', [\App\Http\Controllers\Admin\AllowedRegistrationController::class, 'export'])->name('admin.allowed-registrations.export');
    Route::resource('admin/allowed-registrations', \App\Http\Controllers\Admin\AllowedRegistrationController::class)->names('admin.allowed-registrations');
    Route::resource('admin/activity-types', \App\Http\Controllers\Admin\ActivityTypeController::class)->names('admin.activity-types');
    
    // Holidays
    Route::post('admin/holidays/update-api', [\App\Http\Controllers\Admin\HolidayController::class, 'updateApiUrl'])->name('admin.holidays.update-api');
    Route::post('admin/holidays/sync', [\App\Http\Controllers\Admin\HolidayController::class, 'sync'])->name('admin.holidays.sync');
    Route::delete('admin/holidays/destroy-all', [\App\Http\Controllers\Admin\HolidayController::class, 'destroyAll'])->name('admin.holidays.destroy-all');
    Route::resource('admin/holidays', \App\Http\Controllers\Admin\HolidayController::class)->names('admin.holidays');

    // Schedule Templates
    Route::post('admin/schedule-templates/{schedule_template}/activate', [ScheduleTemplateController::class, 'activate'])->name('admin.schedule-templates.activate');
    Route::resource('admin/schedule-templates', ScheduleTemplateController::class)->names('admin.schedule-templates');
    
    // Time Slots (Nested)
    Route::post('admin/schedule-templates/{schedule_template}/time-slots', [ScheduleTemplateController::class, 'storeTimeSlot'])->name('admin.schedule-templates.time-slots.store');
    Route::put('admin/schedule-templates/{schedule_template}/time-slots/{time_slot}', [ScheduleTemplateController::class, 'updateTimeSlot'])->name('admin.schedule-templates.time-slots.update');
    Route::delete('admin/schedule-templates/{schedule_template}/time-slots/{time_slot}', [ScheduleTemplateController::class, 'destroyTimeSlot'])->name('admin.schedule-templates.time-slots.destroy');

    // Master Schedule
    Route::get('admin/schedules', [ScheduleController::class, 'index'])->name('admin.schedules.index');
    Route::get('admin/schedules/{school_class}/edit', [ScheduleController::class, 'edit'])->name('admin.schedules.edit');
    Route::put('admin/schedules/{school_class}', [ScheduleController::class, 'update'])->name('admin.schedules.update');

    // Learning Progress
    Route::get('admin/learning-progress', [\App\Http\Controllers\Admin\LearningProgressController::class, 'index'])->name('admin.learning-progress.index');

    // Announcements
    Route::resource('admin/announcements', AnnouncementController::class)->names('admin.announcements');

    // Bug Reports (Admin)
    Route::resource('admin/bug-reports', \App\Http\Controllers\Admin\BugReportController::class)
        ->only(['index', 'update'])
        ->names('admin.bug-reports');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Bug Reports (User)
    Route::resource('bug-reports', \App\Http\Controllers\BugReportController::class)
        ->only(['index', 'store'])
        ->names('bug-reports');
});

require __DIR__.'/auth.php';
