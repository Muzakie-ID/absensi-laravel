import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Checkbox from '@/Components/Checkbox';

export default function HolidayIndex({ auth, holidays, apiUrl }) {
    const [showModal, setShowModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);

    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

    // Form untuk CRUD Holiday
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        date: '',
        description: '',
        is_cuti: false
    });

    // Form untuk Update API URL
    const { data: apiData, setData: setApiData, post: postApi, processing: processingApi, errors: errorsApi } = useForm({
        api_url: apiUrl || ''
    });

    const openModal = (holiday = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            // Pastikan format tanggal YYYY-MM-DD untuk input type="date"
            const formattedDate = holiday.date.split('T')[0]; 
            setData({
                date: formattedDate,
                description: holiday.description,
                is_cuti: holiday.is_cuti
            });
        } else {
            setEditingHoliday(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingHoliday(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingHoliday) {
            put(route('admin.holidays.update', editingHoliday.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.holidays.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (holiday) => {
        setHolidayToDelete(holiday);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.holidays.destroy', holidayToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setHolidayToDelete(null);
            }
        });
    };

    const handleDeleteAll = () => {
        destroy(route('admin.holidays.destroy-all'), {
            onSuccess: () => {
                setShowDeleteAllModal(false);
            }
        });
    };

    const handleUpdateApi = (e) => {
        e.preventDefault();
        postApi(route('admin.holidays.update-api'));
    };

    const handleSync = () => {
        if (confirm('Apakah Anda yakin ingin melakukan sinkronisasi data hari libur dari API? Data yang ada mungkin akan diperbarui.')) {
            router.post(route('admin.holidays.sync'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Hari Libur</h2>}
        >
            <Head title="Kelola Hari Libur" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Section Konfigurasi API */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Konfigurasi API Hari Libur</h3>
                        <form onSubmit={handleUpdateApi} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <InputLabel htmlFor="api_url" value="URL API" />
                                <TextInput
                                    id="api_url"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={apiData.api_url}
                                    onChange={(e) => setApiData('api_url', e.target.value)}
                                    placeholder="https://api-harilibur.vercel.app/api"
                                />
                                <InputError message={errorsApi.api_url} className="mt-2" />
                            </div>
                            <PrimaryButton disabled={processingApi}>
                                Simpan URL
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={handleSync} disabled={!apiUrl}>
                                🔄 Sinkronisasi Sekarang
                            </SecondaryButton>
                        </form>
                    </div>

                    {/* Section Daftar Hari Libur */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Hari Libur</h3>
                            <div className="flex gap-2">
                                <DangerButton onClick={() => setShowDeleteAllModal(true)}>
                                    Hapus Semua
                                </DangerButton>
                                <PrimaryButton onClick={() => openModal()}>
                                    Tambah Hari Libur Manual
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jenis</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {holidays.map((holiday) => (
                                        <tr key={holiday.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {new Date(holiday.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{holiday.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {holiday.is_cuti ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Cuti Bersama
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Libur Nasional
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(holiday)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(holiday)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {holidays.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Belum ada data hari libur. Silakan tambahkan manual atau sinkronisasi dari API.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {editingHoliday ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="date" value="Tanggal" />
                        <TextInput
                            id="date"
                            type="date"
                            name="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                        />
                        <InputError message={errors.date} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="description" value="Keterangan" />
                        <TextInput
                            id="description"
                            type="text"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Hari Raya Idul Fitri"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-6 block">
                        <label className="flex items-center">
                            <Checkbox
                                name="is_cuti"
                                checked={data.is_cuti}
                                onChange={(e) => setData('is_cuti', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">Cuti Bersama</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {editingHoliday ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus data ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete} disabled={processing}>
                            Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showDeleteAllModal} onClose={() => setShowDeleteAllModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus SEMUA data hari libur?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Tindakan ini akan menghapus seluruh data hari libur yang ada di database. Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteAllModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDeleteAll} disabled={processing}>
                            Hapus Semua
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
