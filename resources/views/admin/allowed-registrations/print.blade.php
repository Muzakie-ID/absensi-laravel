<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Registrasi - {{ ucfirst($type) }}</title>
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
        }
    </style>
</head>
<body class="bg-white text-gray-900 p-8">

    <div class="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 class="text-2xl font-bold uppercase">Data Kode Registrasi {{ $type == 'teacher' ? 'Guru' : 'Siswa' }}</h1>
        <h2 class="text-xl font-semibold">{{ config('app.name', 'Sekolah') }}</h2>
        <p class="text-sm text-gray-600">Dicetak Tanggal: {{ now()->translatedFormat('d F Y') }}</p>
    </div>

    <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead>
            <tr class="bg-gray-100">
                <th class="border border-gray-300 px-4 py-2 text-center w-12">No</th>
                <th class="border border-gray-300 px-4 py-2 text-left">Nama Lengkap</th>
                <th class="border border-gray-300 px-4 py-2 text-center">{{ $type == 'teacher' ? 'NIP' : 'NIS' }}</th>
                @if($type == 'student')
                <th class="border border-gray-300 px-4 py-2 text-center">Kelas</th>
                @endif
                <th class="border border-gray-300 px-4 py-2 text-center font-bold bg-yellow-50">Kode Registrasi</th>
                <th class="border border-gray-300 px-4 py-2 text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($registrations as $index => $item)
                <tr class="{{ $loop->even ? 'bg-gray-50' : '' }}">
                    <td class="border border-gray-300 px-4 py-2 text-center">{{ $index + 1 }}</td>
                    <td class="border border-gray-300 px-4 py-2 font-semibold">{{ $item->name }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center">{{ $item->identity_number }}</td>
                    @if($type == 'student')
                    <td class="border border-gray-300 px-4 py-2 text-center">{{ $item->schoolClass->name ?? '-' }}</td>
                    @endif
                    <td class="border border-gray-300 px-4 py-2 text-center font-mono text-lg font-bold tracking-wider bg-yellow-50">
                        {{ $item->registration_code }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-center">
                        @if($item->is_registered)
                            <span class="text-green-600 font-bold">Terdaftar</span>
                        @else
                            <span class="text-gray-500">Belum</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $type == 'student' ? 6 : 5 }}" class="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        Tidak ada data.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>