import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ScheduleIndex({ auth, classes }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Jadwal Pelajaran</h2>}
        >
            <Head title="Kelola Jadwal" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Pilih Kelas untuk Mengatur Jadwal</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {classes.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route('admin.schedules.edit', cls.id)}
                                    className="block p-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 hover:border-indigo-300 dark:hover:border-gray-500 transition duration-150 ease-in-out"
                                >
                                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {cls.name}
                                        {cls.level && <span className="ml-2 text-sm font-normal text-gray-500">(Tingkat {cls.level})</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {cls.class_status ? cls.class_status.name : '-'}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}