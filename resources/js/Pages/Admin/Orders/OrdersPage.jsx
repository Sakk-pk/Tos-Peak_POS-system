import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import Modal from '@/Components/Modal';
import { 
    Search, 
    Eye, 
    X, 
    ShoppingBag, 
    CreditCard, 
    QrCode, 
    ArrowLeft,
    ArrowRight,
    TrendingUp,
    CheckCircle
} from 'lucide-react';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function OrdersPage({ orders, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('orders.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val === '') {
            router.get(route('orders.index'), { search: '' }, {
                preserveState: true,
                replace: true
            });
        }
    };

    const openOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const closeOrderDetail = () => {
        setSelectedOrder(null);
        setShowDetailModal(false);
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = String(hours).padStart(2, '0');
            
            return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
        } catch (e) {
            return dateString;
        }
    };

    const orderList = orders?.data || [];
    const paginationLinks = orders?.links || [];

    // Calculate sum of order total for page stats
    const pageTotal = orderList.reduce((sum, o) => sum + Number(o.total_amount), 0);

    const makeInitials = (name = '') => {
        return name
            .split(' ')
            .filter(Boolean)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <AdminLayout navbarTitle="Orders" contentClassName="px-8 py-6 space-y-6">
            <Head title="Orders" />

            {/* ── Page Metrics ─────────────────────────────────────────── */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Orders count</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{orders?.total || 0}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><ShoppingBag size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none col-span-1">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">Page revenue</span>
                        <h4 className="text-2xl font-black font-display text-black mt-1.5 leading-none">{formatPrice(pageTotal)}</h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600"><TrendingUp size={16} /></span>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none col-span-2 lg:col-span-1">
                    <div>
                        <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">System status</span>
                        <h4 className="text-sm font-bold text-emerald-700 mt-1.5 uppercase flex items-center gap-1.5 leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" /> POS Active
                        </h4>
                    </div>
                    <span className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.04] text-black"><CheckCircle size={16} /></span>
                </div>
            </section>

            {/* ── Search bar ───────────────────────────────────────────── */}
            <section className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search orders by customer name or ID..."
                            className="h-[38px] w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex h-[38px] items-center justify-center rounded-xl bg-black px-6 text-xs font-bold text-white uppercase tracking-wider transition hover:bg-neutral-900 active:scale-95 duration-200 shadow-sm"
                    >
                        Search
                    </button>
                </form>
            </section>

            {/* ── Table Card ───────────────────────────────────────────── */}
            <section className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-black/[0.06] bg-gray-50/50 text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">Order reference</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Total amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {orderList.map((order) => {
                                const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                                const initials = makeInitials(order.customer_name);

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/20 transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold font-mono text-black">
                                                #{String(order.id).padStart(4, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-500 font-mono">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-[10px] font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    {initials || 'C'}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900">{order.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 font-mono">
                                            {itemCount} items
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-black font-mono">
                                            {formatPrice(order.total_amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[9px] font-black font-display border uppercase tracking-wider ${
                                                order.payment_status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : order.payment_status === 'Pending'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : order.payment_status === 'Cancelled'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openOrderDetail(order)}
                                                className="inline-flex h-8 items-center gap-1.5 px-3.5 rounded-xl border border-black/10 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm duration-200"
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {orderList.length === 0 && (
                    <div className="px-6 py-12 text-center text-xs font-mono tracking-widest text-foreground/45">
                        NO ORDERS FOUND
                    </div>
                )}

                {/* Redesigned Pagination */}
                {paginationLinks.length > 3 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] bg-gray-50/10 px-6 py-4">
                        <div className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">
                            Showing {orders.from || 0} to {orders.to || 0} of {orders.total} orders
                        </div>
                        <div className="flex items-center gap-1">
                            {paginationLinks.map((link, idx) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                                            aria-label="Previous"
                                        >
                                            <ArrowLeft size={12} />
                                        </button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                                            aria-label="Next"
                                        >
                                            <ArrowRight size={12} />
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                        disabled={link.active || !link.url}
                                        className={`h-8 min-w-8 rounded-xl px-2.5 text-[9px] font-black font-display uppercase tracking-wider transition ${
                                            link.active
                                                ? 'bg-black border border-black text-white shadow-sm'
                                                : 'border border-black/10 bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Redesigned Order Detail Modal */}
            <Modal show={showDetailModal} onClose={closeOrderDetail} maxWidth="md">
                {selectedOrder && (
                    <div className="p-6 text-xs text-foreground bg-white rounded-3xl border border-black/[0.06] shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                            <div>
                                <h3 className="text-sm font-black font-display uppercase tracking-wider text-black">
                                    Order #{String(selectedOrder.id).padStart(4, '0')}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase mt-1 tracking-wider leading-none">Invoice details</p>
                            </div>
                            <button
                                onClick={closeOrderDetail}
                                className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-50 border border-black/10 text-gray-400 hover:text-black transition"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Invoice Info Grid */}
                        <div className="mt-4 grid grid-cols-2 gap-4 border-b border-black/[0.06] pb-4">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-wider">Timestamp</span>
                                <p className="font-bold text-gray-900 leading-none">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-wider">Customer name</span>
                                <p className="font-bold text-gray-900 leading-none">{selectedOrder.customer_name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-wider">Payment channel</span>
                                <p className="font-bold text-gray-900 leading-none capitalize">{selectedOrder.payment_method}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-wider">Status</span>
                                <p className={`font-bold leading-none capitalize ${
                                    selectedOrder.payment_status === 'Paid'
                                        ? 'text-emerald-600'
                                        : selectedOrder.payment_status === 'Pending'
                                        ? 'text-amber-600'
                                        : selectedOrder.payment_status === 'Cancelled'
                                        ? 'text-rose-600'
                                        : 'text-gray-500'
                                }`}>{selectedOrder.payment_status}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mt-4">
                            <div className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400 mb-3">
                                Purchased items
                            </div>
                            <div className="max-h-[220px] overflow-y-auto pr-1 divide-y divide-black/[0.04]">
                                {selectedOrder.items?.map((item) => {
                                    const imageSrc = item.product_image
                                        ? (item.product_image.startsWith('http') || item.product_image.startsWith('/'))
                                            ? item.product_image
                                            : `/storage/${item.product_image}`
                                        : '/images/placeholder-product.png';

                                    return (
                                        <div key={item.id} className="py-2.5 flex justify-between items-center gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-50 border border-black/[0.05] flex items-center justify-center">
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/images/placeholder-product.png';
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="font-bold text-gray-900 truncate leading-tight">{item.product_name}</h5>
                                                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">
                                                        Size {item.size} · Color {item.color}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="font-mono font-bold text-black">
                                                    {formatPrice(item.price * item.quantity)}
                                                </div>
                                                <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                                                    {item.quantity} x {formatPrice(item.price)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="mt-4 border-t border-black/[0.06] pt-4 space-y-2">
                            <div className="flex justify-between text-gray-500 font-semibold">
                                <span>Subtotal</span>
                                <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-semibold">
                                <span>Tax (8%)</span>
                                <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.tax)}</span>
                            </div>

                            {selectedOrder.payment_method === 'cash' && (
                                <div className="space-y-1 bg-gray-50/50 rounded-xl p-3 text-gray-600 border border-black/[0.04] mt-2">
                                    <div className="flex justify-between text-[11px] font-semibold">
                                        <span>Cash Tendered</span>
                                        <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.cash_received)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-black/10 pt-2 mt-2 text-[11px] font-semibold">
                                        <span>Change Due</span>
                                        <span className="font-bold font-mono text-emerald-600">{formatPrice(selectedOrder.change_amount)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-black/[0.06] pt-3 items-baseline">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Total Invoice Value</span>
                                <span className="text-base font-bold font-mono text-[#f97316]">{formatPrice(selectedOrder.total_amount)}</span>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={closeOrderDetail}
                                className="w-full h-9 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-900 transition duration-200 shadow-sm"
                            >
                                Close invoice
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
