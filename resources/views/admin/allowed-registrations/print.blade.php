<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Registrasi - {{ ucfirst($type) }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
        @media print {
            @page {
                size: A4;
                margin: 1.5cm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none;
            }
            /* Hilangkan header/footer default browser (URL, Tanggal, Judul Halaman) */
            @page {
                margin-top: 1cm;
                margin-bottom: 1cm;
            }
        }
    </style>
</head>
<body class="bg-white text-gray-800 p-8 max-w-4xl mx-auto">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8 border-b-2 border-gray-800 pb-6">
        <div class="flex items-center gap-4">
            <!-- Logo -->
            <img src="{{ asset('logo-smk-batik-perbaik-purworejo.png') }}" alt="Logo" class="w-16 h-16 object-contain">
            <div>
                <h1 class="text-2xl font-bold uppercase tracking-wide text-gray-900">Data Kode Registrasi {{ $type == 'teacher' ? 'Guru' : 'Siswa' }}</h1>
                <!--<h2 class="text-lg font-medium text-gray-600">Sistem Informasi Sekolah</h2>-->
            </div>
        </div>
        <div class="text-right">
            <p class="text-sm text-gray-500">Dicetak Tanggal</p>
            <p class="font-medium">{{ now()->translatedFormat('d F Y, H:i') }}</p>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-8 no-print">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p class="text-sm text-blue-600 font-medium">Total Data</p>
            <p class="text-2xl font-bold text-blue-800">{{ $registrations->count() }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
            <p class="text-sm text-green-600 font-medium">Sudah Terdaftar</p>
            <p class="text-2xl font-bold text-green-800">{{ $registrations->where('is_registered', true)->count() }}</p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p class="text-sm text-yellow-600 font-medium">Belum Terdaftar</p>
            <p class="text-2xl font-bold text-yellow-800">{{ $registrations->where('is_registered', false)->count() }}</p>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="bg-gray-800 text-white">
                    <th class="px-4 py-3 text-center w-12 font-medium">No</th>
                    <th class="px-4 py-3 text-left font-medium">Nama Lengkap</th>
                    <th class="px-4 py-3 text-center font-medium">{{ $type == 'teacher' ? 'Kode Guru' : 'NIS' }}</th>
                    @if($type == 'student')
                    <th class="px-4 py-3 text-center font-medium">Kelas</th>
                    @endif
                    <th class="px-4 py-3 text-center font-medium bg-gray-700">Kode Registrasi</th>
                    <th class="px-4 py-3 text-center font-medium">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($registrations as $index => $item)
                    <tr class="{{ $loop->even ? 'bg-gray-50' : 'bg-white' }} hover:bg-gray-100 transition-colors">
                        <td class="px-4 py-3 text-center text-gray-500">{{ $index + 1 }}</td>
                        <td class="px-4 py-3 font-semibold text-gray-900">{{ $item->name }}</td>
                        <td class="px-4 py-3 text-center text-gray-600 font-mono">{{ $item->identity_number }}</td>
                        @if($type == 'student')
                        <td class="px-4 py-3 text-center text-gray-600">{{ $item->schoolClass->name ?? '-' }}</td>
                        @endif
                        <td class="px-4 py-3 text-center font-mono text-lg font-bold tracking-wider text-blue-600 bg-blue-50/50">
                            {{ $item->registration_code }}
                        </td>
                        <td class="px-4 py-3 text-center">
                            @if($item->is_registered)
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Terdaftar
                                </span>
                            @else
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Belum
                                </span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ $type == 'student' ? 6 : 5 }}" class="px-4 py-12 text-center text-gray-500 italic">
                            Tidak ada data yang tersedia.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <script>
        // Auto print after a slight delay to ensure styles are loaded
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    </script>
</body>
</html>