import InputError from '@/Components/InputError';
import FormPageShell from '@/Components/Shared/FormPageShell';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';


export default function RoleFormPage({ role, permissions }) {
    const { data, setData, post, patch, errors, reset, processing } =
        useForm({
            name: role?.name || '',
            permissions: [],
        });

    useEffect(() => {
        if (role?.permissions) {
            const permIds = role.permissions.map((permission) => permission.id);
            setData('permissions', permIds);
        }
    }, [role]);

    const handleSelectPermission = (e) => {
        const id = parseInt(e.target.value);
        if (e.target.checked) {
            if (!data.permissions.includes(id)) {
                setData('permissions', [...data.permissions, id]);
            }
        } else {
            setData('permissions', data.permissions.filter(p => p !== id));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (role == undefined) {
            post(route('roles.store'), {
                preserveState: true,
                onFinish: () => reset(),
            });
        } else {
            patch(route('roles.update', role.id), {
                preserveState: true,
                onFinish: () => reset(),
            });
        }
    };

    const isEditing = Boolean(role?.id);
    const selectedPermissionsCount = data.permissions.length;
    const headWeb = isEditing ? 'Edit Role' : 'Create Role';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <FormPageShell
            title={headWeb}
            breadcrumbTitle={headWeb}
            breadcrumbLinks={linksBreadcrumb}
            sectionClassName="min-h-full bg-gradient-to-br from-[#f8f8f6] via-[#f4f4f1] to-[#efefeb] text-[#111111]"
            layoutChildrenClassName="px-8 py-8"
        >
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-black/55 shadow-sm shadow-black/5">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Permission setup
                            </div>
                            <h1 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                                {isEditing ? 'Edit role access' : 'Create a new role'}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm font-medium text-black/55">
                                Define the role name and choose the exact permissions it should have. This keeps access simple and readable for the team.
                            </p>
                        </div>

                        <Link
                            href={route('roles.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm shadow-black/5 transition-all hover:border-black/15 hover:bg-black/5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to roles
                        </Link>
                    </div>

                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="rounded-3xl border border-black/8 bg-black p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h2 className="mt-5 text-2xl font-bold">Role profile</h2>
                            <p className="mt-2 text-sm leading-6 text-white/70">
                                Name the role clearly and assign only the permissions it actually needs. The summary below updates as you select permissions.
                            </p>

                            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Mode</span>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                                        {isEditing ? 'Editing' : 'Creating'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Permissions selected</span>
                                    <span className="text-lg font-bold text-white">{selectedPermissionsCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Available permissions</span>
                                    <span className="text-lg font-bold text-white">{permissions.length}</span>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                <div className="flex items-center gap-2 text-white">
                                    <BadgeCheck className="h-4 w-4" />
                                    Best practice
                                </div>
                                <p className="mt-2 leading-6">
                                    Keep roles descriptive, then use permissions to control access instead of creating too many custom roles.
                                </p>
                            </div>
                        </aside>

                        <div className="rounded-3xl border border-black/8 bg-white/90 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                                <div>
                                    <h2 className="text-2xl font-bold text-black">{isEditing ? 'Role details' : 'New role details'}</h2>
                                    <p className="mt-1 text-sm text-black/55">Use a simple name and pick permissions from the list below.</p>
                                </div>
                                <div className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/10">
                                    {selectedPermissionsCount} selected
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black" htmlFor="title">
                                        Role name
                                    </label>
                                    <input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        type="text"
                                        name="name"
                                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-black/30 ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-black/10 focus:border-black/30 focus:ring-2 focus:ring-black/5'}`}
                                        id="title"
                                        placeholder="e.g. Operations Lead"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <div className="mb-3 flex items-end justify-between gap-4">
                                        <label className="block text-sm font-semibold text-black">
                                            Permissions
                                        </label>
                                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                                            Select one or more
                                        </span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {permissions.map((permission) => {
                                            const checked = data.permissions.includes(permission.id);

                                            return (
                                                <label
                                                    key={permission.id}
                                                    htmlFor={`perm-${permission.id}`}
                                                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all ${checked ? 'border-black bg-black text-white shadow-md shadow-black/10' : 'border-black/10 bg-white text-black hover:border-black/20 hover:bg-black/5'}`}
                                                >
                                                    <span className="text-sm font-semibold leading-6">{permission.name}</span>
                                                    <input
                                                        type="checkbox"
                                                        name="permissions"
                                                        value={permission.id}
                                                        id={`perm-${permission.id}`}
                                                        onChange={handleSelectPermission}
                                                        checked={checked}
                                                        className="h-4 w-4 rounded border-black/25 text-black focus:ring-black"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <InputError className="mt-2" message={errors.permissions} />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/8 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href={route('roles.index')}
                                    className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-black/5"
                                >
                                    Cancel
                                </Link>
                                <button
                                    disabled={processing}
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update role' : 'Create role')}
                                </button>
                            </div>
                        </div>
                    </form>
        </FormPageShell>
    );
}