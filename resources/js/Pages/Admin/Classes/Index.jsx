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

export default function ClassIndex({ auth, classes, statuses }) {
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        level: '',
        class_status_id: ''
    });

    const openModal = (cls = null) => {
        if (cls) {
            setEditingClass(cls);
            setData({
                name: cls.name,
                level: cls.level || '',
                class_status_id: cls.class_status_id || ''
            });
        } else {
            setEditingClass(null);
            // Set default status if available
            const defaultStatus = statuses.length > 0 ? statuses[0].id : '';
            setData({
                name: '',
                level: '',
                class_status_id: defaultStatus
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClass(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClass) {
            put(route('admin.classes.update', editingClass.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.classes.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (cls) => {
        setClassToDelete(cls);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.classes.destroy', classToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setClassToDelete(null);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Data Kelas</h2>}
        >
            <Head title="Kelola Kelas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Kelas</h3>
                            <PrimaryButton onClick={() => openModal()}>
                                Tambah Kelas
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kelas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tingkat</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah Siswa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {classes.map((cls) => (
                                        <tr key={cls.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{cls.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{cls.level}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {cls.students_count} Siswa
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {cls.class_status ? (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${cls.class_status.color}-100 text-${cls.class_status.color}-800 dark:bg-${cls.class_status.color}-900 dark:text-${cls.class_status.color}-200`}>
                                                        {cls.class_status.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(cls)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(cls)}
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
                        {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Nama Kelas (Contoh: X RPL 1)" className="dark:text-gray-300" />
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

                    <div className="mb-4">
                        <InputLabel htmlFor="level" value="Tingkat (Contoh: 10, 11, 12)" className="dark:text-gray-300" />
                        <TextInput
                            id="level"
                            type="number"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            required
                        />
                        <InputError message={errors.level} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="class_status_id" value="Status" className="dark:text-gray-300" />
                        <select
                            id="class_status_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.class_status_id}
                            onChange={(e) => setData('class_status_id', e.target.value)}
                            required
                        >
                            <option value="">Pilih Status</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.class_status_id} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingClass ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus kelas ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            Hapus Kelas
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}