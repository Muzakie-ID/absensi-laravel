import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { Tab } from '@headlessui/react';
import axios from 'axios';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function DashboardPicket({ today, date, slotInfo, monitoringData, holiday, message, stats, absentRecap, picketLogs, guestBooks, allClasses, allSlots, currentSlotId }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editStatus, setEditStatus] = useState('');
    const [editNotes, setEditNotes] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSlotChange = (e) => {
        const slotId = e.target.value;
        router.get(route('admin.monitoring'), { slot_id: slotId }, {
            preserveState: true,
            preserveScroll: true,
            only: ['monitoringData', 'slotInfo', 'currentSlotId', 'stats']
        });
    };

    // Forms
    const picketForm = useForm({
        type: 'late',
        student_name: '',
        class_id: '',
        reason: '',
        points: 0,
        time: ''
    });

    const guestForm = useForm({
        name: '',
        institution: '',
        meet_who: '',
        purpose: ''
    });

    const openModal = (item) => {
        setSelectedItem(item);
        setEditStatus(item.status);
        setEditNotes(item.notes || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    const handleStatusChange = (e) => {
        setEditStatus(e.target.value);
    };

    const handleNotesChange = (e) => {
        setEditNotes(e.target.value);
    };

    const saveStatus = () => {
        if (selectedItem) {
            if (confirm('Apakah Anda yakin ingin mengubah data kehadiran ini?')) {
                router.post(route('admin.monitoring.attendance'), {
                    schedule_id: selectedItem.schedule_id,
                    status: editStatus,
                    notes: editNotes
                }, {
                    preserveScroll: true,
                    onSuccess: () => closeModal()
                });
            }
        } else {
            closeModal();
        }
    };

    const submitPicketLog = (e) => {
        e.preventDefault();
        picketForm.post(route('picket.logs.store'), {
            preserveScroll: true,
            onSuccess: () => picketForm.reset(),
        });
    };

    const submitGuestBook = (e) => {
        e.preventDefault();
        guestForm.post(route('picket.guests.store'), {
            preserveScroll: true,
            onSuccess: () => guestForm.reset(),
        });
    };

    const checkoutGuest = (id) => {
        if (confirm('Checkout tamu ini?')) {
            router.post(route('picket.guests.checkout', id), {}, { preserveScroll: true });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true);
        try {
            const response = await axios.get(route('picket.search-schedule'), {
                params: { query: searchQuery }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'missing': return 'bg-red-100 text-red-800';
            case 'late': return 'bg-yellow-100 text-yellow-800';
            case 'permit': return 'bg-blue-100 text-blue-800';
            case 'sick': return 'bg-purple-100 text-purple-800';
            case 'alpha': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'present': return 'Hadir';
            case 'missing': return 'Belum Hadir';
            case 'late': return 'Terlambat';
            case 'permit': return 'Izin';
            case 'sick': return 'Sakit';
            case 'alpha': return 'Alpha';
            case 'empty': return 'Kosong';
            default: return status;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Dashboard Piket
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                        <div className="font-bold">{today}</div>
                        <div>{date}</div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Piket" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                            {['Monitoring KBM', 'Buku Piket (Log)', 'Buku Tamu', 'Cari Jadwal'].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        classNames(
                                            'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                            selected
                                                ? 'bg-white shadow text-blue-700'
                                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                                        )
                                    }
                                >
                                    {category}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels>
                            {/* Panel 1: Monitoring KBM */}
                            <Tab.Panel>
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
                                    <>
                                        {/* Slot Selector */}
                                        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Pilih Jam Pelajaran:
                                            </div>
                                            <select
                                                value={currentSlotId || ''}
                                                onChange={handleSlotChange}
                                                className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="">-- Pilih Jam --</option>
                                                {allSlots && allSlots.map((slot) => {
                                                    let label = 'Lainnya';
                                                    if (slot.type === 'learning') label = 'KBM';
                                                    else if (slot.type === 'ceremony') label = 'Upacara';
                                                    else if (slot.type === 'break') label = 'Istirahat';
                                                    else if (slot.type === 'literacy') label = 'Literasi';
                                                    else if (slot.activity_type?.name) label = slot.activity_type.name;

                                                    return (
                                                        <option key={slot.id} value={slot.id}>
                                                            Jam Ke-{slot.period_order} ({label})
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        {/* Statistik Ringkas */}
                                        {stats && (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                                                <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 rounded-md bg-green-100 p-3 dark:bg-green-900">
                                                            <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-5 w-0 flex-1">
                                                            <dl>
                                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Guru Hadir</dt>
                                                                <dd>
                                                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.present}</div>
                                                                </dd>
                                                            </dl>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3 dark:bg-yellow-900">
                                                            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-5 w-0 flex-1">
                                                            <dl>
                                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Guru Izin/Sakit</dt>
                                                                <dd>
                                                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.absent}</div>
                                                                </dd>
                                                            </dl>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 rounded-md bg-red-100 p-3 dark:bg-red-900">
                                                            <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-5 w-0 flex-1">
                                                            <dl>
                                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Kelas Kosong (Slot Ini)</dt>
                                                                <dd>
                                                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.empty_classes}</div>
                                                                </dd>
                                                            </dl>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Monitoring KBM (Main Content) */}
                                            <div className="lg:col-span-2 space-y-6">
                                                {/* Info Slot Waktu Saat Ini */}
                                                <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                                Status Saat Ini
                                                            </h3>
                                                            {slotInfo ? (
                                                                <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                                    {slotInfo.name} ({slotInfo.start_time} - {slotInfo.end_time})
                                                                </p>
                                                            ) : (
                                                                <p className="mt-1 text-xl text-gray-500">
                                                                    {message || 'Tidak ada KBM berlangsung saat ini.'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                Live Monitoring
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Grid Card Monitoring */}
                                                {slotInfo && monitoringData && monitoringData.length > 0 && (
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        {monitoringData.map((item, index) => (
                                                            <div 
                                                                key={index} 
                                                                className={`relative flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${
                                                                    item.status === 'missing' 
                                                                        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                                                                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                                                }`}
                                                            >
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                                            {item.class_name}
                                                                        </h3>
                                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusColor(item.status)}`}>
                                                                            {getStatusLabel(item.status)}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                            {item.subject_name}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {item.teacher_name}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                                    <div className="text-xs text-gray-500">
                                                                        {item.check_in_time !== '-' ? `Masuk: ${item.check_in_time}` : 'Belum absen'}
                                                                    </div>
                                                                    {item.status !== 'empty' && (
                                                                        <button
                                                                            onClick={() => openModal(item)}
                                                                            className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30"
                                                                        >
                                                                            Detail
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Daftar Guru Izin/Sakit (Sidebar) */}
                                            <div className="lg:col-span-1">
                                                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800 overflow-hidden sticky top-6">
                                                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-700">
                                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                                                            Rekap Guru Izin/Sakit
                                                        </h3>
                                                    </div>
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                                                        {absentRecap && absentRecap.length > 0 ? (
                                                            absentRecap.map((item, index) => (
                                                                <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                                            {item.teacher_name}
                                                                        </p>
                                                                        <div className="ml-2 flex-shrink-0 flex">
                                                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(item.status)}`}>
                                                                                {getStatusLabel(item.status)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 sm:flex sm:justify-between">
                                                                        <div className="sm:flex">
                                                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                                {item.subject_name} ({item.class_name})
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {item.notes && (
                                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                                                            "{item.notes}"
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                Tidak ada guru yang izin/sakit hari ini.
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Tab.Panel>

                            {/* Panel 2: Buku Piket (Log) */}
                            <Tab.Panel>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Input Catatan Piket</h3>
                                            <form onSubmit={submitPicketLog} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Catatan</label>
                                                    <select
                                                        value={picketForm.data.type}
                                                        onChange={e => picketForm.setData('type', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="late">Siswa Terlambat</option>
                                                        <option value="permission_leave">Izin Keluar</option>
                                                        <option value="incident">Kejadian Penting</option>
                                                    </select>
                                                </div>

                                                {picketForm.data.type !== 'incident' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Siswa</label>
                                                            <input
                                                                type="text"
                                                                value={picketForm.data.student_name}
                                                                onChange={e => picketForm.setData('student_name', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                                                            <select
                                                                value={picketForm.data.class_id}
                                                                onChange={e => picketForm.setData('class_id', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                                required
                                                            >
                                                                <option value="">Pilih Kelas</option>
                                                                {allClasses && allClasses.map(cls => (
                                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {picketForm.data.type === 'incident' ? 'Deskripsi Kejadian' : 'Alasan'}
                                                    </label>
                                                    <textarea
                                                        value={picketForm.data.reason}
                                                        onChange={e => picketForm.setData('reason', e.target.value)}
                                                        rows={3}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        required
                                                    />
                                                </div>

                                                {picketForm.data.type === 'late' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poin Pelanggaran</label>
                                                        <input
                                                            type="number"
                                                            value={picketForm.data.points}
                                                            onChange={e => picketForm.setData('points', e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                    </div>
                                                )}

                                                <PrimaryButton disabled={picketForm.processing}>
                                                    Simpan Catatan
                                                </PrimaryButton>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                                    Log Piket Hari Ini
                                                </h3>
                                            </div>
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {picketLogs && picketLogs.length > 0 ? (
                                                    picketLogs.map((log) => (
                                                        <li key={log.id} className="px-4 py-4 sm:px-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                                                    {log.type === 'late' ? 'Terlambat' : log.type === 'permission_leave' ? 'Izin Keluar' : 'Kejadian Penting'}
                                                                </div>
                                                                <div className="ml-2 flex-shrink-0 flex">
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                        {log.time}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:flex sm:justify-between">
                                                                <div className="sm:flex">
                                                                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                        {log.type !== 'incident' ? `${log.student_name} (${log.school_class?.name})` : log.reason}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {log.type !== 'incident' && (
                                                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                                    Alasan: {log.reason} {log.points > 0 && `(${log.points} Poin)`}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                        Belum ada catatan piket hari ini.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>

                            {/* Panel 3: Buku Tamu */}
                            <Tab.Panel>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Input Tamu</h3>
                                            <form onSubmit={submitGuestBook} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Tamu</label>
                                                    <input
                                                        type="text"
                                                        value={guestForm.data.name}
                                                        onChange={e => guestForm.setData('name', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instansi (Opsional)</label>
                                                    <input
                                                        type="text"
                                                        value={guestForm.data.institution}
                                                        onChange={e => guestForm.setData('institution', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bertemu Siapa</label>
                                                    <input
                                                        type="text"
                                                        value={guestForm.data.meet_who}
                                                        onChange={e => guestForm.setData('meet_who', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keperluan</label>
                                                    <textarea
                                                        value={guestForm.data.purpose}
                                                        onChange={e => guestForm.setData('purpose', e.target.value)}
                                                        rows={3}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                                <PrimaryButton disabled={guestForm.processing}>
                                                    Simpan Tamu
                                                </PrimaryButton>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                                    Daftar Tamu Hari Ini
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama / Instansi</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bertemu</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keperluan</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {guestBooks && guestBooks.length > 0 ? (
                                                            guestBooks.map((guest) => (
                                                                <tr key={guest.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{guest.name}</div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{guest.institution}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {guest.meet_who}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                                        {guest.purpose}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        In: {new Date(guest.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                        {guest.check_out_time && (
                                                                            <div className="text-green-600">Out: {new Date(guest.check_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                        {!guest.check_out_time && (
                                                                            <button
                                                                                onClick={() => checkoutGuest(guest.id)}
                                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                            >
                                                                                Checkout
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                    Belum ada tamu hari ini.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>

                            {/* Panel 4: Cari Jadwal */}
                            <Tab.Panel>
                                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                    <div className="max-w-xl mx-auto">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
                                            Cari Jadwal Guru atau Kelas
                                        </h3>
                                        <form onSubmit={handleSearch} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setHasSearched(false);
                                                }}
                                                placeholder="Ketik nama guru atau nama kelas..."
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                            <PrimaryButton disabled={isSearching}>
                                                {isSearching ? 'Mencari...' : 'Cari'}
                                            </PrimaryButton>
                                        </form>
                                    </div>

                                    <div className="mt-8">
                                        {searchResults.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {searchResults.map((result, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.type === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                {result.type === 'teacher' ? 'Guru' : 'Kelas'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{result.status}</span>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{result.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.subtitle}</p>
                                                        <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {result.time}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            searchQuery && !isSearching && hasSearched && (
                                                <p className="text-center text-gray-500 dark:text-gray-400">
                                                    Tidak ditemukan jadwal untuk pencarian "{searchQuery}".
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>

            {/* Modal Detail & Edit */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Detail Kehadiran
                    </h2>

                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Kelas</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.class_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Jam Pelajaran</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{slotInfo?.name} ({slotInfo?.start_time} - {slotInfo?.end_time})</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Mata Pelajaran</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.subject_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Guru</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.teacher_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Waktu Check-in</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.check_in_time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Lokasi</p>
                                    {selectedItem.location_lat && selectedItem.location_long && selectedItem.location_lat !== '0' && selectedItem.location_lat !== 0 ? (
                                        <div>
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${selectedItem.location_lat},${selectedItem.location_long}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:text-indigo-900 font-semibold flex items-center gap-1"
                                            >
                                                📍 Lihat Peta
                                            </a>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedItem.location_lat}, {selectedItem.location_long}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Tidak ada data lokasi</p>
                                    )}
                                </div>
                                {selectedItem.notes && (
                                    <div className="col-span-2">
                                        <p className="text-gray-500 dark:text-gray-400">Keterangan</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Bukti Foto</p>
                                {selectedItem.photo ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <img 
                                            src={selectedItem.photo} 
                                            alt="Bukti Kehadiran" 
                                            className="h-full w-full object-cover"
                                        />
                                        <a 
                                            href={selectedItem.photo} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
                                        >
                                            Buka Full
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm italic">
                                        Tidak ada bukti foto
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Update Status Kehadiran
                                </label>
                                <select
                                    id="status"
                                    value={editStatus}
                                    onChange={handleStatusChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="missing">Belum Hadir</option>
                                    <option value="present">Hadir</option>
                                    <option value="late">Terlambat</option>
                                    <option value="permit">Izin</option>
                                    <option value="sick">Sakit</option>
                                    <option value="alpha">Alpha</option>
                                </select>
                                
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">
                                    Keterangan (Opsional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={editNotes}
                                    onChange={handleNotesChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="Tambahkan catatan jika perlu..."
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    *Mengubah status akan mencatat waktu saat ini sebagai waktu update.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Tutup
                        </SecondaryButton>
                        <PrimaryButton onClick={saveStatus}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}