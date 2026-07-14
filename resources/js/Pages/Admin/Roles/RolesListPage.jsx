import AdminLayout from '@/Layouts/Admin/AdminLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus, Users, X, Trash2, Check, Pencil, Lock,
    Shield, Copy, Crown, Briefcase, UserCog, Star,
} from 'lucide-react';
import { useState, useMemo } from 'react';

// ─── Permission display labels ────────────────────────────────────────────────
const PERM_LABELS = {
    'manage-roles':       'Roles & Permissions',
    'manage-staff':       'Staff & Users',
    'manage-products':    'Products',
    'manage-inventory':   'Inventory',
    'manage-pos':         'POS Checkout',
    'manage-orders':      'Orders',
    'manage-payments':    'Payments',
    'manage-customers':   'Customers',
    'manage-variants':    'Variants & SKUs',
    'view-dashboard':     'Dashboard',
    'view-notifications': 'Notifications',
    'manage-settings':    'Settings',
    'view-reports':       'Reports',
};

const DISPLAY_ORDER = [
    'view-dashboard', 'view-notifications',
    'manage-pos', 'manage-orders', 'manage-payments',
    'manage-products', 'manage-variants', 'manage-inventory',
    'manage-customers', 'manage-staff', 'manage-roles',
    'view-reports', 'manage-settings',
];

// ─── Role themes ──────────────────────────────────────────────────────────────
const ROLE_THEMES = {
    Admin: {
        from: '#111111', to: '#1c1917',
        icon: Crown, iconColor: 'text-orange-400',
        glow: 'shadow-orange-500/5',
        check: '#f97316',
        pill: { bg: 'bg-orange-500/15', text: 'text-orange-350' },
    },
    Manager: {
        from: '#0f1f40', to: '#1e3a6e',
        icon: Briefcase, iconColor: 'text-blue-200',
        glow: 'shadow-blue-900/40',
        check: '#60a5fa',
        pill: { bg: 'bg-blue-400/15', text: 'text-blue-200' },
    },
    Staff: {
        from: '#0a2318', to: '#14532d',
        icon: UserCog, iconColor: 'text-emerald-300',
        glow: 'shadow-emerald-900/40',
        check: '#34d399',
        pill: { bg: 'bg-emerald-400/15', text: 'text-emerald-200' },
    },
};
const DEFAULT_THEME = {
    from: '#1f2937', to: '#374151',
    icon: Star, iconColor: 'text-gray-300',
    glow: 'shadow-gray-800/30',
    check: '#9ca3af',
    pill: { bg: 'bg-gray-400/15', text: 'text-gray-300' },
};
const gt = (name) => ROLE_THEMES[name] ?? DEFAULT_THEME;

// ─── Circular progress ring ───────────────────────────────────────────────────
function Ring({ value, total }) {
    const pct  = total > 0 ? value / total : 0;
    const r    = 16;
    const circ = 2 * Math.PI * r;
    return (
        <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
            <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3.5" />
            <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="3.5"
                strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray .4s ease' }} />
        </svg>
    );
}

// ─── Permission toggle row ────────────────────────────────────────────────────
function PermRow({ label, isOn, isSaving, onClick, checkColor }) {
    return (
        <button
            type="button"
            disabled={isSaving}
            onClick={onClick}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all group ${
                isOn
                    ? 'bg-gray-50 border border-gray-100 shadow-sm'
                    : 'bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60'
            } ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
            <span className={`text-[12.5px] font-semibold transition-colors ${isOn ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {label}
            </span>
            <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                style={isOn
                    ? { backgroundColor: checkColor, borderColor: checkColor }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb' }
                }
            >
                {isOn && <Check className="h-2.5 w-2.5 text-white stroke-[3.5]" />}
            </span>
        </button>
    );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({ role, sortedPermissions, savingKey, onToggle, onEdit, onDuplicate, onDelete }) {
    const theme    = gt(role.name);
    const RoleIcon = theme.icon;
    const count    = role.permissions.length;
    const total    = sortedPermissions.length;
    const pct      = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className={`flex flex-col rounded-3xl overflow-hidden border border-black/5 bg-white shadow-lg ${theme.glow} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>

            {/* ── Gradient header ─────────────────────────────────────── */}
            <div
                className="relative px-5 pt-5 pb-9"
                style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}
            >
                {/* Dot-grid pattern */}
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                <div className="relative flex items-start justify-between">
                    {/* Icon + name */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                            <RoleIcon className={`h-5 w-5 ${theme.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-black text-white leading-tight tracking-tight">{role.name}</h3>
                            <p className="flex items-center gap-1 text-[11px] text-white/60 font-semibold mt-0.5">
                                <Users className="h-3 w-3" />
                                {role.users_count} member{role.users_count !== 1 ? 's' : ''}
                                {role.is_system && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70">
                                        <Lock className="h-2 w-2" /> System
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Ring progress */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <Ring value={count} total={total} />
                        <span className="absolute text-[11px] font-black text-white">{pct}%</span>
                    </div>
                </div>

                {/* Bottom row: perm count + actions */}
                <div className="relative flex items-center justify-between mt-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${theme.pill.bg} ${theme.pill.text}`}>
                        {count} / {total} permissions
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(role)}
                            title="Rename"
                            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition active:scale-95">
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onDuplicate(role)}
                            title="Duplicate"
                            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition active:scale-95">
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                        {!role.is_system && (
                            <button onClick={() => onDelete(role)}
                                title="Delete"
                                className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-red-400/70 transition active:scale-95">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── White body: permission list ──────────────────────────── */}
            <div className="flex-1 flex flex-col bg-white rounded-t-3xl -mt-4 relative z-10">
                {/* Drag-handle pill */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="h-1 w-8 rounded-full bg-gray-200" />
                </div>

                <div className="px-4 pb-4 space-y-1.5 overflow-y-auto max-h-[300px]"
                    style={{ scrollbarWidth: 'none' }}>
                    {sortedPermissions.map(perm => {
                        const isOn    = role.permissions.includes(perm.name);
                        const isSving = savingKey === `${role.id}-${perm.name}`;
                        const label   = PERM_LABELS[perm.name] ?? perm.label;
                        return (
                            <PermRow
                                key={perm.name}
                                label={label}
                                isOn={isOn}
                                isSaving={!!savingKey || isSving}
                                onClick={() => onToggle(role, perm.name)}
                                checkColor={theme.check}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RolesListPage({ roles = [], permissions = [] }) {
    const { errors: pageErrors } = usePage().props;

    const [savingKey, setSavingKey]   = useState(null);
    const [modal, setModal]           = useState(null);   // null | 'create' | 'edit' | 'duplicate'
    const [modalSrc, setModalSrc]     = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    const { data, setData, post, reset: resetForm, processing, errors } = useForm({ name: '', permissions: [] });

    const sortedPerms = useMemo(() =>
        [...permissions].sort((a, b) => {
            const ia = DISPLAY_ORDER.indexOf(a.name);
            const ib = DISPLAY_ORDER.indexOf(b.name);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }), [permissions]);

    // Toggle a permission directly on a role card
    const handleToggle = (role, permName) => {
        if (savingKey) return;
        const key = `${role.id}-${permName}`;
        setSavingKey(key);
        const next = new Set(role.permissions);
        next.has(permName) ? next.delete(permName) : next.add(permName);
        router.patch(route('roles.update', role.id),
            { name: role.name, permissions: Array.from(next) },
            { preserveScroll: true, preserveState: true, onFinish: () => setSavingKey(null) }
        );
    };

    const openCreate    = ()  => { setModalSrc(null); resetForm(); setData({ name: '', permissions: [] }); setModal('create'); };
    const openEdit      = (r) => { setModalSrc(r); setData({ name: r.name, permissions: r.permissions }); setModal('edit'); };
    const openDuplicate = (r) => { setModalSrc(r); setData({ name: `${r.name} Copy`, permissions: r.permissions }); setModal('duplicate'); };
    const closeModal    = ()  => { setModal(null); setModalSrc(null); resetForm(); };

    const submitModal = (e) => {
        e.preventDefault();
        if (modal === 'edit') {
            router.patch(route('roles.update', modalSrc.id),
                { name: data.name, permissions: data.permissions },
                { preserveScroll: true, onSuccess: closeModal });
        } else {
            post(route('roles.store'), { preserveScroll: true, onSuccess: closeModal });
        }
    };

    const toggleModalPerm = (n) =>
        setData('permissions', data.permissions.includes(n)
            ? data.permissions.filter(x => x !== n)
            : [...data.permissions, n]);

    const doDelete = () => {
        const r = confirmDel;
        setConfirmDel(null);
        router.delete(route('roles.destroy', r.id), { preserveScroll: true });
    };

    return (
        <AdminLayout navbarTitle="Roles & Permissions" contentClassName="px-6 pb-8 pt-5 bg-[#F5F4F2]">
            <Head title="Roles & Permissions" />

            {/* ── Page header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black font-display uppercase tracking-tight text-gray-900">Roles & Permissions</h1>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">Manage who can access each module in your POS system.</p>
                </div>
                <button onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 transition active:scale-95 duration-200">
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    Add Role
                </button>
            </div>

            {/* ── Role card grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {roles.map(role => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        sortedPermissions={sortedPerms}
                        savingKey={savingKey}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDuplicate={openDuplicate}
                        onDelete={setConfirmDel}
                    />
                ))}
            </div>

            {/* ══ CREATE / EDIT / DUPLICATE MODAL ════════════════════════ */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-black/[0.06] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
                            <div>
                                <p className="text-base font-black font-display uppercase tracking-wider text-gray-900">
                                    {modal === 'edit'      ? `Edit "${modalSrc?.name}"` :
                                     modal === 'duplicate' ? `Duplicate "${modalSrc?.name}"` :
                                     'Create New Role'}
                                </p>
                                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                    {modal === 'edit'      ? 'Rename the role or adjust permissions' :
                                     modal === 'duplicate' ? 'Creates a copy with the same permissions' :
                                     'Name the role and select module access'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submitModal} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5" htmlFor="modal-role-name">
                                    Role Name
                                </label>
                                <input id="modal-role-name" value={data.name} onChange={e => setData('name', e.target.value)}
                                    type="text" disabled={modal === 'edit' && modalSrc?.is_system}
                                    placeholder="e.g. Cashier"
                                    className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm text-black outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-450"
                                    autoFocus />
                                <InputError className="mt-1" message={errors.name || pageErrors?.name} />
                            </div>

                            {/* Permissions */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Permissions</label>
                                    <span className="text-[10px] font-black uppercase text-black bg-gray-150 rounded-lg px-2.5 py-0.5 tabular-nums border border-black/5 font-display">
                                        {data.permissions.length}/{sortedPerms.length}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-black/10 overflow-hidden max-h-64 overflow-y-auto divide-y divide-black/[0.04]">
                                    {sortedPerms.map(perm => {
                                        const label     = PERM_LABELS[perm.name] ?? perm.label;
                                        const isChecked = data.permissions.includes(perm.name);
                                        return (
                                            <button key={perm.name} type="button" onClick={() => toggleModalPerm(perm.name)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${isChecked ? 'bg-orange-50/40' : 'bg-white hover:bg-gray-50/50'}`}>
                                                <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${isChecked ? 'border-[#f97316] bg-[#f97316]' : 'border-gray-200'}`}>
                                                    {isChecked && <Check className="h-2.5 w-2.5 text-white stroke-[3.5]" />}
                                                </div>
                                                <span className={`text-[12.5px] font-bold flex-1 truncate ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError className="mt-1" message={errors.permissions || pageErrors?.permissions} />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-black/[0.06] pt-4 mt-2">
                                <button type="button" onClick={closeModal}
                                    className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing || !data.name.trim()}
                                    className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-900 active:scale-95 transition-all duration-200 disabled:opacity-50 shadow-sm">
                                    {processing ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ DELETE CONFIRM ══════════════════════════════════════════ */}
            {confirmDel && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm rounded-3xl bg-white border border-black/[0.06] p-6 shadow-2xl animate-scale-in">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mb-4 shadow-sm">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <p className="text-[15px] font-black font-display uppercase tracking-wider text-gray-900 mb-1">Delete "{confirmDel.name}"?</p>
                        <p className="text-xs font-semibold leading-relaxed text-gray-400 mb-5">
                            This role will be permanently removed. Users assigned to it will lose access immediately.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDel(null)}
                                className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 bg-white transition active:scale-95 duration-200">
                                Cancel
                            </button>
                            <button onClick={doDelete}
                                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-700 transition active:scale-95 duration-200 shadow-sm">
                                Delete Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
