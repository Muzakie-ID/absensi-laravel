import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ auth, stats, activeTemplate, attendanceStats, absentTeachers, date, topPermissionTeachers, topEmptyClasses }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Admin</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Welcome Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Selamat Datang, {auth.user.name}!</h3>
                                <p className="text-gray-500 dark:text-gray-400">{date}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Template Jadwal Aktif</div>
                                <div className={`font-bold text-lg ${activeTemplate ? 'text-green-600' : 'text-red-600'}`}>
                                    {activeTemplate ? activeTemplate.name : 'Tidak Ada'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Guru</div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.teachers}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Kelas Aktif</div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.classes}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-purple-500">
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Mata Pelajaran</div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.subjects}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-green-500">
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Kehadiran Hari Ini</div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                                {attendanceStats.present + attendanceStats.late}
                                <span className="text-sm text-gray-400 font-normal ml-2">
                                    (Izin: {attendanceStats.sick + attendanceStats.permit})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Akses Cepat</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href={route('admin.monitoring')} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Monitoring KBM</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Live View Kelas</div>
                                    </div>
                                </Link>
                                <Link href={route('admin.users.index')} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Kelola Pengguna</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Guru & Staff</div>
                                    </div>
                                </Link>
                                <Link href={route('admin.schedule-templates.index')} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Template Jadwal</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Atur Bel Masuk</div>
                                    </div>
                                </Link>
                                <Link href={route('admin.schedules.index')} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Jadwal Pelajaran</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Mapping Guru</div>
                                    </div>
                                </Link>
                                <Link href={route('admin.classes.index')} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Data Kelas</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Tambah/Edit Kelas</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Absences */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Guru Izin/Sakit Hari Ini</h3>
                            {absentTeachers.length > 0 ? (
                                <div className="space-y-4">
                                    {absentTeachers.map((item, index) => (
                                        <div key={index} className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                            <div className="flex-shrink-0">
                                                <span className={`inline-block w-2 h-2 rounded-full mt-2 ${item.status === 'sick' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                            </div>
                                            <div className="ml-3 w-full">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.teacher_name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.class_name} • {item.time}
                                                </div>
                                                {item.notes && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">"{item.notes}"</div>
                                                )}
                                            </div>
                                            <div className="ml-auto">
                                                <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'sick' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                    {item.status === 'sick' ? 'Sakit' : 'Izin'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Tidak ada data izin/sakit hari ini.</p>
                            )}
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Permission Teachers */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Guru Sering Izin (Bulan Ini)</h3>
                            {topPermissionTeachers && topPermissionTeachers.length > 0 ? (
                                <div className="space-y-3">
                                    {topPermissionTeachers.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                            <div className="flex items-center">
                                                <span className="text-gray-500 dark:text-gray-400 font-bold mr-3">#{index + 1}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                {item.total} Kali
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Belum ada data bulan ini.</p>
                            )}
                        </div>

                        {/* Top Empty Classes */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Kelas Sering Jam Kosong (Bulan Ini)</h3>
                            {topEmptyClasses && topEmptyClasses.length > 0 ? (
                                <div className="space-y-3">
                                    {topEmptyClasses.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                            <div className="flex items-center">
                                                <span className="text-gray-500 dark:text-gray-400 font-bold mr-3">#{index + 1}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                {item.total} Jam
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Belum ada data bulan ini.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}