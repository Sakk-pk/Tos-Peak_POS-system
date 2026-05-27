import AdminLayout from '@/Layouts/AdminLayout';
import UserFormModal from './UserFormModal';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import UserCardRow from '@/Components/Users/UserCardRow';
import PageHeader from '@/Components/Shared/PageHeader';
import { CircleUserRound, UserPlus } from 'lucide-react';

function makeInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
}

export default function UserListPage({ users: usersPage, roles = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const users = usersPage?.data ?? [];
    const members = useMemo(() => users.map((user) => ({
        id: user.id,
        initials: makeInitials(user.name),
        name: user.name,
        email: user.email,
        phone: '',
        role: user.roles?.[0]?.name ?? 'Unassigned',
        status: 'Active',
    })), [users]);

    const defaultRole = roles[0]?.name ?? '';
    const { data, setData, errors, reset, processing, clearErrors, post, patch } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: defaultRole,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!editingMember) {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                },
            });
            return;
        }

        patch(route('users.update', editingMember.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const openAddModal = () => {
        setEditingMember(null);
        clearErrors();
        reset();
        setData({
            name: '',
            phone: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: roles[0]?.name ?? '',
        });
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        clearErrors();
        setData({
            name: member.name,
            phone: member.phone || '',
            email: member.email,
            password: '',
            password_confirmation: '',
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

    const handleDelete = (member) => {
        const confirmed = window.confirm(`Delete ${member.name}? This will remove the user from the list.`);

        if (!confirmed) {
            return;
        }

        router.delete(route('users.destroy', member.id), {
            preserveScroll: true,
        });

        if (editingMember?.email === member.email) {
            closeModal();
        }
    };

    return (
        <AdminLayout>
            <Head title="Users" />

            <div className="min-h-full bg-gradient-to-br from-[#f9f9f7] to-[#f7f7f5] text-[#111111]">
                <div className="px-8 py-8">
                    <PageHeader
                        eyebrow="User management"
                        eyebrowIcon={CircleUserRound}
                        title="Users"
                        description="Manage team members and assign roles."
                        actions={(
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-black to-black/90 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-all hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add User
                            </button>
                        )}
                    />

                    <div className="rounded-2xl border border-black/8 bg-white/80 backdrop-blur-sm p-6 shadow-sm shadow-black/5">
                        <div className="mb-6 flex flex-col gap-4 border-b border-black/5 pb-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="flex items-center gap-3 text-lg font-bold text-black">
                                    <CircleUserRound className="h-5 w-5 text-black/70" />
                                    Team Members
                                </div>
                                <p className="mt-1 text-sm text-black/55">Review roles, update access, or edit member details.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-black/10">
                                    {members.length} total
                                </div>
                                <div className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-semibold text-black/65">
                                    {members.filter((member) => member.role === 'Admin').length} admins
                                </div>
                                <div className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-semibold text-black/65">
                                    {members.filter((member) => member.role === 'Manager').length} managers
                                </div>
                                <div className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-semibold text-black/65">
                                    {members.filter((member) => member.role === 'Staff').length} staff
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse text-left">
                                <thead className="bg-black/2">
                                    <tr className="text-xs font-semibold uppercase tracking-wide text-black/45">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <UserCardRow
                                            key={member.email}
                                            member={member}
                                            onEdit={openEditModal}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
        </AdminLayout>
    );
}
