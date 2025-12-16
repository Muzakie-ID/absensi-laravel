import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function Create({ schedule, lastAttendance }) {
    const { data, setData, post, processing, errors } = useForm({
        status: 'present',
        photo: null,
        lat: '',
        long: '',
        notes: '',
    });

    const [locationStatus, setLocationStatus] = useState('Mencari lokasi...');
    const [preview, setPreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    }));
                    setLocationStatus('Lokasi ditemukan ✅');
                },
                (error) => {
                    setLocationStatus('Gagal mengambil lokasi ❌. Pastikan GPS aktif.');
                    console.error("Error Code = " + error.code + " - " + error.message);
                }
            );
        } else {
            setLocationStatus('Browser tidak mendukung Geolocation');
        }
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setIsCompressing(true);

            try {
                const options = {
                    maxSizeMB: 0.5, // Kompres jadi max 0.5MB
                    maxWidthOrHeight: 1280, // Resize lebar/tinggi max 1280px
                    useWebWorker: true,
                    initialQuality: 0.7,
                };

                const compressedFile = await imageCompression(file, options);
                
                // Kembalikan ke object File agar terbaca oleh Inertia/Laravel
                const newFile = new File([compressedFile], file.name, { type: file.type });
                
                setData('photo', newFile);
                console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                console.log(`Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (error) {
                console.error("Gagal mengompres gambar:", error);
                setData('photo', file); // Fallback ke file asli jika gagal
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('attendance.store', schedule.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Form Absensi
                </h2>
            }
        >
            <Head title="Absensi" />

            <div className="py-6">
                <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            {/* Info Jadwal */}
                            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {schedule.subject.name}
                                </h3>
                                <p className="text-blue-700 dark:text-blue-300">
                                    Kelas: {schedule.school_class.name}
                                </p>
                            </div>

                            {/* Flashback Materi Terakhir */}
                            {lastAttendance && (
                                <div className="mb-8 rounded-lg bg-yellow-50 p-4 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">🔔</span>
                                        <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                                            FLASHBACK (Materi Terakhir)
                                        </h3>
                                    </div>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                                        Pertemuan sebelumnya ({new Date(lastAttendance.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}):
                                    </p>
                                    <div className="p-3 bg-white rounded border border-yellow-100 dark:bg-gray-800 dark:border-gray-700 italic text-gray-600 dark:text-gray-300">
                                        "{lastAttendance.notes || 'Tidak ada catatan materi.'}"
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                
                                {/* Status Kehadiran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status Kehadiran
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="present">Hadir (Mengajar)</option>
                                        <option value="late">Terlambat</option>
                                        <option value="permit">Izin (Tugas Dinas/Lainnya)</option>
                                        <option value="sick">Sakit</option>
                                    </select>
                                    {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
                                </div>

                                {/* Lokasi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Koordinat Lokasi (Opsional)
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={data.lat && data.long ? `${data.lat}, ${data.long}` : ''}
                                            className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                            placeholder="Menunggu GPS..."
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 ${locationStatus.includes('✅') ? 'text-green-600' : 'text-gray-500'}`}>
                                        {locationStatus}
                                    </p>
                                </div>

                                {/* Foto Bukti */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Foto Bukti (Selfie/Kelas)
                                    </label>
                                    
                                    {preview && (
                                        <div className="mb-2 mt-2">
                                            <img src={preview} alt="Preview" className="h-48 w-full object-cover rounded-lg border border-gray-300" />
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Membuka kamera belakang di HP
                                        onChange={handlePhotoChange}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                                    />
                                    {errors.photo && <div className="text-red-500 text-sm mt-1">{errors.photo}</div>}
                                </div>

                                {/* Catatan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                        rows="3"
                                        placeholder="Materi yang diajarkan atau keterangan izin..."
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing || isCompressing}
                                        className="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Menyimpan...' : (isCompressing ? 'Mengompres Foto...' : 'Kirim Absensi')}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}