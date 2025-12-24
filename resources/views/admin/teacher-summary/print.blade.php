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
<body class="bg-white text-gray-900 p-8 font-sans">

    <!-- Kop Surat -->
    <div class="flex items-center justify-between border-b-4 border-double border-gray-800 pb-4 mb-8">
        <div class="w-24 h-24 flex-shrink-0">
            <img src="{{ asset('logo-smk-batik-perbaik-purworejo.png') }}" alt="Logo" class="w-full h-full object-contain">
        </div>
        <div class="flex-1 text-center px-4">
            <h2 class="text-xl font-bold uppercase tracking-wide text-gray-800">Yayasan Pendidikan Batik Perbaik Purworejo</h2>
            <h1 class="text-3xl font-extrabold uppercase text-gray-900 tracking-wider">SMK Batik Perbaik Purworejo</h1>
            <p class="text-sm text-gray-600 mt-1">Jl. K.H. Ahmad Dahlan No. 12, Purworejo, Jawa Tengah</p>
            <p class="text-sm text-gray-600">Telp: (0275) 321456 | Email: smkbatikperbaik@yahoo.co.id</p>
        </div>
        <div class="w-24 h-24 flex-shrink-0 opacity-0">
            <!-- Spacer for centering -->
        </div>
    </div>

    <!-- Judul Laporan -->
    <div class="text-center mb-8">
        <h2 class="text-xl font-bold uppercase underline decoration-2 underline-offset-4">Laporan Kinerja Guru</h2>
        <p class="text-gray-600 mt-2 font-medium">Periode: {{ \Carbon\Carbon::createFromDate($filters['year'], $filters['month'], 1)->translatedFormat('F Y') }}</p>
    </div>

    <!-- Profil Guru -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <table class="w-full text-sm">
            <tr>
                <td class="w-32 font-bold text-gray-700 py-1">Nama Guru</td>
                <td class="w-4 text-center">:</td>
                <td class="font-medium text-lg">{{ $user->name }}</td>
                <td class="w-32 font-bold text-gray-700 py-1">NIP/NIY</td>
                <td class="w-4 text-center">:</td>
                <td class="font-medium">{{ $user->identity_number ?? '-' }}</td>
            </tr>
            <tr>
                <td class="font-bold text-gray-700 py-1">Email</td>
                <td class="text-center">:</td>
                <td>{{ $user->email }}</td>
                <td class="font-bold text-gray-700 py-1">Dicetak Tanggal</td>
                <td class="text-center">:</td>
                <td>{{ now()->translatedFormat('d F Y H:i') }}</td>
            </tr>
        </table>
    </div>

    <!-- Ringkasan Kinerja -->
    <div class="mb-8">
        <h3 class="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Ringkasan Statistik</h3>
        <div class="grid grid-cols-3 gap-6 text-center">
            <div class="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                <div class="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Persentase Kehadiran</div>
                <div class="text-3xl font-bold text-blue-600">{{ $stats['attendance_percentage'] }}%</div>
            </div>
            <div class="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                <div class="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Izin / Sakit</div>
                <div class="text-3xl font-bold text-yellow-600">{{ $stats['permit'] }} <span class="text-sm text-gray-400 font-normal">kali</span></div>
            </div>
            <div class="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                <div class="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Alpha / Tanpa Ket.</div>
                <div class="text-3xl font-bold text-red-600">{{ $stats['alpha'] }} <span class="text-sm text-gray-400 font-normal">kali</span></div>
            </div>
        </div>
    </div>

    <!-- Jurnal Mengajar -->
    <div class="mb-8">
        <h3 class="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Detail Jurnal Mengajar</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm shadow-sm">
            <thead>
                <tr class="bg-gray-800 text-white">
                    <th class="border border-gray-700 px-3 py-3 text-left w-24">Tanggal</th>
                    <th class="border border-gray-700 px-3 py-3 text-left">Kelas & Mapel</th>
                    <th class="border border-gray-700 px-3 py-3 text-center w-24">Jadwal</th>
                    <th class="border border-gray-700 px-3 py-3 text-center w-24">Scan Masuk</th>
                    <th class="border border-gray-700 px-3 py-3 text-center w-24">Status</th>
                    <th class="border border-gray-700 px-3 py-3 text-center w-32">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($journal as $item)
                    <tr class="{{ $loop->even ? 'bg-gray-50' : 'bg-white' }} hover:bg-gray-100 transition-colors">
                        <td class="border border-gray-300 px-3 py-2 align-top">
                            <div class="font-bold text-gray-800">{{ $item['day'] }}</div>
                            <div class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
                        </td>
                        <td class="border border-gray-300 px-3 py-2 align-top">
                            <div class="font-bold text-gray-800">{{ $item['class'] }}</div>
                            <div class="text-xs text-gray-600">{{ $item['subject'] }}</div>
                        </td>
                        <td class="border border-gray-300 px-3 py-2 text-center align-middle font-mono text-xs">
                            {{ $item['schedule_time'] }}
                        </td>
                        <td class="border border-gray-300 px-3 py-2 text-center align-middle font-mono text-xs">
                            {{ $item['check_in'] ?? '-' }}
                        </td>
                        <td class="border border-gray-300 px-3 py-2 text-center align-middle">
                            <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                {{ $item['display']['color'] === 'green' ? 'bg-green-50 text-green-700 border-green-200' : '' }}
                                {{ $item['display']['color'] === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : '' }}
                                {{ $item['display']['color'] === 'red' ? 'bg-red-50 text-red-700 border-red-200' : '' }}
                                {{ $item['display']['color'] === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : '' }}
                                {{ $item['display']['color'] === 'gray' ? 'bg-gray-50 text-gray-600 border-gray-200' : '' }}
                            ">
                                {{ $item['display']['label'] }}
                            </span>
                        </td>
                        <td class="border border-gray-300 px-3 py-2 text-center align-middle text-xs">
                            @if($item['late_minutes'] > 0)
                                <span class="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Telat {{ $item['late_minutes'] }} mnt</span>
                            @else
                                <span class="text-gray-400">-</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="border border-gray-300 px-4 py-8 text-center text-gray-500 italic bg-gray-50">
                            Tidak ada data jadwal mengajar pada periode ini.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Tanda Tangan -->
    <div class="mt-12 flex justify-end page-break-inside-avoid">
        <div class="text-center w-64">
            <p class="text-sm text-gray-600 mb-1">Purworejo, {{ now()->translatedFormat('d F Y') }}</p>
            <p class="mb-20 font-bold text-gray-800">Kepala Sekolah</p>
            <p class="font-bold underline text-gray-900">_______________________</p>
            <p class="text-sm text-gray-600">NIP. ...........................</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>