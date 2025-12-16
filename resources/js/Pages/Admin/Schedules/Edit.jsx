import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ScheduleEdit({ auth, schoolClass, schedules, subjects, teachers, activeTemplate }) {
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    
    // Transform initial schedules to a flat object for easier access: key = "day-sequence"
    const initialFormState = {};
    
    // Helper to get schedule for a specific day and sequence
    const getSchedule = (day, sequence) => {
        if (schedules[day] && schedules[day][sequence]) {
            return schedules[day][sequence];
        }
        return null;
    };

    // We need to build the form state based on the ACTIVE TEMPLATE's structure
    // If no active template, we can't really edit effectively, but we'll handle that.
    
    const { data, setData, put, processing, errors, reset } = useForm({
        schedules: []
    });

    // Local state to track changes before submitting
    // Structure: { "senin-1": { subject_id: 1, user_id: 2 }, ... }
    const [localSchedules, setLocalSchedules] = useState({});

    useEffect(() => {
        const initial = {};
        if (activeTemplate && activeTemplate.time_slots) {
            activeTemplate.time_slots.forEach(slot => {
                if (slot.mapping_source) {
                    const seq = parseInt(slot.mapping_source);
                    // Only process if seq is a valid number
                    if (!isNaN(seq)) {
                        const existing = getSchedule(slot.day, seq);
                        initial[`${slot.day}-${seq}`] = {
                            day: slot.day,
                            learning_sequence: seq,
                            subject_id: existing ? existing.subject_id : null,
                            user_id: existing ? existing.user_id : null
                        };
                    }
                }
            });
        }
        setLocalSchedules(initial);
        setData('schedules', Object.values(initial));
    }, [activeTemplate, schedules]);

    const handleChange = (day, sequence, field, value) => {
        const key = `${day}-${sequence}`;
        const currentSlot = localSchedules[key] || { day, learning_sequence: sequence };
        
        // Convert empty string to null for validation
        const cleanValue = value === '' ? null : value;

        const updatedSchedules = {
            ...localSchedules,
            [key]: {
                ...currentSlot,
                day,
                learning_sequence: sequence,
                [field]: cleanValue
            }
        };
        setLocalSchedules(updatedSchedules);
        setData('schedules', Object.values(updatedSchedules));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(route('admin.schedules.update', schoolClass.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Maybe show a toast
            }
        });
    };

    if (!activeTemplate) {
        return (
            <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Jadwal: {schoolClass.name}</h2>}>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                            <p className="font-bold">Peringatan</p>
                            <p>Belum ada Template Jadwal yang aktif. Silakan aktifkan template terlebih dahulu di menu "Template Jadwal".</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Group slots by day for rendering
    const slotsByDay = {};
    days.forEach(day => {
        slotsByDay[day] = activeTemplate.time_slots.filter(s => s.day === day).sort((a, b) => a.period_order - b.period_order);
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Jadwal: {schoolClass.name}
                    </h2>
                    <Link
                        href={route('admin.schedules.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        &larr; Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Jadwal - ${schoolClass.name}`} />

            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <strong className="font-bold">Gagal menyimpan!</strong>
                                <ul className="mt-1 list-disc list-inside text-sm">
                                    {Object.values(errors).map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end mb-4">
                            <PrimaryButton disabled={processing}>
                                Simpan Perubahan
                            </PrimaryButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {days.map(day => {
                                const daySlots = slotsByDay[day];
                                if (daySlots.length === 0) return null;

                                return (
                                    <div key={day} className="bg-white shadow rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-center capitalize">
                                            {day}
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {daySlots.map(slot => {
                                                // Ensure mapping_source is a valid number
                                                const isLearning = slot.mapping_source !== null && !isNaN(parseInt(slot.mapping_source));
                                                const sequence = isLearning ? parseInt(slot.mapping_source) : null;
                                                const key = `${day}-${sequence}`;
                                                const currentData = localSchedules[key] || {};

                                                return (
                                                    <div key={slot.id} className={`p-2 rounded border ${isLearning ? 'border-gray-200 bg-white' : 'border-transparent bg-gray-50'}`}>
                                                        <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                                            <span>Jam ke-{slot.period_order}</span>
                                                            <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                                                        </div>
                                                        
                                                        {!isLearning ? (
                                                            <div className="text-center text-sm font-medium text-gray-600 py-2 capitalize">
                                                                {slot.type === 'break' ? 'Istirahat' : slot.type === 'ceremony' ? 'Upacara' : slot.type}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <select
                                                                    className="w-full text-xs border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                    value={currentData.subject_id || ''}
                                                                    onChange={(e) => handleChange(day, sequence, 'subject_id', e.target.value)}
                                                                >
                                                                    <option value="">- Mapel -</option>
                                                                    {subjects.map(s => (
                                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    className="w-full text-xs border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                    value={currentData.user_id || ''}
                                                                    onChange={(e) => handleChange(day, sequence, 'user_id', e.target.value)}
                                                                >
                                                                    <option value="">- Guru -</option>
                                                                    {teachers.map(t => (
                                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}