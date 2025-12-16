import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextArea from '@/Components/TextArea';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function Index({ auth, reports }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        status: 'pending',
        admin_response: '',
    });

    const openModal = (report) => {
        setSelectedReport(report);
        setData({
            status: report.status,
            admin_response: report.admin_response || '',
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.bug-reports.update', selectedReport.id), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                setSelectedReport(null);
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'in_progress': return 'Sedang Proses';
            case 'resolved': return 'Selesai';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Laporan Masalah</h2>}
        >
            <Head title="Kelola Laporan Masalah" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pelapor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Masalah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioritas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {reports.data.map((report) => (
                                            <tr key={report.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {report.user.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="font-bold">{report.title}</div>
                                                    <div className="truncate max-w-xs">{report.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                        ${report.priority === 'critical' ? 'bg-red-200 text-red-900' : 
                                                          report.priority === 'high' ? 'bg-orange-200 text-orange-900' : 
                                                          report.priority === 'medium' ? 'bg-blue-200 text-blue-900' : 
                                                          'bg-gray-200 text-gray-900'}`}>
                                                        {report.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                                                        {getStatusLabel(report.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openModal(report)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        Respon
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
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Respon Laporan: {selectedReport?.title}
                    </h2>

                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2"><strong>Deskripsi:</strong></p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selectedReport?.description}</p>
                        {selectedReport?.screenshot_path && (
                            <div className="mt-2">
                                <a href={`/storage/${selectedReport.screenshot_path}`} target="_blank" className="text-blue-600 hover:underline text-sm">
                                    Lihat Screenshot
                                </a>
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="status" value="Update Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">Menunggu</option>
                                <option value="in_progress">Sedang Proses</option>
                                <option value="resolved">Selesai</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                            <InputError className="mt-2" message={errors.status} />
                        </div>

                        <div>
                            <InputLabel htmlFor="admin_response" value="Respon Admin" />
                            <TextArea
                                id="admin_response"
                                className="mt-1 block w-full"
                                value={data.admin_response}
                                onChange={(e) => setData('admin_response', e.target.value)}
                                rows="4"
                                placeholder="Tulis pesan balasan untuk pelapor..."
                            />
                            <InputError className="mt-2" message={errors.admin_response} />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                Batal
                            </SecondaryButton>

                            <PrimaryButton className="ms-3" disabled={processing}>
                                Simpan Respon
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
