<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $holidays = Holiday::orderBy('date', 'desc')->get();
        $apiUrl = Setting::where('key', 'holiday_api_url')->value('value');

        return Inertia::render('Admin/Holidays/Index', [
            'holidays' => $holidays,
            'apiUrl' => $apiUrl
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'description' => 'required|string|max:255',
            'is_cuti' => 'boolean'
        ]);

        Holiday::create($request->all());

        return redirect()->back()->with('success', 'Hari libur berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Holiday $holiday)
    {
        $request->validate([
            'date' => 'required|date|unique:holidays,date,' . $holiday->id,
            'description' => 'required|string|max:255',
            'is_cuti' => 'boolean'
        ]);

        $holiday->update($request->all());

        return redirect()->back()->with('success', 'Hari libur berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return redirect()->back()->with('success', 'Hari libur berhasil dihapus.');
    }

    public function destroyAll()
    {
        Holiday::truncate();
        return redirect()->back()->with('success', 'Semua data hari libur berhasil dihapus.');
    }

    public function updateApiUrl(Request $request)
    {
        $request->validate([
            'api_url' => 'required|url'
        ]);

        Setting::updateOrCreate(
            ['key' => 'holiday_api_url'],
            ['value' => $request->api_url]
        );

        return redirect()->back()->with('success', 'URL API berhasil disimpan.');
    }

    public function sync()
    {
        $apiUrl = Setting::where('key', 'holiday_api_url')->value('value');

        if (!$apiUrl) {
            return redirect()->back()->with('error', 'URL API belum dikonfigurasi.');
        }

        try {
            $response = Http::get($apiUrl);
            
            if ($response->successful()) {
                $holidays = $response->json();
                $count = 0;

                foreach ($holidays as $h) {
                    // Validasi struktur data dari API
                    if (isset($h['tanggal']) && isset($h['keterangan'])) {
                        Holiday::updateOrCreate(
                            ['date' => $h['tanggal']],
                            [
                                'description' => $h['keterangan'],
                                'is_cuti' => $h['is_cuti'] ?? false
                            ]
                        );
                        $count++;
                    }
                }

                return redirect()->back()->with('success', "Berhasil sinkronisasi $count data hari libur.");
            } else {
                return redirect()->back()->with('error', 'Gagal mengambil data dari API. Status: ' . $response->status());
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage());
        }
    }
}
