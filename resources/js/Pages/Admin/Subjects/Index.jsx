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

export default function SubjectIndex({ auth, subjects }) {
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        code: ''
    });

    const openModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setData({
                name: subject.name,
                code: subject.code
            });
        } else {
            setEditingSubject(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSubject(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSubject) {
            put(route('admin.subjects.update', editingSubject.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.subjects.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.subjects.destroy', subjectToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSubjectToDelete(null);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Data Mata Pelajaran</h2>}
        >
            <Head title="Kelola Mapel" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Mata Pelajaran</h3>
                            <PrimaryButton onClick={() => openModal()}>
                                Tambah Mapel
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Mata Pelajaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {subjects.map((subject) => (
                                        <tr key={subject.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{subject.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{subject.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(subject)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(subject)}
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
                        {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="code" value="Kode Mapel (Contoh: MTK, IND)" className="dark:text-gray-300" />
                        <TextInput
                            id="code"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            required
                            isFocused
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Nama Mata Pelajaran" className="dark:text-gray-300" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingSubject ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus mata pelajaran ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            Hapus Mapel
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}