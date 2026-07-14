import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import UserFormModal from './components/UserFormModal';
import InviteMemberModal from './components/InviteMemberModal';
import AddMemberModal from './components/AddMemberModal';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import {
    UserPlus,
    Search,
    Mail,
    Shield,
    Trash2,
    CheckCircle2,
    AlertCircle,
    X,
    UserCheck,
    UserX,
    RefreshCw,
    XCircle,
    Clock,
    UserCircle,
    Filter,
} from 'lucide-react';

function makeInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
}

function ConfirmModal({ show, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger' }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 text-xs text-foreground bg-white rounded-3xl border border-black/[0.06] shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        variant === 'danger' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        variant === 'warning' ? 'bg-amber-50 text-amber-605 border border-amber-100' :
                        'bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm'
                    }`}>
                        {variant === 'danger' ? (
                            <AlertCircle size={18} />
                        ) : (
                            <Clock size={18} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-black uppercase tracking-wider font-display">{title}</h3>
                        <p className="mt-2 text-gray-500 font-semibold leading-relaxed text-xs">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 border-t border-black/[0.06] pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition active:scale-95 duration-200"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition active:scale-95 duration-200 ${
                            variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                            variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                            'bg-black hover:bg-neutral-900'
                        }`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default function UserListPage({ users = [], invitations = [], roles = [] }) {
    const [activeTab, setActiveTab] = useState('members');
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAddModal, setShowAddModal]       = useState(false);
    const [showModal, setShowModal]             = useState(false);
    const [editingMember, setEditingMember]     = useState(null);
    
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        variant: 'danger',
        onConfirm: () => {},
    });

    const defaultRole = roles[0]?.name ?? '';
    const { data, setData, errors, reset, processing, clearErrors, patch } = useForm({
        name: '',
        phone: '',
        email: '',
        role: defaultRole,
    });

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.status === 'Active').length;
        const pendingInvites = invitations.filter((i) => i.status === 'pending').length;
        const expiredInvites = invitations.filter((i) => i.status === 'expired').length;
        return { totalUsers, activeUsers, pendingInvites, expiredInvites };
    }, [users, invitations]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStatusFilter('');
    };

    const filteredMembers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = 
                !searchText ||
                u.name.toLowerCase().includes(searchText.toLowerCase()) ||
                u.email.toLowerCase().includes(searchText.toLowerCase());
            const matchesRole = !roleFilter || u.role === roleFilter;
            const matchesStatus = !statusFilter || u.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchText, roleFilter, statusFilter]);

    const filteredInvitations = useMemo(() => {
        return invitations.filter((i) => {
            const matchesSearch = 
                !searchText ||
                i.email.toLowerCase().includes(searchText.toLowerCase());
            const matchesRole = !roleFilter || i.role === roleFilter;
            const matchesStatus = !statusFilter || i.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [invitations, searchText, roleFilter, statusFilter]);

    const handleResetFilters = () => {
        setSearchText('');
        setRoleFilter('');
        setStatusFilter('');
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        clearErrors();
        setData({
            name: member.name,
            phone: member.phone || '',
            email: member.email,
            role: member.role,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMember(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMember) {
            patch(route('users.update', editingMember.id), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const triggerConfirm = (config) => {
        setConfirmState({
            show: true,
            title: config.title,
            message: config.message,
            confirmText: config.confirmText,
            cancelText: config.cancelText || 'Cancel',
            variant: config.variant || 'danger',
            onConfirm: () => {
                config.action();
                setConfirmState((prev) => ({ ...prev, show: false }));
            },
        });
    };

    const handleDeactivate = (member) => {
        triggerConfirm({
            title: 'Deactivate Staff Member?',
            message: `Are you sure you want to deactivate ${member.name}? They will lose catalog and POS access immediately.`,
            confirmText: 'Deactivate',
            variant: 'danger',
            action: () => {
                router.post(route('users.deactivate', member.id), {}, { preserveScroll: true });
            },
        });
    };

    const handleReactivate = (member) => {
        triggerConfirm({
            title: 'Reactivate Staff Member?',
            message: `Reactivate ${member.name}? They will regain full terminal access immediately.`,
            confirmText: 'Reactivate',
            variant: 'info',
            action: () => {
                router.post(route('users.reactivate', member.id), {}, { preserveScroll: true });
            },
        });
    };

    const handleDeleteUser = (member) => {
        triggerConfirm({
            title: 'Delete Staff Member?',
            message: `Are you sure you want to permanently delete ${member.name}? All their records will be erased.`,
            confirmText: 'Delete Member',
            variant: 'danger',
            action: () => {
                router.delete(route('users.destroy', member.id), { preserveScroll: true });
            },
        });
    };

    const handleCancelInvitation = (invitation) => {
        triggerConfirm({
            title: 'Cancel Invitation?',
            message: `Cancel invitation link sent to ${invitation.email}?`,
            confirmText: 'Cancel Invite',
            variant: 'danger',
            action: () => {
                router.post(route('invitations.cancel', invitation.id), {}, { preserveScroll: true });
            },
        });
    };

    const handleResendInvitation = (invitation) => {
        triggerConfirm({
            title: 'Resend Invitation?',
            message: `Send a new invitation link to ${invitation.email}?`,
            confirmText: 'Resend Invite',
            variant: 'info',
            action: () => {
                router.post(route('invitations.resend', invitation.id), {}, { preserveScroll: true });
            },
        });
    };

    return (
        <AdminLayout navbarTitle="Team Members" contentClassName="px-8 py-6 space-y-6">
            <Head title="Team Members" />

            {/* ── Page Metrics ─────────────────────────────────────────── */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Total staff</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{stats.totalUsers}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><UserCircle size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Active staff</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{stats.activeUsers}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600"><CheckCircle2 size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Pending invites</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{stats.pendingInvites}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><Clock size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Expired invites</span>
                        <h4 className="text-2xl font-black font-display text-rose-600 mt-1.5 leading-none">{stats.expiredInvites}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600"><XCircle size={16} /></span>
                </div>
            </section>

            {/* ── Tabs & Roster Section ─────────────────────────────────── */}
            <section className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm">
                {/* Custom Tabs */}
                <div className="border-b border-black/[0.06] bg-gray-50/50 px-6 py-1 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-6">
                        <button
                            onClick={() => handleTabChange('members')}
                            className={`relative py-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none ${
                                activeTab === 'members' ? 'text-black font-extrabold' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                Active members
                                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black font-display border ${
                                    activeTab === 'members' ? 'bg-black border-black text-white shadow-sm' : 'bg-gray-100 text-gray-500 border-black/5'
                                }`}>
                                    {users.length}
                                </span>
                            </span>
                            {activeTab === 'members' && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                            )}
                        </button>

                        <button
                            onClick={() => handleTabChange('invitations')}
                            className={`relative py-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none ${
                                activeTab === 'invitations' ? 'text-black font-extrabold' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                Sent invitations
                                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black font-display border ${
                                    activeTab === 'invitations' ? 'bg-black border-black text-white shadow-sm' : 'bg-gray-100 text-gray-500 border-black/5'
                                }`}>
                                    {invitations.length}
                                </span>
                            </span>
                            {activeTab === 'invitations' && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="p-4 border-b border-black/[0.06] bg-white flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'members' ? 'Search members by name or email...' : 'Search invitations...'}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="h-[38px] w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Role Filter */}
                        <div className="relative flex items-center min-w-[130px]">
                            <Shield className="absolute left-3.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white pl-10 pr-6 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="">All Roles</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative flex items-center min-w-[130px]">
                            <Filter className="absolute left-3.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white pl-10 pr-6 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="">All Statuses</option>
                                {activeTab === 'members' ? (
                                    <>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="expired">Expired</option>
                                        <option value="cancelled">Cancelled</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Reset filters */}
                        {(searchText || roleFilter || statusFilter) && (
                            <button
                                onClick={handleResetFilters}
                                className="h-10 rounded-xl border border-black/10 bg-white px-3.5 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-200"
                            >
                                Clear
                            </button>
                        )}

                        {/* Add Member Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-black px-4 text-xs font-bold text-white uppercase tracking-wider hover:bg-neutral-900 active:scale-95 transition-all duration-200 shadow-sm"
                            type="button"
                        >
                            <UserPlus size={13} /> Add Member
                        </button>

                         {/* Invite Button */}
                         <button
                            onClick={() => setShowInviteModal(true)}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 hover:text-black active:scale-95 transition-all duration-200 shadow-sm"
                            type="button"
                        >
                            <Mail size={13} /> Invite via Email
                        </button>
                    </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                    {activeTab === 'members' ? (
                        <table className="w-full min-w-[800px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-black/[0.06] bg-gray-50/50 text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                                    <th className="px-6 py-4">Staff Details</th>
                                    <th className="px-6 py-4">Email Contact</th>
                                    <th className="px-6 py-4">Terminal Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.04] text-xs">
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-mono tracking-wider">
                                            NO STAFF MEMBERS FOUND
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50/20 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white text-[10px] font-black font-display" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                        {makeInitials(member.name)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-black leading-tight">{member.name}</div>
                                                        <div className="text-[10px] font-mono text-foreground/45 mt-0.5">{member.phone || 'No phone'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-foreground/80 font-semibold font-mono">
                                                {member.email}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                                                    member.role === 'Admin' 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200/50' 
                                                        : member.role === 'Manager'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200/50'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase ${
                                                    member.status === 'Active' ? 'text-emerald-700' : 'text-foreground/45'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-foreground/30'}`} />
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-foreground/45 font-semibold font-mono">
                                                {new Date(member.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(member)}
                                                        className="inline-flex h-7 px-2 items-center gap-1 rounded-lg border border-black/[0.06] bg-white text-[10px] font-bold text-foreground/75 hover:bg-gray-50 shadow-sm transition"
                                                        title="Role settings"
                                                    >
                                                        <Shield size={11} /> Role
                                                    </button>

                                                    {member.status === 'Active' ? (
                                                        <button
                                                            onClick={() => handleDeactivate(member)}
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200/40 text-rose-600 bg-white hover:bg-rose-50 transition"
                                                            title="Deactivate staff"
                                                        >
                                                            <UserX size={11} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleReactivate(member)}
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200/40 text-emerald-600 bg-white hover:bg-emerald-50 transition"
                                                            title="Reactivate staff"
                                                        >
                                                            <UserCheck size={11} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteUser(member)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.06] text-foreground/40 bg-white hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                                                        title="Delete Staff"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full min-w-[800px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-black/5 bg-gray-50/50 text-[10px] font-bold font-mono uppercase tracking-widest text-foreground/40">
                                    <th className="px-6 py-4">Invited contact</th>
                                    <th className="px-6 py-4">Role Assigned</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Invited By</th>
                                    <th className="px-6 py-4">Invited Date</th>
                                    <th className="px-6 py-4">Expiration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 text-xs">
                                {filteredInvitations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-foreground/40 font-mono tracking-wider">
                                            NO INVITES RECORDED
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvitations.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/20 transition-colors">
                                            <td className="px-6 py-3.5 font-bold text-black font-mono">
                                                {inv.email}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                                                    inv.role === 'Admin' 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200/50' 
                                                        : inv.role === 'Manager'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200/50'
                                                }`}>
                                                    {inv.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase border ${
                                                    inv.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200/50' :
                                                    inv.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                                                    'bg-neutral-100 text-neutral-500 border-neutral-200'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-foreground/50 font-mono text-[10px]">
                                                {inv.invited_by}
                                            </td>
                                            <td className="px-6 py-3.5 text-foreground/40 font-semibold font-mono">
                                                {new Date(inv.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-3.5 text-foreground/40 font-semibold font-mono">
                                                {inv.status === 'accepted' ? (
                                                    <span className="text-green-600 font-bold uppercase text-[10px]">Claimed</span>
                                                ) : (
                                                    new Date(inv.expires_at) < new Date() ? (
                                                        <span className="text-rose-600 font-bold uppercase text-[10px]">Expired</span>
                                                    ) : (
                                                        new Date(inv.expires_at).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {(inv.status === 'pending' || inv.status === 'expired') ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleResendInvitation(inv)}
                                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.06] text-foreground/50 bg-white hover:bg-gray-50 shadow-sm transition"
                                                                title="Resend Invitation Link"
                                                            >
                                                                <RefreshCw size={11} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelInvitation(inv)}
                                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.06] text-foreground/40 bg-white hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                                                                title="Cancel Invitation"
                                                            >
                                                                <XCircle size={11} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-foreground/30 italic font-mono px-2">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Modals */}
            <UserFormModal
                show={showModal}
                onClose={closeModal}
                onSubmit={handleSubmit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingMember={editingMember}
                roles={roles}
            />

            <AddMemberModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                roles={roles}
            />

            <InviteMemberModal
                show={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                roles={roles}
            />

            <ConfirmModal
                show={confirmState.show}
                onClose={() => setConfirmState((prev) => ({ ...prev, show: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                variant={confirmState.variant}
            />
        </AdminLayout>
    );
}
