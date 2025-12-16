import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function DashboardStudent({ schedule, today, date, className, error, announcements, holiday }) {
    const [selectedDay, setSelectedDay] = useState(today.toLowerCase());
    
    // Map day names to index for Tab.Group defaultIndex if needed, 
    // but we can just control it via state or let user click.
    // Let's just use the day keys from schedule.
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'late': return 'bg-yellow-100 text-yellow-800';
            case 'sick': return 'bg-purple-100 text-purple-800';
            case 'permit': return 'bg-blue-100 text-blue-800';
            case 'missing': return 'bg-red-100 text-red-800';
            case 'waiting': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'present': return 'Hadir';
            case 'late': return 'Terlambat';
            case 'sick': return 'Sakit';
            case 'permit': return 'Izin';
            case 'missing': return 'Belum Hadir';
            case 'waiting': return 'Menunggu';
            default: return '-';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Jadwal Pelajaran
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelas: {className}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-gray-800 dark:text-gray-200">{today}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{date}</div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Siswa" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Announcements Section */}
                    {announcements && announcements.length > 0 && (
                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Pengumuman Sekolah
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                                        {announcements.map((announcement) => (
                                            <div key={announcement.id} className="border-b border-yellow-200 dark:border-yellow-800 pb-2 last:border-0 last:pb-0">
                                                <p className="font-bold">{announcement.title}</p>
                                                <p>{announcement.content}</p>
                                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                    {new Date(announcement.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {holiday && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-10 rounded-lg text-center shadow-sm mb-6">
                            <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-2xl font-bold mb-2">Hari Libur</h3>
                            <p className="text-lg">{holiday.description}</p>
                            <p className="text-sm mt-2 text-green-600">Selamat beristirahat!</p>
                        </div>
                    )}

                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    ) : (
                        <Tab.Group defaultIndex={days.indexOf(today.toLowerCase()) !== -1 ? days.indexOf(today.toLowerCase()) : 0}>
                            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6 overflow-x-auto">
                                {days.map((day) => (
                                    <Tab
                                        key={day}
                                        className={({ selected }) =>
                                            classNames(
                                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 min-w-[80px]',
                                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                                selected
                                                    ? 'bg-white shadow text-blue-700'
                                                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                                            )
                                        }
                                    >
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels>
                                {days.map((day, idx) => (
                                    <Tab.Panel key={idx} className={classNames(
                                        'rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm',
                                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                                    )}>
                                        <div className="flow-root">
                                            <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                                                {schedule[day] && schedule[day].length > 0 ? (
                                                    schedule[day].map((slot, slotIdx) => (
                                                        <li key={slotIdx} className={`py-4 ${slot.is_current ? 'bg-blue-50 dark:bg-blue-900/20 -mx-3 px-3 rounded-lg border-l-4 border-blue-500' : ''}`}>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0 min-w-[80px]">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {slot.time}
                                                                    </p>
                                                                    {slot.is_current && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Sekarang
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {slot.subject}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                        {slot.type === 'learning' ? slot.teacher : slot.type}
                                                                    </p>
                                                                </div>
                                                                {slot.type === 'learning' && slot.teacher_status && (
                                                                    <div className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full bg-white hover:bg-gray-50">
                                                                        <span className={`flex-shrink-0 inline-block h-2 w-2 rounded-full mr-2 ${getStatusColor(slot.teacher_status).split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`}></span>
                                                                        <span className="text-gray-700 dark:text-gray-300">{getStatusLabel(slot.teacher_status)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="py-4 text-center text-gray-500">Tidak ada jadwal.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </Tab.Panel>
                                ))}
                            </Tab.Panels>
                        </Tab.Group>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
