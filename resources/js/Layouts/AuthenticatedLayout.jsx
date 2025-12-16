import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Role Helpers (Sesuaikan ID dengan Seeder)
    const isAdmin = user.role_id === 1;
    const isTeacher = user.role_id === 2 || user.role_id === 3; // Guru Mapel & Guru Piket
    const isPicket = user.role_id === 3;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Beranda
                                </NavLink>

                                {isTeacher && (
                                    <NavLink
                                        href={route('attendance.history')}
                                        active={route().current('attendance.history')}
                                    >
                                        Riwayat Absensi
                                    </NavLink>
                                )}

                                {(isAdmin || isPicket) && (
                                    <NavLink
                                        href={route('admin.monitoring')}
                                        active={route().current('admin.monitoring')}
                                    >
                                        Monitoring Kelas
                                    </NavLink>
                                )}

                                {isAdmin && (
                                    <>
                                        {/* Dropdown Data Master */}
                                        <div className="hidden sm:flex sm:items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none cursor-pointer ' + 
                                                        (route().current('admin.classes.*') || 
                                                         route().current('admin.class-statuses.*') || 
                                                         route().current('admin.subjects.*') || 
                                                         route().current('admin.users.*') || 
                                                         route().current('admin.allowed-registrations.*') ||
                                                         route().current('admin.activity-types.*')
                                                            ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
                                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300')
                                                    }>
                                                        Data Master
                                                        <svg
                                                            className="ms-2 -me-0.5 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('admin.users.index')}>Pengguna</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.allowed-registrations.index')}>Data Guru & Siswa</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.classes.index')}>Kelas</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.class-statuses.index')}>Status Kelas</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.class-promotions.index')}>Kenaikan Kelas</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.subjects.index')}>Mapel</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.activity-types.index')}>Jenis Kegiatan</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>

                                        {/* Dropdown Manajemen Jadwal */}
                                        <div className="hidden sm:flex sm:items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none cursor-pointer ' + 
                                                        (route().current('admin.schedule-templates.*') || 
                                                         route().current('admin.schedules.*') ||
                                                         route().current('admin.holidays.*')
                                                            ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
                                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300')
                                                    }>
                                                        Jadwal
                                                        <svg
                                                            className="ms-2 -me-0.5 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('admin.schedule-templates.index')}>Template Jadwal</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.schedules.index')}>Jadwal Pelajaran</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.holidays.index')}>Hari Libur</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>

                                        {/* Dropdown Laporan & Monitoring */}
                                        <div className="hidden sm:flex sm:items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none cursor-pointer ' + 
                                                        (route().current('admin.teacher-summaries.*') || 
                                                         route().current('admin.learning-progress.*')
                                                            ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
                                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300')
                                                    }>
                                                        Monitoring
                                                        <svg
                                                            className="ms-2 -me-0.5 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('admin.teacher-summaries.index')}>Rekapan Guru</Dropdown.Link>
                                                    <Dropdown.Link href={route('admin.learning-progress.index')}>Monitoring Pembelajaran</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>

                                        <NavLink
                                            href={route('admin.announcements.index')}
                                            active={route().current('admin.announcements.*')}
                                        >
                                            Pengumuman
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.bug-reports.index')}
                                            active={route().current('admin.bug-reports.*')}
                                        >
                                            Laporan Masalah
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.avatar && (
                                                    <img 
                                                        src={`/storage/${user.avatar}`} 
                                                        alt={user.name} 
                                                        className="w-8 h-8 rounded-full object-cover mr-2"
                                                    />
                                                )}
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('bug-reports.index')}
                                        >
                                            Lapor Masalah
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Beranda
                        </ResponsiveNavLink>

                        {isTeacher && (
                            <ResponsiveNavLink
                                href={route('attendance.history')}
                                active={route().current('attendance.history')}
                            >
                                Riwayat Absensi
                            </ResponsiveNavLink>
                        )}

                        {(isAdmin || isPicket) && (
                            <ResponsiveNavLink
                                href={route('admin.monitoring')}
                                active={route().current('admin.monitoring')}
                            >
                                Monitoring Kelas
                            </ResponsiveNavLink>
                        )}

                        {isAdmin && (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.users.index')}
                                    active={route().current('admin.users.*')}
                                >
                                    Pengguna
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.allowed-registrations.index')}
                                    active={route().current('admin.allowed-registrations.*')}
                                >
                                    Data Guru & Siswa
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.classes.index')}
                                    active={route().current('admin.classes.*')}
                                >
                                    Kelas
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.class-statuses.index')}
                                    active={route().current('admin.class-statuses.*')}
                                >
                                    Status Kelas
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.class-promotions.index')}
                                    active={route().current('admin.class-promotions.*')}
                                >
                                    Kenaikan Kelas
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.subjects.index')}
                                    active={route().current('admin.subjects.*')}
                                >
                                    Mapel
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.activity-types.index')}
                                    active={route().current('admin.activity-types.*')}
                                >
                                    Jenis Kegiatan
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.schedule-templates.index')}
                                    active={route().current('admin.schedule-templates.*')}
                                >
                                    Template Jadwal
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.schedules.index')}
                                    active={route().current('admin.schedules.*')}
                                >
                                    Jadwal Pelajaran
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.holidays.index')}
                                    active={route().current('admin.holidays.*')}
                                >
                                    Hari Libur
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.teacher-summaries.index')}
                                    active={route().current('admin.teacher-summaries.*')}
                                >
                                    Rekapan Guru
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.learning-progress.index')}
                                    active={route().current('admin.learning-progress.*')}
                                >
                                    Monitoring Pembelajaran
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.announcements.index')}
                                    active={route().current('admin.announcements.*')}
                                >
                                    Pengumuman
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.bug-reports.index')}
                                    active={route().current('admin.bug-reports.*')}
                                >
                                    Laporan Masalah
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4 flex items-center">
                            {user.avatar && (
                                <div className="mr-3">
                                    <img 
                                        src={`/storage/${user.avatar}`} 
                                        alt={user.name} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('bug-reports.index')}>
                                Lapor Masalah
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
