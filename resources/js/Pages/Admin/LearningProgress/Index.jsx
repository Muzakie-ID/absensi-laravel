import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ auth, classes, subjects, progress, filters }) {
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.learning-progress.index'), {
            school_class_id: selectedClass,
            subject_id: selectedSubject
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Monitoring Pembelajaran</h2>}
        >
            <Head title="Monitoring Pembelajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Filter Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pilih Kelas
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    required
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pilih Mata Pelajaran
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    required
                                >
                                    <option value="">-- Pilih Mapel --</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Lihat Progres
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline Section */}
                    {progress && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 border-b pb-2 dark:border-gray-700">
                                Timeline Pembelajaran
                            </h3>

                            {progress.length > 0 ? (
                                <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900 ml-3 space-y-8">
                                    {progress.map((item, index) => (
                                        <div key={item.id} className="relative pl-8">
                                            {/* Dot */}
                                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-600 border-4 border-white dark:border-gray-800"></div>
                                            
                                            {/* Content */}
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-600">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                                                            Pertemuan {progress.length - index}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.date} • {item.time}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {item.teacher_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-gray-800 dark:text-gray-200 mt-2">
                                                    <p className="italic">"{item.notes}"</p>
                                                </div>

                                                {index === 0 && (
                                                    <div className="mt-3 inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        🔔 POSISI SAAT INI
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data pembelajaran untuk kelas dan mapel ini.
                                </div>
                            )}
                        </div>
                    )}

                    {!progress && !filters.school_class_id && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            Silakan pilih Kelas dan Mata Pelajaran untuk melihat progres pembelajaran.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
