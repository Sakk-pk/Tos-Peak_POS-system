import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import Modal from '@/Components/Modal';
import CustomerFormModal from './components/CustomerFormModal';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import { Head, router } from '@inertiajs/react';
import {
    Search,
    Users,
    Sparkles,
    Phone,
    BarChart2,
    UserPlus,
    Eye,
    Edit3,
    Trash2,
    Power,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
} from 'lucide-react';

export default function CustomersPage({ customers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [confirmDeleteState, setConfirmDeleteState] = useState({
        show: false,
        customer: null,
    });

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatLifetime = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const filteredCustomers = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        return customers.filter((c) => {
            const matchesSearch =
                !normalized ||
                c.name.toLowerCase().includes(normalized) ||
                c.email.toLowerCase().includes(normalized) ||
                (c.phone && c.phone.toLowerCase().includes(normalized));

            const isCustomerActive = c.status !== 'Inactive';
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && isCustomerActive) ||
                (statusFilter === 'inactive' && !isCustomerActive);

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    // Page stats
    const totalVisits = customers.reduce((sum, c) => sum + Number(c.visits || 0), 0);
    const totalLifetime = customers.reduce((sum, c) => sum + Number(c.lifetime || 0), 0);

    const handleOpenAddModal = () => {
        setEditingCustomer(null);
        setShowFormModal(true);
    };

    const handleOpenEditModal = (customer) => {
        setEditingCustomer(customer);
        setShowFormModal(true);
    };

    const handleOpenDetailsModal = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailsModal(true);
    };

    const handleToggleStatus = (customer) => {
        router.post(route('customers.toggle-status', customer.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteClick = (customer) => {
        setConfirmDeleteState({
            show: true,
            customer,
        });
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteState.customer) {
            router.delete(route('customers.destroy', confirmDeleteState.customer.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDeleteState({ show: false, customer: null });
                },
            });
        }
    };

    return (
        <AdminLayout navbarTitle="Customers" contentClassName="px-8 py-6 space-y-6">
            <Head title="Customers" />

            {/* ── Page Metrics Cards ───────────────────────────────────── */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                <div className="summary-card bg-white border border-gray-200 p-5 flex items-center justify-between shadow-sm rounded-xl">
                    <div>
                        <span className="text-xs font-medium text-gray-500">Total Customers</span>
                        <h4 className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</h4>
                    </div>
                    <span className="p-2.5 bg-gray-100 text-gray-700 summary-card rounded-lg"><Users size={18} /></span>
                </div>

                <div className="summary-card bg-white border border-gray-200 p-5 flex items-center justify-between shadow-sm rounded-xl">
                    <div>
                        <span className="text-xs font-medium text-gray-500">Cumulative Check-ins</span>
                        <h4 className="text-2xl font-bold text-gray-900 mt-1">{totalVisits}</h4>
                    </div>
                    <span className="p-2.5 bg-gray-100 text-gray-700 summary-card rounded-lg"><BarChart2 size={18} /></span>
                </div>

                <div className="summary-card bg-white border border-gray-200 p-5 flex items-center justify-between shadow-sm col-span-2 lg:col-span-1 rounded-xl">
                    <div>
                        <span className="text-xs font-medium text-gray-500">Total Lifetime Value</span>
                        <h4 className="text-2xl font-bold text-orange-600 mt-1">{formatLifetime(totalLifetime)}</h4>
                    </div>
                    <span className="p-2.5 bg-orange-50 text-orange-600 summary-card rounded-lg"><Sparkles size={18} /></span>
                </div>
            </section>

            {/* ── Search & Filter Controls ─────────────────────────────── */}
            <section className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between flex-col sm:flex-row gap-4 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 pr-8 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-xs font-medium text-gray-500 shrink-0">
                        Showing {filteredCustomers.length} of {customers.length} records
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="h-10 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition active:scale-95 duration-200 shadow-sm flex items-center justify-center gap-2 shrink-0"
                    >
                        <UserPlus size={15} />
                        Add Customer
                    </button>
                </div>
            </section>

            {/* ── Customer Table ───────────────────────────────────────── */}
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600">
                                <th className="px-6 py-3.5">Customer Contact</th>
                                <th className="px-6 py-3.5">Phone Number</th>
                                <th className="px-6 py-3.5 text-center">Account Status</th>
                                <th className="px-6 py-3.5 text-center">Visits</th>
                                <th className="px-6 py-3.5 text-right">Lifetime Value</th>
                                <th className="px-6 py-3.5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.map((customer) => {
                                const isActive = customer.status !== 'Inactive';
                                return (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-gray-50/60 transition-colors"
                                    >
                                        {/* Avatar & Contact */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {customer.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <Phone size={13} className="text-gray-400" />
                                                {customer.phone || '—'}
                                            </span>
                                        </td>

                                        {/* Account Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                                                isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {isActive ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Visits count */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                                                {customer.visits} visits
                                            </span>
                                        </td>

                                        {/* Lifetime Value */}
                                        <td className="px-6 py-4 text-right text-xs font-semibold text-gray-900">
                                            {formatLifetime(customer.lifetime)}
                                        </td>

                                        {/* Action buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* View details */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetailsModal(customer)}
                                                    title="View Details"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition active:scale-95"
                                                >
                                                    <Eye size={15} />
                                                </button>

                                                {/* Edit customer */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(customer)}
                                                    title="Edit Customer"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition active:scale-95"
                                                >
                                                    <Edit3 size={15} />
                                                </button>

                                                {/* Toggle Active/Inactive */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(customer)}
                                                    title={isActive ? 'Deactivate Account' : 'Activate Account'}
                                                    className={`p-1.5 rounded-lg transition active:scale-95 ${
                                                        isActive
                                                            ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    <Power size={15} />
                                                </button>

                                                {/* Delete customer */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(customer)}
                                                    title="Delete Customer"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="px-6 py-12 text-center text-xs font-medium text-gray-500">
                        No customer records matching search or filter criteria.
                    </div>
                )}
            </section>

            {/* ── Modals ───────────────────────────────────────────────── */}
            <CustomerFormModal
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                customer={editingCustomer}
            />

            <CustomerDetailsModal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                customer={selectedCustomer}
            />

            <ConfirmModal
                show={confirmDeleteState.show}
                onClose={() => setConfirmDeleteState({ show: false, customer: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Customer Account"
                message={`Are you sure you want to permanently delete customer account for "${confirmDeleteState.customer?.name}" (${confirmDeleteState.customer?.email})? This action cannot be undone.`}
                confirmText="Delete Customer"
                variant="danger"
            />
        </AdminLayout>
    );
}
