import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, reports }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        url: window.location.href,
        priority: 'medium',
        screenshot: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('bug-reports.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Laporan Masalah</h2>}
        >
            <Head title="Laporan Masalah" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <PrimaryButton onClick={() => setShowModal(true)}>
                            Buat Laporan Baru
                        </PrimaryButton>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {reports.data.length === 0 ? (
                                <p className="text-center text-gray-500">Belum ada laporan yang dikirim.</p>
                            ) : (
                                <div className="space-y-6">
                                    {reports.data.map((report) => (
                                        <div key={report.id} className="border rounded-lg p-4 dark:border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{report.title}</h3>
                                                    <p className="text-sm text-gray-500">{new Date(report.created_at).toLocaleString()}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                                                    {getStatusLabel(report.status)}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <p className="whitespace-pre-wrap">{report.description}</p>
                                            </div>

                                            {report.screenshot_path && (
                                                <div className="mt-2">
                                                    <a href={`/storage/${report.screenshot_path}`} target="_blank" className="text-blue-600 hover:underline text-sm">
                                                        Lihat Screenshot
                                                    </a>
                                                </div>
                                            )}

                                            {report.admin_response && (
                                                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md border-l-4 border-blue-500">
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Respon Admin:</p>
                                                    <p className="text-sm mt-1">{report.admin_response}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Laporkan Masalah
                    </h2>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="title" value="Judul Masalah" />
                            <TextInput
                                id="title"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError className="mt-2" message={errors.title} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi Detail" />
                            <TextArea
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                required
                                rows="4"
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div>
                            <InputLabel htmlFor="priority" value="Prioritas" />
                            <select
                                id="priority"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                            >
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                                <option value="critical">Kritis</option>
                            </select>
                            <InputError className="mt-2" message={errors.priority} />
                        </div>

                        <div>
                            <InputLabel htmlFor="screenshot" value="Screenshot (Opsional)" />
                            <input
                                type="file"
                                id="screenshot"
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                                onChange={(e) => setData('screenshot', e.target.files[0])}
                                accept="image/*"
                            />
                            <InputError className="mt-2" message={errors.screenshot} />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                Batal
                            </SecondaryButton>

                            <PrimaryButton className="ms-3" disabled={processing}>
                                Kirim Laporan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
