<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduleTemplate;
use App\Models\TimeSlot;
use App\Models\ActivityType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ScheduleTemplateController extends Controller
{
    public function index()
    {
        $templates = ScheduleTemplate::withCount('timeSlots')->get();
        return Inertia::render('Admin/ScheduleTemplates/Index', [
            'templates' => $templates
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        ScheduleTemplate::create([
            'name' => $request->name,
            'is_active' => false
        ]);

        return redirect()->back()->with('success', 'Template berhasil dibuat.');
    }

    public function show(ScheduleTemplate $scheduleTemplate)
    {
        // Load time slots grouped by day
        $timeSlots = $scheduleTemplate->timeSlots()
            ->with('activityType')
            ->orderBy('day') // Note: This might need custom sorting for days
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        $activityTypes = ActivityType::all();

        return Inertia::render('Admin/ScheduleTemplates/Show', [
            'template' => $scheduleTemplate,
            'timeSlots' => $timeSlots,
            'activityTypes' => $activityTypes
        ]);
    }

    public function update(Request $request, ScheduleTemplate $scheduleTemplate)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $scheduleTemplate->update($request->only('name'));

        return redirect()->back()->with('success', 'Template berhasil diperbarui.');
    }

    public function destroy(ScheduleTemplate $scheduleTemplate)
    {
        if ($scheduleTemplate->is_active) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus template yang sedang aktif.');
        }
        
        $scheduleTemplate->delete();
        return redirect()->route('admin.schedule-templates.index')->with('success', 'Template berhasil dihapus.');
    }

    public function activate(ScheduleTemplate $scheduleTemplate)
    {
        DB::transaction(function () use ($scheduleTemplate) {
            ScheduleTemplate::query()->update(['is_active' => false]);
            $scheduleTemplate->update(['is_active' => true]);
        });

        return redirect()->back()->with('success', 'Template berhasil diaktifkan.');
    }

    // Time Slot Management
    public function storeTimeSlot(Request $request, ScheduleTemplate $scheduleTemplate)
    {
        $request->validate([
            'day' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'period_order' => 'required|integer',
            'activity_type_id' => 'required|exists:activity_types,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'mapping_source' => 'nullable|string'
        ]);

        $scheduleTemplate->timeSlots()->create($request->all());

        return redirect()->back()->with('success', 'Slot waktu berhasil ditambahkan.');
    }

    public function updateTimeSlot(Request $request, ScheduleTemplate $scheduleTemplate, TimeSlot $timeSlot)
    {
        $request->validate([
            'day' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'period_order' => 'required|integer',
            'activity_type_id' => 'required|exists:activity_types,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'mapping_source' => 'nullable|string'
        ]);

        $timeSlot->update($request->all());

        return redirect()->back()->with('success', 'Slot waktu berhasil diperbarui.');
    }

    public function destroyTimeSlot(ScheduleTemplate $scheduleTemplate, TimeSlot $timeSlot)
    {
        $timeSlot->delete();
        return redirect()->back()->with('success', 'Slot waktu berhasil dihapus.');
    }

    public function destroyAllTimeSlots(Request $request, ScheduleTemplate $scheduleTemplate)
    {
        $request->validate([
            'day' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
        ]);

        $scheduleTemplate->timeSlots()->where('day', $request->day)->delete();

        return redirect()->back()->with('success', 'Semua slot waktu pada hari ' . $request->day . ' berhasil dihapus.');
    }

    public function copyTimeSlots(Request $request, ScheduleTemplate $scheduleTemplate)
    {
        $request->validate([
            'from_day' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'to_days' => 'required|array',
            'to_days.*' => 'in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
        ]);

        $sourceSlots = $scheduleTemplate->timeSlots()->where('day', $request->from_day)->get();

        if ($sourceSlots->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada slot waktu pada hari sumber.');
        }

        DB::transaction(function () use ($scheduleTemplate, $sourceSlots, $request) {
            foreach ($request->to_days as $targetDay) {
                if ($targetDay === $request->from_day) continue;

                // Hapus slot lama di hari target
                $scheduleTemplate->timeSlots()->where('day', $targetDay)->delete();

                foreach ($sourceSlots as $slot) {
                    $newSlot = $slot->replicate();
                    $newSlot->day = $targetDay;
                    $newSlot->schedule_template_id = $scheduleTemplate->id;
                    $newSlot->save();
                }
            }
        });

        return redirect()->back()->with('success', 'Slot waktu berhasil disalin.');
    }
}
