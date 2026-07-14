import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head } from '@inertiajs/react';
import { Search, Users, Sparkles, Phone, BarChart2 } from 'lucide-react';

export default function CustomersPage({ customers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

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
        }).format(value);
    };

    const filteredCustomers = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return customers;
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(normalized) ||
                c.email.toLowerCase().includes(normalized) ||
                (c.phone && c.phone.toLowerCase().includes(normalized))
        );
    }, [customers, searchTerm]);

    // Page stats
    const totalVisits = customers.reduce((sum, c) => sum + Number(c.visits || 0), 0);
    const totalLifetime = customers.reduce((sum, c) => sum + Number(c.lifetime || 0), 0);

    return (
        <AdminLayout navbarTitle="Customers" contentClassName="px-8 py-6 space-y-6">
            <Head title="Customers" />

            {/* ── Page Metrics ─────────────────────────────────────────── */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Total contacts</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{customers.length}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><Users size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Cumulative visits</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{totalVisits}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><BarChart2 size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none col-span-2 lg:col-span-1">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Total lifetime value</span>
                        <h4 className="text-2xl font-black font-display text-[#f97316] mt-1.5 leading-none">{formatLifetime(totalLifetime)}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-[#f97316]"><Sparkles size={16} /></span>
                </div>
            </section>

            {/* ── Search Container ──────────────────────────────────────── */}
            <section className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center justify-between flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, or phone..."
                        className="h-10 w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                    />
                </div>
                <div className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest shrink-0">
                    {filteredCustomers.length} records matching
                </div>
            </section>

            {/* ── Table Card ───────────────────────────────────────────── */}
            <section className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-black/[0.06] bg-gray-50/50 text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">Customer contact</th>
                                <th className="px-6 py-4">Phone number</th>
                                <th className="px-6 py-4 text-center">Visits</th>
                                <th className="px-6 py-4 text-right">Lifetime value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {filteredCustomers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="hover:bg-gray-50/20 transition-all duration-200"
                                >
                                    {/* Avatar & Contact stacked details */}
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[10px] font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                {getInitials(customer.name)}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 leading-tight">
                                                    {customer.name}
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-400 mt-1 leading-none">
                                                    {customer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-6 py-3.5 text-xs font-medium text-gray-500 font-mono">
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={11} className="text-gray-400" />
                                            {customer.phone || '—'}
                                        </span>
                                    </td>

                                    {/* Visits count as metric pill */}
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="inline-flex items-center justify-center font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-gray-50 text-gray-600 border border-black/[0.04]">
                                            {customer.visits} check-ins
                                        </span>
                                    </td>

                                    {/* Lifetime Value */}
                                    <td className="px-6 py-3.5 text-right text-xs font-bold text-black font-mono">
                                        {formatLifetime(customer.lifetime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="px-6 py-12 text-center text-xs font-mono tracking-widest text-foreground/45">
                        NO CUSTOMERS MATCH FILTERS
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
