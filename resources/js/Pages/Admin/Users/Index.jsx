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
import axios from 'axios';

export default function UserIndex({ auth, users, roles, classes }) {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [checking, setChecking] = useState(false);
    const [checkMessage, setCheckMessage] = useState('');
    const [checkStatus, setCheckStatus] = useState(''); // 'success' or 'error'

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        username: '',
        identity_number: '',
        email: '',
        role_id: '',
        school_class_id: '',
        password: '',
        password_confirmation: ''
    });

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setData({
                name: user.name,
                username: user.username || '',
                identity_number: user.identity_number || '',
                email: user.email,
                role_id: user.role_id,
                school_class_id: user.school_class_id || '',
                password: '',
                password_confirmation: ''
            });
        } else {
            setEditingUser(null);
            reset();
            // Default role to Teacher (2) if available, or first role
            setData({
                name: '',
                username: '',
                identity_number: '',
                email: '',
                role_id: roles.length > 0 ? roles[0].id : '',
                school_class_id: '',
                password: '',
                password_confirmation: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setCheckMessage('');
        setCheckStatus('');
        reset();
    };

    const checkIdentity = async () => {
        if (!data.identity_number) {
            setCheckMessage('Masukkan NIP / NIS terlebih dahulu.');
            setCheckStatus('error');
            return;
        }

        setChecking(true);
        setCheckMessage('');
        setCheckStatus('');

        try {
            const response = await axios.post(route('admin.allowed-registrations.check'), {
                identity_number: data.identity_number
            });

            if (response.data.found) {
                setCheckMessage('Data ditemukan! Nama dan Peran telah diisi otomatis.');
                setCheckStatus('success');
                
                // Find role ID based on role_type string
                // Assuming roles prop contains objects like {id: 1, name: 'admin'}, {id: 2, name: 'teacher'}, etc.
                // Backend returns 'teacher' or 'student'
                const roleType = response.data.role_type; // 'teacher' or 'student'
                const matchedRole = roles.find(r => r.name.toLowerCase() === roleType.toLowerCase());
                
                setData(prevData => ({
                    ...prevData,
                    name: response.data.name,
                    role_id: matchedRole ? matchedRole.id : prevData.role_id,
                    school_class_id: response.data.school_class_id || ''
                }));
            } else {
                setCheckMessage(response.data.message || 'Data tidak ditemukan.');
                setCheckStatus('error');
                // Optional: Clear name if not found?
                // setData('name', '');
            }
        } catch (error) {
            console.error(error);
            setCheckMessage('Terjadi kesalahan saat mengecek data.');
            setCheckStatus('error');
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('admin.users.update', editingUser.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: closeModal
            });
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route('admin.users.destroy', userToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setUserToDelete(null);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Pengguna</h2>}
        >
            <Head title="Kelola Pengguna" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Pengguna</h3>
                            <PrimaryButton onClick={() => openModal()}>
                                Tambah Pengguna
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NIP / NIS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {user.identity_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.username || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role_id === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                                    user.role_id === 2 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                    {user.role ? user.role.name : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                {user.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => confirmDelete(user)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
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
                        {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="identity_number" value="NIP / NIS (Opsional)" className="dark:text-gray-300" />
                        <div className="flex gap-2">
                            <TextInput
                                id="identity_number"
                                type="text"
                                className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                value={data.identity_number}
                                onChange={(e) => {
                                    setData('identity_number', e.target.value);
                                    if (!editingUser) {
                                        setCheckStatus('');
                                        setCheckMessage('');
                                    }
                                }}
                                isFocused
                            />
                            {!editingUser && (
                                <SecondaryButton 
                                    type="button" 
                                    onClick={checkIdentity}
                                    className="mt-1"
                                    disabled={checking}
                                >
                                    {checking ? 'Mengecek...' : 'Cek Data'}
                                </SecondaryButton>
                            )}
                        </div>
                        <InputError message={errors.identity_number} className="mt-2" />
                        {checkMessage && (
                            <p className={`mt-2 text-sm ${checkStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {checkMessage}
                            </p>
                        )}
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

                    <div className="mb-4">
                        <InputLabel htmlFor="username" value="Username" className="dark:text-gray-300" />
                        <TextInput
                            id="username"
                            type="text"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" className="dark:text-gray-300" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="role_id" value="Peran" className="dark:text-gray-300" />
                        <select
                            id="role_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.role_id}
                            onChange={(e) => setData('role_id', e.target.value)}
                            required
                        >
                            <option value="">Pilih Peran</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.role_id} className="mt-2" />
                    </div>

                    {/* Show Class Dropdown if Role is Student (assuming role_id 4 is student, or check by name) */}
                    {roles.find(r => r.id == data.role_id)?.name === 'student' && (
                        <div className="mb-4">
                            <InputLabel htmlFor="school_class_id" value="Kelas" className="dark:text-gray-300" />
                            <select
                                id="school_class_id"
                                className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${
                                    !editingUser && checkStatus === 'success' && data.school_class_id ? 'bg-gray-100 dark:bg-gray-800 opacity-75 cursor-not-allowed' : ''
                                }`}
                                value={data.school_class_id}
                                onChange={(e) => setData('school_class_id', e.target.value)}
                                required
                                disabled={!editingUser && checkStatus === 'success' && !!data.school_class_id}
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

                    <div className="mb-4">
                        <InputLabel htmlFor="password" value={editingUser ? "Password (Kosongkan jika tidak ingin mengubah)" : "Password"} className="dark:text-gray-300" />
                        <TextInput
                            id="password"
                            type="password"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required={!editingUser}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="dark:text-gray-300" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required={!editingUser || data.password.length > 0}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingUser ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus pengguna ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            Hapus Pengguna
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}