import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

function toPermissionIdSet(role) {
    return new Set((role.permissions ?? []).map((permission) => permission.id));
}

export default function RolesListPage({ roles = [], permissions = [] }) {
    const { errors: pageErrors } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, reset, processing, errors } = useForm({
        name: '',
        permissions: [],
    });

    const carouselRef = useRef(null);

    const headWeb = 'Roles & Permissions';

    const handlePrev = () => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    };

    const handleNext = () => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
    };

    const toggleCreatePermission = (permissionId) => {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const submitCreateRole = (e) => {
        e.preventDefault();

        post(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const toggleRolePermission = (role, permissionId) => {
        const selected = toPermissionIdSet(role);

        if (selected.has(permissionId)) {
            selected.delete(permissionId);
        } else {
            selected.add(permissionId);
        }

        router.patch(
            route('roles.update', role.id),
            {
                name: role.name,
                permissions: Array.from(selected),
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <AdminLayout>
            <Head title={headWeb} />
            <section className="min-h-full bg-gray-100 text-[#111111]">
                <div className="px-6 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-black">Roles & Permissions</h1>
                            <p className="mt-2 text-sm text-gray-600">Control what each team member can do.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                        >
                            <Plus className="h-4 w-4" />
                            Add Role
                        </button>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">Scroll horizontally to browse roles.</p>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrev} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button onClick={handleNext} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div ref={carouselRef} className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex gap-6 snap-x snap-mandatory scroll-smooth">
                                {roles.map((role) => {
                                    const selected = toPermissionIdSet(role);

                                    return (
                                        <article
                                            key={role.id}
                                            style={{ minWidth: 'calc((100% - 48px) / 3)' }}
                                            className="flex snap-center flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
                                                <div>
                                                    <h2 className="text-xl font-bold text-black">{role.name}</h2>
                                                    <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                                                        <Users className="h-3 w-3" />
                                                        {role.users_count} user{role.users_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-black px-3 py-2 text-right text-white">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Perms</p>
                                                    <p className="text-lg font-bold">{selected.size}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                {permissions.map((permission) => {
                                                    const checked = selected.has(permission.id);

                                                    return (
                                                        <label
                                                            key={permission.id}
                                                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 transition-all hover:bg-gray-50"
                                                        >
                                                            <span className="text-sm font-medium text-gray-800">{permission.name}</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleRolePermission(role, permission.id)}
                                                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                            />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {isCreateModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
                            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
                                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-black">Add Role</h2>
                                        <p className="mt-1 text-sm text-gray-600">Create a new role and assign permissions right away.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                        aria-label="Close modal"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={submitCreateRole} className="space-y-6 px-6 py-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-black" htmlFor="role-name">
                                            Role name
                                        </label>
                                        <input
                                            id="role-name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            type="text"
                                            placeholder="e.g. Cashier"
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                        />
                                        <InputError className="mt-2" message={errors.name || pageErrors?.name} />
                                    </div>

                                    <div>
                                        <div className="mb-3 flex items-end justify-between gap-3">
                                            <label className="block text-sm font-semibold text-black">Permissions</label>
                                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Choose any</span>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {permissions.map((permission) => {
                                                const checked = data.permissions.includes(permission.id);

                                                return (
                                                    <label
                                                        key={permission.id}
                                                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all ${checked ? 'border-black bg-black text-white shadow-md shadow-black/10' : 'border-gray-200 bg-white text-black hover:border-gray-300 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="text-sm font-semibold leading-6">{permission.name}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleCreatePermission(permission.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <InputError className="mt-2" message={errors.permissions || pageErrors?.permissions} />
                                    </div>

                                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                                        <button
                                            type="button"
                                            onClick={closeCreateModal}
                                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Create role'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}
