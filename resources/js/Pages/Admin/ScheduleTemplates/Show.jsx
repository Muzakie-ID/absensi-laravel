import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ScheduleTemplateShow({ auth, template, timeSlots, activityTypes }) {
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    const [showModal, setShowModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [selectedDay, setSelectedDay] = useState('senin');
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyFromDay, setCopyFromDay] = useState('senin');
    const [copyToDays, setCopyToDays] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [dayToDeleteAll, setDayToDeleteAll] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        day: 'senin',
        period_order: '',
        activity_type_id: '',
        start_time: '',
        end_time: '',
        mapping_source: ''
    });

    const { data: copyData, setData: setCopyData, post: postCopy, processing: processingCopy, reset: resetCopy, errors: copyErrors } = useForm({
        from_day: 'senin',
        to_days: []
    });

    // Form khusus untuk delete all agar tidak konflik dengan form utama yang memiliki default day='senin'
    const { data: deleteAllData, setData: setDeleteAllData, delete: destroyAll, processing: processingDeleteAll } = useForm({
        day: ''
    });

    const openModal = (day, slot = null) => {
        if (slot) {
            setEditingSlot(slot);
            setData({
                day: slot.day,
                period_order: slot.period_order,
                activity_type_id: slot.activity_type_id,
                start_time: slot.start_time.substring(0, 5), // Format HH:mm
                end_time: slot.end_time.substring(0, 5),
                mapping_source: slot.mapping_source || ''
            });
        } else {
            setEditingSlot(null);
            // Auto-increment period order based on last slot
            const daySlots = timeSlots[day] || [];
            const lastOrder = daySlots.length > 0 ? Math.max(...daySlots.map(s => s.period_order)) : 0;
            
            setData({
                day: day,
                period_order: lastOrder + 1,
                activity_type_id: activityTypes.length > 0 ? activityTypes[0].id : '',
                start_time: '',
                end_time: '',
                mapping_source: ''
            });
        }
        setSelectedDay(day);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSlot(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSlot) {
            put(route('admin.schedule-templates.time-slots.update', [template.id, editingSlot.id]), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.schedule-templates.time-slots.store', template.id), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (slot) => {
        setSlotToDelete(slot);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.schedule-templates.time-slots.destroy', [template.id, slotToDelete.id]), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSlotToDelete(null);
            }
        });
    };

    const openCopyModal = (day) => {
        setCopyFromDay(day);
        setCopyData({
            from_day: day,
            to_days: []
        });
        setShowCopyModal(true);
    };

    const closeCopyModal = () => {
        setShowCopyModal(false);
        resetCopy();
    };

    const handleCopySubmit = (e) => {
        e.preventDefault();
        postCopy(route('admin.schedule-templates.time-slots.copy', template.id), {
            onSuccess: closeCopyModal
        });
    };

    const handleDaySelection = (day) => {
        const currentDays = copyData.to_days;
        if (currentDays.includes(day)) {
            setCopyData('to_days', currentDays.filter(d => d !== day));
        } else {
            setCopyData('to_days', [...currentDays, day]);
        }
    };

    const confirmDeleteAll = (day) => {
        setDeleteAllData('day', day);
        setDayToDeleteAll(day);
        setShowDeleteAllModal(true);
    };

    const handleDeleteAll = () => {
        destroyAll(route('admin.schedule-templates.time-slots.destroy-all', template.id), {
            onSuccess: () => {
                setShowDeleteAllModal(false);
                setDayToDeleteAll(null);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Atur Slot Waktu: {template.name}
                    </h2>
                    <Link
                        href={route('admin.schedule-templates.index')}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        &larr; Kembali ke Daftar Template
                    </Link>
                </div>
            }
        >
            <Head title={`Slot Waktu - ${template.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {days.map((day) => (
                            <div key={day} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">{day}</h3>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => confirmDeleteAll(day)}
                                            className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                                            title="Hapus semua slot hari ini"
                                        >
                                            Hapus Semua
                                        </button>
                                        <button
                                            onClick={() => openCopyModal(day)}
                                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                            title="Copy ke hari lain"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => openModal(day)}
                                            className="text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800"
                                        >
                                            + Slot
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {(timeSlots[day] || []).map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    Jam ke-{slot.period_order} ({slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)})
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                    {slot.activity_type?.name} {slot.mapping_source ? `(Map: ${slot.mapping_source})` : ''}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(day, slot)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(slot)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(timeSlots[day] || []).length === 0 && (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">Belum ada slot waktu</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={showModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 capitalize">
                        {editingSlot ? 'Edit Slot Waktu' : `Tambah Slot Waktu (${selectedDay})`}
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="period_order" value="Jam Ke-" className="dark:text-gray-300" />
                            <TextInput
                                id="period_order"
                                type="number"
                                className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                value={data.period_order}
                                onChange={(e) => setData('period_order', e.target.value)}
                                required
                            />
                            <InputError message={errors.period_order} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="activity_type_id" value="Jenis Kegiatan" className="dark:text-gray-300" />
                            <select
                                id="activity_type_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.activity_type_id}
                                onChange={(e) => setData('activity_type_id', e.target.value)}
                                required
                            >
                                <option value="">Pilih Kegiatan</option>
                                {activityTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.activity_type_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="start_time" value="Waktu Mulai" className="dark:text-gray-300" />
                            <TextInput
                                id="start_time"
                                type="time"
                                className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                required
                            />
                            <InputError message={errors.start_time} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="end_time" value="Waktu Selesai" className="dark:text-gray-300" />
                            <TextInput
                                id="end_time"
                                type="time"
                                className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                required
                            />
                            <InputError message={errors.end_time} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="mapping_source" value="Mapping Source (Opsional)" className="dark:text-gray-300" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Isi dengan angka urutan KBM jika slot ini adalah jam pelajaran. Contoh: "1" untuk jam pelajaran pertama. Kosongkan jika istirahat/upacara.
                        </p>
                        <TextInput
                            id="mapping_source"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.mapping_source}
                            onChange={(e) => setData('mapping_source', e.target.value)}
                            placeholder="Contoh: 1"
                        />
                        <InputError message={errors.mapping_source} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingSlot ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Copy Confirmation Modal */}
            <Modal show={showCopyModal} onClose={closeCopyModal}>
                <form onSubmit={handleCopySubmit} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Salin Slot Waktu dari <span className="capitalize font-bold">{copyFromDay}</span>
                    </h2>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Pilih hari tujuan untuk menyalin semua slot waktu. <br/>
                        <span className="text-red-500 font-bold">PERINGATAN:</span> Slot waktu yang sudah ada di hari tujuan akan dihapus/ditimpa.
                    </p>

                    {copyErrors.to_days && (
                        <div className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {copyErrors.to_days}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {days.filter(d => d !== copyFromDay).map(day => (
                            <label key={day} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    checked={copyData.to_days.includes(day)}
                                    onChange={() => handleDaySelection(day)}
                                />
                                <span className="capitalize text-gray-700 dark:text-gray-300">{day}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeCopyModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processingCopy || copyData.to_days.length === 0}>
                            Salin Slot
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus slot waktu ini?
                    </h2>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Delete All Confirmation Modal */}
            <Modal show={showDeleteAllModal} onClose={() => setShowDeleteAllModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus SEMUA slot waktu hari <span className="capitalize font-bold">{dayToDeleteAll}</span>?
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Tindakan ini tidak dapat dibatalkan. Semua slot waktu pada hari tersebut akan dihapus permanen.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteAllModal(false)} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDeleteAll} disabled={processingDeleteAll}>
                            Hapus Semua
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}