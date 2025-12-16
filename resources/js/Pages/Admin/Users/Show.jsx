import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, user, schedules, stats, recentAttendances }) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Detail Pengguna: {user.name}
                    </h2>
                    <Link
                        href={route('admin.users.index')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Detail ${user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center space-x-6">
                            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p><span className="font-semibold">NIP/NIS:</span> {user.identity_number || '-'}</p>
                                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                                    <p><span className="font-semibold">Username:</span> {user.username || '-'}</p>
                                    <p><span className="font-semibold">Peran:</span> {user.role?.name || '-'}</p>
                                    {user.role_id === 2 && (
                                        <p><span className="font-semibold">Kode Referral:</span> {user.referral_code || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Hadir Bulan Ini</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats.permit}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Izin Bulan Ini</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-yellow-600">{stats.sick}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Sakit Bulan Ini</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-red-600">{stats.alpha}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Alpha Bulan Ini</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Jadwal Mengajar */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Jadwal Mengajar</h4>
                            {schedules.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hari</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Jam</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kelas</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mapel</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {schedules.map((schedule) => (
                                                <tr key={schedule.id}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{days[schedule.day_of_week]}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{schedule.start_time} - {schedule.end_time}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{schedule.school_class?.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{schedule.subject?.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada jadwal mengajar.</p>
                            )}
                        </div>

                        {/* Riwayat Absensi */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Riwayat Absensi Terakhir</h4>
                            {recentAttendances.length > 0 ? (
                                <div className="space-y-4">
                                    {recentAttendances.map((attendance) => (
                                        <div key={attendance.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(attendance.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {attendance.schedule?.subject?.name} - {attendance.schedule?.schoolClass?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                                                    attendance.status === 'permit' ? 'bg-blue-100 text-blue-800' :
                                                    attendance.status === 'sick' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {attendance.status === 'present' ? 'Hadir' :
                                                     attendance.status === 'permit' ? 'Izin' :
                                                     attendance.status === 'sick' ? 'Sakit' : 'Alpha'}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(attendance.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada riwayat absensi.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}