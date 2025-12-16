<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BugReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BugReportController extends Controller
{
    public function index()
    {
        $reports = BugReport::with('user')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/BugReports/Index', [
            'reports' => $reports,
        ]);
    }

    public function update(Request $request, BugReport $bugReport)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,resolved,rejected',
            'admin_response' => 'nullable|string',
        ]);

        $data = [
            'status' => $request->status,
            'admin_response' => $request->admin_response,
        ];

        if ($request->status === 'resolved' && !$bugReport->resolved_at) {
            $data['resolved_at'] = now();
        }

        $bugReport->update($data);

        return redirect()->back()->with('success', 'Status laporan diperbarui.');
    }
}
