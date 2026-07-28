import React from 'react';
import Modal from '@/Components/Modal';
import { X, Mail, Phone, Calendar, ShoppingBag, Award, BarChart2, DollarSign, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function CustomerDetailsModal({ show, onClose, customer }) {
    if (!customer) return null;

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateStr;
        }
    };

    const isActive = customer.status !== 'Inactive';

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 text-xs">
                {/* Header banner */}
                <div className="bg-gray-900 p-6 text-white relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                    >
                        <X size={15} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-base font-bold text-white shadow">
                            {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white truncate">
                                    {customer.name}
                                </h3>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    isActive
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                    {isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 truncate mt-0.5">{customer.email}</p>
                        </div>
                    </div>
                </div>

                {/* Content body */}
                <div className="p-6 space-y-6">
                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <DollarSign size={13} className="text-orange-600" /> Lifetime
                            </span>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {formatCurrency(customer.lifetime)}
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <ShoppingBag size={13} className="text-blue-600" /> Orders
                            </span>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {customer.orders_count || 0} orders
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <BarChart2 size={13} className="text-purple-600" /> Visits
                            </span>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {customer.visits || 0} visits
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Award size={13} className="text-amber-600" /> Rewards
                            </span>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {customer.points || 0} pts
                            </p>
                        </div>
                    </div>

                    {/* Detailed info list */}
                    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                        <div className="p-3.5 flex items-center justify-between">
                            <span className="font-medium text-gray-600 flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" /> Contact Email
                            </span>
                            <span className="font-semibold text-gray-900">{customer.email}</span>
                        </div>

                        <div className="p-3.5 flex items-center justify-between">
                            <span className="font-medium text-gray-600 flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" /> Phone Number
                            </span>
                            <span className="font-semibold text-gray-900">{customer.phone || 'N/A'}</span>
                        </div>

                        <div className="p-3.5 flex items-center justify-between">
                            <span className="font-medium text-gray-600 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" /> Joined Date
                            </span>
                            <span className="font-semibold text-gray-900">{formatDate(customer.created_at)}</span>
                        </div>

                        <div className="p-3.5 flex items-center justify-between">
                            <span className="font-medium text-gray-600 flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" /> Latest Purchase
                            </span>
                            <span className="font-semibold text-gray-900">{formatDate(customer.latest_order_date)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-black transition active:scale-95 duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
