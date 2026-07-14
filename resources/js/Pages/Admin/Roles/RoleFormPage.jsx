import InputError from '@/Components/InputError';
import FormPageShell from '@/Pages/Admin/Roles/components/FormPageShell';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

/** Animated toggle switch */
function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 ${
                checked ? 'bg-[#f97316]' : 'bg-gray-200'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                    checked ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
}

export default function RoleFormPage({ role, permissions = [] }) {
    const { data, setData, post, patch, errors, reset, processing } = useForm({
        name: role?.name || '',
        permissions: [],
    });

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const el = document.getElementById(`role-${firstErrorKey}`);
            if (el) {
                setTimeout(() => {
                    el.focus();
                }, 50);
            }
        }
    }, [errors]);

    // Populate permissions for editing (by name)
    useEffect(() => {
        if (role?.permissions) {
            setData('permissions', role.permissions);
        }
    }, [role]);

    const handleTogglePermission = (permName) => {
        if (data.permissions.includes(permName)) {
            setData('permissions', data.permissions.filter((p) => p !== permName));
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!role?.id) {
            post(route('roles.store'), { preserveState: true, onFinish: () => reset() });
        } else {
            patch(route('roles.update', role.id), { preserveState: true, onFinish: () => reset() });
        }
    };

    const isEditing = Boolean(role?.id);
    const selectedCount = data.permissions.length;
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
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#f97316]" />
                        Permission setup
                    </div>
                    <h1 className="mt-4 text-3xl font-black font-display uppercase tracking-tight text-black">
                        {isEditing ? 'Edit role access' : 'Create a new role'}
                    </h1>
                    <p className="mt-2 max-w-2xl text-xs font-semibold text-gray-400">
                        Define the role name and choose the exact permissions it should have. Each permission grants full access to that module.
                    </p>
                </div>

                <Link
                    href={route('roles.index')}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black shadow-sm transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to roles
                </Link>
            </div>

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                {/* ── Left sidebar summary ─────────────────────── */}
                <aside className="rounded-3xl border border-black/[0.06] bg-black p-6 text-white shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                        <Sparkles className="h-6 w-6 text-orange-400" />
                    </div>
                    <h2 className="mt-5 text-xl font-black font-display uppercase tracking-wider">Role profile</h2>
                    <p className="mt-2 text-xs leading-6 text-gray-400 font-semibold">
                        Each permission toggles full access to that module. "Manage" means CRUD, "View" means read-only.
                    </p>

                    <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 font-display">Mode</span>
                            <span className="rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase text-black font-display">
                                {isEditing ? 'Editing' : 'Creating'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70 font-semibold">Permissions selected</span>
                            <span className="text-base font-bold text-white font-mono">{selectedCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70 font-semibold">Total available</span>
                            <span className="text-base font-bold text-white font-mono">{permissions.length}</span>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                        <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider font-display">
                            <BadgeCheck className="h-4 w-4 text-orange-400" />
                            Best practice
                        </div>
                        <p className="mt-2 leading-relaxed text-gray-400 font-medium">
                            Keep roles minimal. Grant only what is needed — you can always expand later.
                        </p>
                    </div>
                </aside>

                {/* ── Right panel: form ───────────────────────── */}
                <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] pb-5">
                        <div>
                            <h2 className="text-lg font-black font-display uppercase tracking-wider text-black">{isEditing ? 'Role details' : 'New role details'}</h2>
                            <p className="mt-1 text-xs font-semibold text-gray-400">Name the role and toggle the modules it can access.</p>
                        </div>
                        <div className="rounded-xl bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                            {selectedCount} enabled
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500" htmlFor="role-name">
                                Role name
                            </label>
                            <input
                                id="role-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                name="name"
                                className={`w-full rounded-xl border px-4 py-3 text-sm text-black outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-4 ${
                                    errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                        : 'border-black/10 focus:border-[#f97316] focus:ring-orange-100'
                                }`}
                                placeholder="e.g. Cashier"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        {/* Permissions */}
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Permissions</label>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-display">
                                    Toggle to enable
                                </span>
                            </div>

                            <div className="divide-y divide-black/[0.04] rounded-2xl border border-black/[0.06] overflow-hidden">
                                {permissions.map((perm) => {
                                    const isChecked = data.permissions.includes(perm.name);
                                    return (
                                        <label
                                            key={perm.name}
                                            className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-gray-50/50"
                                        >
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isChecked ? 'bg-orange-50 text-[#f97316]' : 'bg-gray-100 text-gray-400'}`}>
                                                <ShieldCheck className="h-4.5 w-4.5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{perm.label ?? perm.name}</p>
                                                <p className="text-[11px] text-gray-400 font-semibold">
                                                    {perm.type === 'manage' ? '⚡ Full CRUD access (Manage)' : '👁 Read-only access (View)'}
                                                </p>
                                            </div>
                                            <Toggle
                                                checked={isChecked}
                                                onChange={() => handleTogglePermission(perm.name)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError className="mt-2" message={errors.permissions} />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:justify-end">
                        <Link
                            href={route('roles.index')}
                            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200"
                        >
                            Cancel
                        </Link>
                        <button
                            disabled={processing}
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (isEditing ? 'Updating…' : 'Saving…') : (isEditing ? 'Update role' : 'Create role')}
                        </button>
                    </div>
                </div>
            </form>
        </FormPageShell>
    );
}