import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function ClassPromotionIndex({ auth, classes, levels, students, filters }) {
    const [mode, setMode] = useState('class'); // 'class' or 'level'

    // --- Mode: Per Kelas ---
    const { data, setData, post, processing, errors, reset } = useForm({
        from_class_id: filters.from_class_id || '',
        to_class_id: '',
        student_ids: []
    });

    const [selectAll, setSelectAll] = useState(false);

    // Handle "From Class" change -> Reload page to fetch students
    const handleFromClassChange = (e) => {
        const classId = e.target.value;
        setData('from_class_id', classId);
        router.get(route('admin.class-promotions.index'), { from_class_id: classId }, { preserveState: true });
    };

    // Handle Select All
    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked);
        if (e.target.checked) {
            setData('student_ids', students.map(s => s.id));
        } else {
            setData('student_ids', []);
        }
    };

    // Handle Individual Checkbox
    const handleCheckboxChange = (id, checked) => {
        if (checked) {
            setData('student_ids', [...data.student_ids, id]);
        } else {
            setData('student_ids', data.student_ids.filter(sid => sid !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.class-promotions.store'), {
            onSuccess: () => {
                setSelectAll(false);
                reset('student_ids', 'to_class_id');
            }
        });
    };

    // --- Mode: Per Tingkat ---
    const { data: levelData, setData: setLevelData, post: postLevel, processing: processingLevel, errors: errorsLevel } = useForm({
        from_level: '',
        to_level: '',
        mappings: [] // Array of { from_class_id, to_class_id }
    });

    const handleFromLevelChange = (e) => {
        const lvl = e.target.value;
        const sourceClasses = classes.filter(c => c.level == lvl);
        
        // Initialize mappings
        const initialMappings = sourceClasses.map(c => ({
            from_class_id: c.id,
            from_class_name: c.name,
            to_class_id: '' // Default empty
        }));

        setLevelData(prev => ({
            ...prev,
            from_level: lvl,
            mappings: initialMappings
        }));
    };

    // Auto-fill mappings when target level changes
    useEffect(() => {
        if (levelData.from_level && levelData.to_level && levelData.to_level !== 'alumni') {
            const sourceClasses = classes.filter(c => c.level == levelData.from_level);
            const targetClasses = classes.filter(c => c.level == levelData.to_level);
            
            const newMappings = sourceClasses.map(source => {
                // Try to find a matching class name (e.g., X RPL 1 -> XI RPL 1)
                // Simple heuristic: check if the suffix matches (e.g. "RPL 1")
                // This assumes naming convention like "X-RPL-1" or "X RPL 1"
                
                // Remove the level prefix (X, XI, XII, 10, 11, 12) to find the "core" name
                const cleanName = (name) => name.replace(/^(X|XI|XII|10|11|12)[-\s]+/, '');
                const sourceCore = cleanName(source.name);

                const match = targetClasses.find(target => cleanName(target.name) === sourceCore);
                
                return {
                    from_class_id: source.id,
                    from_class_name: source.name,
                    to_class_id: match ? match.id : ''
                };
            });
            
            setLevelData('mappings', newMappings);
        } else if (levelData.to_level === 'alumni') {
             const sourceClasses = classes.filter(c => c.level == levelData.from_level);
             const newMappings = sourceClasses.map(source => ({
                from_class_id: source.id,
                from_class_name: source.name,
                to_class_id: 'alumni'
            }));
            setLevelData('mappings', newMappings);
        }
    }, [levelData.to_level, levelData.from_level]);

    const handleMappingChange = (index, toClassId) => {
        const newMappings = [...levelData.mappings];
        newMappings[index].to_class_id = toClassId;
        setLevelData('mappings', newMappings);
    };

    const handleLevelSubmit = (e) => {
        e.preventDefault();
        postLevel(route('admin.class-promotions.store-level'));
    };

    // Filter classes for dropdowns
    const getClassesByLevel = (lvl) => classes.filter(c => c.level == lvl);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kenaikan Kelas / Pindah Kelas</h2>}
        >
            <Head title="Kenaikan Kelas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs */}
                        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setMode('class')}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    mode === 'class'
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Pindah Per Kelas (Manual)
                            </button>
                            <button
                                onClick={() => setMode('level')}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    mode === 'level'
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Kenaikan Tingkat (Massal)
                            </button>
                        </div>

                        {mode === 'class' ? (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Source Class */}
                                    <div>
                                        <InputLabel htmlFor="from_class_id" value="Dari Kelas (Asal)" className="dark:text-gray-300" />
                                        <select
                                            id="from_class_id"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.from_class_id}
                                            onChange={handleFromClassChange}
                                        >
                                            <option value="">Pilih Kelas Asal</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name} {cls.level ? `(Tingkat ${cls.level})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.from_class_id && <div className="text-red-600 text-sm mt-1">{errors.from_class_id}</div>}
                                    </div>

                                    {/* Target Class */}
                                    <div>
                                        <InputLabel htmlFor="to_class_id" value="Ke Kelas (Tujuan)" className="dark:text-gray-300" />
                                        <select
                                            id="to_class_id"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.to_class_id}
                                            onChange={(e) => setData('to_class_id', e.target.value)}
                                            disabled={!data.from_class_id}
                                        >
                                            <option value="">Pilih Kelas Tujuan</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id} disabled={cls.id == data.from_class_id}>
                                                    {cls.name} {cls.level ? `(Tingkat ${cls.level})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.to_class_id && <div className="text-red-600 text-sm mt-1">{errors.to_class_id}</div>}
                                    </div>
                                </div>

                                {/* Student List */}
                                {data.from_class_id && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                Daftar Siswa ({students.length})
                                            </h3>
                                            <div className="flex items-center">
                                                <Checkbox
                                                    id="select_all"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                                <label htmlFor="select_all" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                    Pilih Semua
                                                </label>
                                            </div>
                                        </div>

                                        <div className="border rounded-md overflow-hidden dark:border-gray-700">
                                            <div className="max-h-96 overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                                                                #
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                NIS
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Nama Siswa
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {students.length > 0 ? (
                                                            students.map((student) => (
                                                                <tr key={student.id} className={data.student_ids.includes(student.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <Checkbox
                                                                            checked={data.student_ids.includes(student.id)}
                                                                            onChange={(e) => handleCheckboxChange(student.id, e.target.checked)}
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                        {student.identity_number}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                        {student.name}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                                    Tidak ada siswa di kelas ini.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {errors.student_ids && <div className="text-red-600 text-sm mt-2">{errors.student_ids}</div>}

                                        <div className="mt-6 flex justify-end">
                                            <PrimaryButton disabled={processing || data.student_ids.length === 0 || !data.to_class_id}>
                                                Pindahkan {data.student_ids.length} Siswa
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <form onSubmit={handleLevelSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Source Level */}
                                    <div>
                                        <InputLabel htmlFor="from_level" value="Dari Tingkat (Asal)" className="dark:text-gray-300" />
                                        <select
                                            id="from_level"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={levelData.from_level}
                                            onChange={handleFromLevelChange}
                                        >
                                            <option value="">Pilih Tingkat Asal</option>
                                            {levels && levels.map((lvl) => (
                                                <option key={lvl} value={lvl}>
                                                    Tingkat {lvl}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Target Level */}
                                    <div>
                                        <InputLabel htmlFor="to_level" value="Ke Tingkat (Tujuan)" className="dark:text-gray-300" />
                                        <select
                                            id="to_level"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={levelData.to_level}
                                            onChange={(e) => setLevelData('to_level', e.target.value)}
                                            disabled={!levelData.from_level}
                                        >
                                            <option value="">Pilih Tingkat Tujuan</option>
                                            {levels && levels.map((lvl) => (
                                                <option key={lvl} value={lvl} disabled={lvl == levelData.from_level}>
                                                    Tingkat {lvl}
                                                </option>
                                            ))}
                                            <option value="alumni" className="text-red-600 font-bold">Luluskan Siswa (Alumni)</option>
                                        </select>
                                    </div>
                                </div>

                                {levelData.from_level && levelData.to_level && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            Mapping Kelas
                                        </h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                                            <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-gray-500 dark:text-gray-300">
                                                <div className="col-span-5">Kelas Asal (Tingkat {levelData.from_level})</div>
                                                <div className="col-span-2 text-center">→</div>
                                                <div className="col-span-5">Kelas Tujuan ({levelData.to_level === 'alumni' ? 'Alumni' : `Tingkat ${levelData.to_level}`})</div>
                                            </div>
                                            
                                            {levelData.mappings.map((mapping, index) => {
                                                const targetClass = classes.find(c => c.id == mapping.to_class_id);
                                                const hasStudents = targetClass && targetClass.students_count > 0;

                                                return (
                                                <div key={mapping.from_class_id} className="grid grid-cols-12 gap-4 items-center mb-3">
                                                    <div className="col-span-5 text-gray-900 dark:text-gray-100">
                                                        {mapping.from_class_name}
                                                    </div>
                                                    <div className="col-span-2 text-center text-gray-400">
                                                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </div>
                                                    <div className="col-span-5">
                                                        {levelData.to_level === 'alumni' ? (
                                                            <div className="text-red-600 font-medium">Lulus / Alumni</div>
                                                        ) : (
                                                            <div>
                                                                <select
                                                                    className={`block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm ${hasStudents ? 'border-yellow-500' : ''}`}
                                                                    value={mapping.to_class_id}
                                                                    onChange={(e) => handleMappingChange(index, e.target.value)}
                                                                    required
                                                                >
                                                                    <option value="">Pilih Kelas Tujuan</option>
                                                                    {getClassesByLevel(levelData.to_level).map((cls) => (
                                                                        <option key={cls.id} value={cls.id}>
                                                                            {cls.name} ({cls.students_count} Siswa)
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {hasStudents && (
                                                                    <div className="text-xs text-yellow-600 mt-1">
                                                                        ⚠️ Kelas tujuan berisi {targetClass.students_count} siswa.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )})}
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <PrimaryButton disabled={processingLevel || (levelData.to_level !== 'alumni' && levelData.mappings.some(m => !m.to_class_id))}>
                                                Proses Kenaikan Tingkat
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
