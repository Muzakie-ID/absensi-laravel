<?php

namespace App\Http\Controllers;

use App\Models\BugReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BugReportController extends Controller
{
    public function index()
    {
        $reports = BugReport::where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('BugReports/Index', [
            'reports' => $reports,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'nullable|string',
            'screenshot' => 'nullable|image|max:2048', // Max 2MB
            'priority' => 'required|in:low,medium,high,critical',
        ]);

        $path = null;
        if ($request->hasFile('screenshot')) {
            $path = $request->file('screenshot')->store('bug-reports', 'public');
        }

        BugReport::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'url' => $request->url,
            'screenshot_path' => $path,
            'priority' => $request->priority,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dikirim.');
    }
}
