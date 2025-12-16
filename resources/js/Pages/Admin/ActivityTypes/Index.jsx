import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ActivityTypeIndex({ auth, activityTypes }) {
    const [showModal, setShowModal] = useState(false);
    const [editingActivityType, setEditingActivityType] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activityTypeToDelete, setActivityTypeToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: ''
    });

    const openModal = (activityType = null) => {
        if (activityType) {
            setEditingActivityType(activityType);
            setData({
                name: activityType.name,
                description: activityType.description || ''
            });
        } else {
            setEditingActivityType(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingActivityType(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingActivityType) {
            put(route('admin.activity-types.update', editingActivityType.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.activity-types.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (activityType) => {
        setActivityTypeToDelete(activityType);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.activity-types.destroy', activityTypeToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setActivityTypeToDelete(null);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Jenis Kegiatan</h2>}
        >
            <Head title="Kelola Jenis Kegiatan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Jenis Kegiatan</h3>
                            <PrimaryButton onClick={() => openModal()}>
                                Tambah Jenis Kegiatan
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kegiatan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deskripsi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {activityTypes.map((activityType) => (
                                        <tr key={activityType.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{activityType.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{activityType.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(activityType)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(activityType)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={showModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {editingActivityType ? 'Edit Jenis Kegiatan' : 'Tambah Jenis Kegiatan Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Nama Kegiatan" className="dark:text-gray-300" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="description" value="Deskripsi (Opsional)" className="dark:text-gray-300" />
                        <TextInput
                            id="description"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingActivityType ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus jenis kegiatan ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
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
        </AuthenticatedLayout>
    );
}
