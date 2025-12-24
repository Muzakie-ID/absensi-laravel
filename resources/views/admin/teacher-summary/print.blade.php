<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Kinerja Guru - {{ $user->name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 1cm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body class="bg-white text-gray-900 p-8">

    <!-- Header Laporan -->
    <div class="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 class="text-2xl font-bold uppercase">Laporan Kinerja Guru</h1>
        <h2 class="text-xl font-semibold">SMK Batik Perbaik Purworejo</h2>
        <p class="text-sm text-gray-600">Periode: {{ \Carbon\Carbon::createFromDate($filters['year'], $filters['month'], 1)->translatedFormat('F Y') }}</p>
    </div>

    <!-- Profil Guru -->
    <div class="mb-8">
        <table class="w-full text-sm">
            <tr>
                <td class="w-32 font-semibold">Nama Guru</td>
                <td class="w-4">:</td>
                <td>{{ $user->name }}</td>
                <td class="w-32 font-semibold">NIP</td>
                <td class="w-4">:</td>
                <td>{{ $user->identity_number ?? '-' }}</td>
            </tr>
            <tr>
                <td class="font-semibold">Email</td>
                <td>:</td>
                <td>{{ $user->email }}</td>
                <td class="font-semibold">Dicetak Tanggal</td>
                <td>:</td>
                <td>{{ now()->translatedFormat('d F Y') }}</td>
            </tr>
        </table>
    </div>

    <!-- Ringkasan Kinerja -->
    <div class="mb-8">
        <h3 class="text-lg font-bold mb-4 border-b border-gray-300 pb-1">Ringkasan Kinerja</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
            <div class="border p-4 rounded bg-gray-50">
                <div class="text-xs text-gray-500 uppercase">Persentase Kehadiran</div>
                <div class="text-xl font-bold">{{ $stats['attendance_percentage'] }}%</div>
            </div>
            <div class="border p-4 rounded bg-gray-50">
                <div class="text-xs text-gray-500 uppercase">Izin / Sakit</div>
                <div class="text-xl font-bold">{{ $stats['permit'] }}</div>
            </div>
            <div class="border p-4 rounded bg-gray-50">
                <div class="text-xs text-gray-500 uppercase">Alpha</div>
                <div class="text-xl font-bold">{{ $stats['alpha'] }}</div>
            </div>
        </div>
    </div>

    <!-- Jurnal Mengajar -->
    <div>
        <h3 class="text-lg font-bold mb-4 border-b border-gray-300 pb-1">Detail Jurnal Mengajar</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-2 py-2 text-left">Tanggal</th>
                    <th class="border border-gray-300 px-2 py-2 text-left">Kelas & Mapel</th>
                    <th class="border border-gray-300 px-2 py-2 text-center">Jadwal</th>
                    <th class="border border-gray-300 px-2 py-2 text-center">Scan Masuk</th>
                    <th class="border border-gray-300 px-2 py-2 text-center">Status</th>
                    <th class="border border-gray-300 px-2 py-2 text-center">Ket.</th>
                </tr>
            </thead>
            <tbody>
                @forelse($journal as $item)
                    <tr class="{{ $loop->even ? 'bg-gray-50' : '' }}">
                        <td class="border border-gray-300 px-2 py-2">
                            <div class="font-semibold">{{ $item['day'] }}</div>
                            <div class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
                        </td>
                        <td class="border border-gray-300 px-2 py-2">
                            <div class="font-semibold">{{ $item['class'] }}</div>
                            <div class="text-xs">{{ $item['subject'] }}</div>
                        </td>
                        <td class="border border-gray-300 px-2 py-2 text-center">{{ $item['schedule_time'] }}</td>
                        <td class="border border-gray-300 px-2 py-2 text-center">{{ $item['check_in'] ?? '-' }}</td>
                        <td class="border border-gray-300 px-2 py-2 text-center">
                            <span class="px-2 py-1 rounded text-xs font-bold 
                                {{ $item['display']['color'] === 'green' ? 'bg-green-100 text-green-800' : '' }}
                                {{ $item['display']['color'] === 'yellow' ? 'bg-yellow-100 text-yellow-800' : '' }}
                                {{ $item['display']['color'] === 'red' ? 'bg-red-100 text-red-800' : '' }}
                                {{ $item['display']['color'] === 'blue' ? 'bg-blue-100 text-blue-800' : '' }}
                                {{ $item['display']['color'] === 'gray' ? 'bg-gray-100 text-gray-800' : '' }}
                            ">
                                {{ $item['display']['label'] }}
                            </span>
                        </td>
                        <td class="border border-gray-300 px-2 py-2 text-center text-red-600 text-xs">
                            {{ $item['late_minutes'] > 0 ? 'Telat ' . $item['late_minutes'] . ' mnt' : '' }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="border border-gray-300 px-2 py-4 text-center text-gray-500">Tidak ada data jadwal.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Tanda Tangan -->
    <div class="mt-12 flex justify-end page-break-inside-avoid">
        <div class="text-center w-64">
            <p class="mb-16">Mengetahui,<br>Kepala Sekolah</p>
            <p class="font-bold underline">_______________________</p>
            <p>NIP. ...........................</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>