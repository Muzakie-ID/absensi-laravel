import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ schedule, today, date, holiday }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Jadwal Mengajar
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                        <div className="font-bold">{today}</div>
                        <div>{date}</div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {holiday ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                                🏖️ Hari Libur
                            </h3>
                            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                                {holiday.description}
                            </p>
                            {holiday.is_cuti && (
                                <span className="mt-4 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                    Cuti Bersama
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedule.map((slot) => (
                                <div 
                                    key={slot.id} 
                                    className={`relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all 
                                        ${slot.status === 'ongoing' 
                                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}
                                        ${slot.status === 'finished' ? 'opacity-60 grayscale' : ''}
                                    `}
                                >
                                    {/* Status Badge */}
                                    {slot.status === 'ongoing' && (
                                        <div className="absolute top-0 right-0 rounded-bl-lg bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                                            SEDANG BERLANGSUNG
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Waktu */}
                                        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-3 dark:bg-gray-700 min-w-[80px]">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {slot.start_time}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                s/d {slot.end_time}
                                            </span>
                                        </div>

                                        {/* Konten */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {slot.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {slot.subtitle}
                                            </p>

                                            {/* Tombol Aksi */}
                                            <div className="mt-3">
                                                {slot.can_attend && (
                                                    <a 
                                                        href={route('attendance.create', slot.schedule_id)}
                                                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        📷 Absen Masuk
                                                    </a>
                                                )}

                                                {slot.has_attended && (
                                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                ✅ Sudah Absen
                                                            </span>
                                                            <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                                                                • {slot.attendance_detail?.status === 'present' ? 'Hadir' : 
                                                                   slot.attendance_detail?.status === 'late' ? 'Terlambat' :
                                                                   slot.attendance_detail?.status === 'sick' ? 'Sakit' : 'Izin'}
                                                            </span>
                                                        </div>
                                                        {slot.attendance_detail?.notes && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                                "{slot.attendance_detail.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {slot.is_disabled && (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        ⚠️ Kelas Tidak Aktif
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {schedule.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    Tidak ada jadwal untuk hari ini.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
