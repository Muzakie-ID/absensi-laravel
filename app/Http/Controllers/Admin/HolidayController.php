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
            'api_url' => 'required|string'
        ]);

        Setting::updateOrCreate(
            ['key' => 'holiday_api_url'],
            ['value' => $request->api_url]
        );

        return redirect()->back()->with('success', 'URL API berhasil disimpan.');
    }

    public function sync()
    {
        $apiUrlsParam = Setting::where('key', 'holiday_api_url')->value('value');

        if (!$apiUrlsParam) {
            return redirect()->back()->with('error', 'URL API belum dikonfigurasi.');
        }

        // Pisahkan URL berdasarkan koma atau baris baru atau spasi
        $apiUrls = preg_split('/[\s,]+/', trim($apiUrlsParam));
        $success = false;
        $count = 0;
        $errorMessages = [];

        foreach ($apiUrls as $apiUrl) {
            $apiUrl = trim($apiUrl);
            if (empty($apiUrl)) continue;

            try {
                // Timeout 10 detik per URL agar tidak menunggu terlalu lama jika API mati
                $response = Http::timeout(10)->get($apiUrl);

                if ($response->successful()) {
                    $responseData = $response->json();
                    
                    // Cek lokasi array data (bisa langsung array atau di dalam key 'data')
                    $holidays = (isset($responseData['data']) && is_array($responseData['data'])) 
                        ? $responseData['data'] 
                        : (is_array($responseData) ? $responseData : null);

                    if ($holidays !== null) {
                        foreach ($holidays as $h) {
                            // Cek kemungkinan key untuk format tanggal dan keterangan dari berbagai API
                            $date = $h['tanggal'] ?? $h['date'] ?? null;
                            $desc = $h['keterangan'] ?? $h['description'] ?? $h['name'] ?? null;

                            if ($date && $desc) {
                                // Default is_cuti berdasarkan text description jika key is_cuti tidak ada
                                $isCuti = isset($h['is_cuti']) 
                                    ? filter_var($h['is_cuti'], FILTER_VALIDATE_BOOLEAN) 
                                    : (stripos($desc, 'cuti') !== false);

                                Holiday::updateOrCreate(
                                    ['date' => $date],
                                    [
                                        'description' => $desc,
                                        'is_cuti' => $isCuti
                                    ]
                                );
                                $count++;
                            }
                        }
                        
                        if ($count > 0 || count($holidays) === 0) {
                            $success = true;
                            // Berhasil mendapatkan list yg valid (bahkan jika kosong), hentikan pencarian backup
                            break;
                        }
                    } else {
                        $errorMessages[] = "Format API $apiUrl tidak valid (Bukan array).";
                    }
                } else {
                    $errorMessages[] = "$apiUrl (Status: " . $response->status() . ")";
                }
            } catch (\Exception $e) {
                // Catat error URL ini namun lanjutkan ke iterasi backup URL berikutnya
                $errorMessages[] = "$apiUrl (Error: " . $e->getMessage() . ")";
            }
        }

        if ($success) {
            return redirect()->back()->with('success', "Berhasil sinkronisasi $count data hari libur dari salah satu API aktif.");
        } else {
            return redirect()->back()->with('error', 'Gagal mengambil data dari SEMUA API! Detail: ' . implode(', ', $errorMessages));
}
