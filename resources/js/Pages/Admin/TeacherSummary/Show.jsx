import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, user, stats, journal, filters }) {
    const [month, setMonth] = useState(filters.month);
    const [year, setYear] = useState(filters.year);

    const handleFilterChange = () => {
        router.get(route('admin.teacher-summaries.show', user.id), {
            month,
            year
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const getColorClasses = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        };
        return colors[color] || colors.gray;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Rekapan Guru</h2>}
        >
            <Head title={`Rekapan - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header & Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Link
                            href={route('admin.teacher-summaries.index')}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            &larr; Kembali
                        </Link>

                        <div className="flex gap-2">
                            <select 
                                value={month} 
                                onChange={(e) => { setMonth(e.target.value); }}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select 
                                value={year} 
                                onChange={(e) => { setYear(e.target.value); }}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button 
                                onClick={handleFilterChange}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Filter
                            </button>
                            <a 
                                href={route('admin.teacher-summaries.export', { user: user.id, month, year })}
                                target="_blank"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak
                            </a>
                        </div>
                    </div>

                    {/* Profil Guru */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">NIP: {user.identity_number || '-'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Periode Laporan</p>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                    {months.find(m => m.value == filters.month)?.label} {filters.year}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistik KPI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Persentase Kehadiran</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.attendance_percentage}%</p>
                            <p className="text-xs text-gray-500">Hadir {stats.present} dari {stats.total_schedules} Jadwal</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Izin / Sakit</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.permit}</p>
                            <p className="text-xs text-gray-500">Jadwal</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alpha / Terlewat</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.alpha}</p>
                            <p className="text-xs text-gray-500">Jadwal Tanpa Keterangan</p>
                        </div>
                    </div>

                    {/* Jurnal Mengajar (Jadwal vs Realisasi) */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Jurnal Mengajar (Jadwal vs Realisasi)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas & Mapel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jadwal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scan Masuk</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ket.</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {journal.length > 0 ? (
                                        journal.map((item, index) => (
                                            <tr key={index} className={item.status === 'alpha' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="font-medium">{item.day}</div>
                                                    <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('id-ID')}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="font-bold">{item.class}</div>
                                                    <div className="text-xs">{item.subject}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {item.schedule_time}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {item.check_in || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorClasses(item.display.color)}`}>
                                                        {item.display.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                                                    {item.late_minutes > 0 ? `Telat ${item.late_minutes} mnt` : ''}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada jadwal pada periode ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}