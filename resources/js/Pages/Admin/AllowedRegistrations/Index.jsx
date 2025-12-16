import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function AllowedRegistrationIndex({ auth, registrations, type, filters, classes }) {
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        identity_number: '',
        name: '',
        role_type: type,
        school_class_id: ''
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                identity_number: item.identity_number,
                name: item.name,
                role_type: item.role_type,
                school_class_id: item.school_class_id || ''
            });
        } else {
            setEditingItem(null);
            reset();
            setData({
                identity_number: '',
                name: '',
                role_type: type,
                school_class_id: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.allowed-registrations.update', editingItem.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.allowed-registrations.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.allowed-registrations.destroy', itemToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setItemToDelete(null);
            }
        });
    };

    const handleTypeChange = (newType) => {
        router.get(route('admin.allowed-registrations.index'), { type: newType }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Master Data {type === 'teacher' ? 'Guru' : 'Siswa'}</h2>}
        >
            <Head title={`Master Data ${type === 'teacher' ? 'Guru' : 'Siswa'}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs */}
                        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => handleTypeChange('teacher')}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    type === 'teacher'
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Data Guru
                            </button>
                            <button
                                onClick={() => handleTypeChange('student')}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    type === 'student'
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Data Siswa
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Daftar {type === 'teacher' ? 'Guru' : 'Siswa'} (Whitelist)
                            </h3>
                            <div className="flex gap-2">
                                <a
                                    href={route('admin.allowed-registrations.export', { type })}
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    Export
                                </a>
                                <PrimaryButton onClick={() => openModal()}>
                                    Tambah Data
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {type === 'teacher' ? 'NIP' : 'NIS'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode Kupon</th>
                                        {type === 'student' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status Registrasi</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {registrations.data.length > 0 ? (
                                        registrations.data.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {item.identity_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                                                    {item.registration_code || '-'}
                                                </td>
                                                {type === 'student' && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {item.school_class ? item.school_class.name : '-'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {item.is_registered ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Sudah Terdaftar
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            Belum Terdaftar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openModal(item)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(item)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Belum ada data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {registrations.links && registrations.links.length > 3 && (
                            <div className="mt-4 flex justify-center">
                                <div className="flex gap-1">
                                    {registrations.links.map((link, k) => (
                                        <Link
                                            key={k}
                                            href={link.url}
                                            className={`px-3 py-1 border rounded text-sm ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={showModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {editingItem ? 'Edit Data' : 'Tambah Data Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="identity_number" value={type === 'teacher' ? 'NIP' : 'NIS'} className="dark:text-gray-300" />
                        <TextInput
                            id="identity_number"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.identity_number}
                            onChange={(e) => setData('identity_number', e.target.value)}
                            required
                            isFocused
                        />
                        <InputError message={errors.identity_number} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="dark:text-gray-300" />
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

                    {type === 'student' && (
                        <div className="mb-4">
                            <InputLabel htmlFor="school_class_id" value="Kelas" className="dark:text-gray-300" />
                            <select
                                id="school_class_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={data.school_class_id}
                                onChange={(e) => setData('school_class_id', e.target.value)}
                            >
                                <option value="">Pilih Kelas</option>
                                {classes && classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.school_class_id} className="mt-2" />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {editingItem ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus data ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan. Jika user sudah terdaftar, mereka mungkin tidak bisa login atau data menjadi tidak konsisten.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete} disabled={processing}>
                            Hapus Data
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
