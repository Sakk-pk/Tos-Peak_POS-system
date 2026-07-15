import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import { Package, Search, ChevronRight, ShoppingBag, Calendar, CreditCard, CheckCircle2, XCircle, Clock, ArrowLeft, Eye, Download } from 'lucide-react';
import InvoiceModal from '@/Components/Order/InvoiceModal';
import { generateInvoicePDF } from '@/Utils/invoiceGenerator';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

const StatusBadge = ({ status }) => {
    const map = {
        Paid:      { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        Pending:   { icon: Clock,        color: 'bg-amber-50  text-amber-700  border-amber-200'  },
        Refunded:  { icon: XCircle,      color: 'bg-red-50    text-red-700    border-red-200'    },
        Cancelled: { icon: XCircle,      color: 'bg-rose-50   text-rose-700   border-rose-200'   },
    };
    const { icon: Icon, color } = map[status] || map.Pending;
    return (
        <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-none ${color}`}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
};

const PaymentMethod = ({ method }) => {
    const labels = { cash: 'Cash', card: 'Card', qr: 'QR Pay' };
    return (
        <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-600 rounded-none border border-neutral-200">
            <CreditCard className="h-3 w-3" />
            {labels[method] || method}
        </span>
    );
};

export default function MyOrders({ orders, filters = {} }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [expandedId, setExpandedId] = useState(null);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [autoDownload, setAutoDownload] = useState(false);
    const [activeDownloadingId, setActiveDownloadingId] = useState(null);

    const handleDownloadInvoice = (order) => {
        if (activeDownloadingId) return;
        setActiveDownloadingId(order.id);
        generateInvoicePDF(order)
            .catch((err) => {
                console.error("PDF generation failed:", err);
            })
            .finally(() => {
                setActiveDownloadingId(null);
            });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('my-orders.index'), { search: searchInput }, { preserveState: true, replace: true });
    };

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const orderList = orders?.data || [];

    return (
        <StorefrontLayout title="My Orders — TOS-PEAK">
            <Head title="My Orders — TOS-PEAK" />

            <div className="mx-auto w-full max-w-[1000px] px-5 sm:px-8 py-10 text-[#111111] animate-fade-in select-none">

                {/* Back button */}
                <Link 
                    href={route('storefront.index')}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black mb-6 transition no-underline hover:no-underline"
                >
                    <ArrowLeft size={13} /> Continue Shopping
                </Link>

                {/* ── Header ── */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-neutral-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                Order history log
                            </span>
                        </div>
                        <h1 className="text-[40px] font-black uppercase tracking-tight text-neutral-950 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                            my orders
                        </h1>
                    </div>
                </div>

                {/* ── Search bar ── */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative border border-neutral-300 bg-[#F9FAFB] focus-within:border-black transition">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by order number…"
                            className="w-full bg-transparent py-3.5 pl-11 pr-24 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-neutral-800"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* ── Order List ── */}
                {orderList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-neutral-200 bg-neutral-50/50 py-20 text-center space-y-4">
                        <Package className="h-10 w-10 text-neutral-300" />
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-wider text-neutral-900">No orders found</p>
                            <p className="text-[11px] text-neutral-500 font-semibold max-w-[300px]">
                                {filters.search ? 'Try checking for another order number.' : "You haven't placed any sneaker orders yet."}
                            </p>
                        </div>
                        <Link
                            href={route('storefront.index')}
                            className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 no-underline"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orderList.map((order) => (
                            <div
                                key={order.id}
                                className="border border-neutral-200 bg-white shadow-sm hover:border-black transition"
                            >
                                {/* ── Order Header ── */}
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(order.id)}
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Order icon */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-50 border border-neutral-100">
                                            <Package className="h-5 w-5 text-neutral-500" />
                                        </div>
                                        {/* Order info */}
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-neutral-950 font-mono tracking-tight">
                                                {order.order_number}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(order.created_at)}
                                                </span>
                                                <PaymentMethod method={order.payment_method} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-neutral-950">
                                                {formatPrice(order.total_amount)}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                                {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.payment_status} />
                                        <ChevronRight
                                            className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                                                expandedId === order.id ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </div>
                                </button>

                                {/* ── Expanded Items ── */}
                                {expandedId === order.id && (
                                    <div className="border-t border-neutral-100 bg-[#F9FAFB] px-6 py-5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-black/5 pb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                Items in this order
                                            </p>
                                            <div className="flex items-center gap-2 select-none">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInvoiceOrder(order);
                                                        setAutoDownload(false);
                                                        setShowInvoiceModal(true);
                                                    }}
                                                    className="inline-flex h-7 px-3 items-center gap-1.5 rounded-lg border border-black/10 bg-white text-[10px] font-black uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-black active:scale-95 transition duration-155"
                                                    title="View Invoice"
                                                >
                                                    <Eye size={12} /> View Invoice
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={activeDownloadingId === order.id}
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    className="inline-flex h-7 px-3 items-center gap-1.5 rounded-lg border border-black/10 bg-white text-[10px] font-black uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-black disabled:opacity-50 active:scale-95 transition duration-155"
                                                    title="Download Invoice"
                                                >
                                                    {activeDownloadingId === order.id ? (
                                                        <span className="w-3 h-3 rounded-full border border-gray-400 border-t-transparent animate-spin" />
                                                    ) : (
                                                        <Download size={12} />
                                                    )}
                                                    {activeDownloadingId === order.id ? 'Generating...' : 'Download Invoice'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {(order.items || []).map((item, i) => {
                                                const imgSrc = item.product_image
                                                    ? (item.product_image.startsWith('http') || item.product_image.startsWith('/'))
                                                        ? item.product_image
                                                        : `/storage/${item.product_image}`
                                                    : null;
                                                return (
                                                    <div key={i} className="flex items-center gap-4 border border-neutral-200 bg-white p-3.5 hover:border-black transition">
                                                        <div className="h-14 w-14 shrink-0 border border-neutral-200 bg-white overflow-hidden flex items-center justify-center">
                                                            {imgSrc ? (
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={item.product_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-neutral-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black uppercase text-neutral-950 truncate leading-tight">{item.product_name}</p>
                                                            <p className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">
                                                                {[item.brand, item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(' · ')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-xs font-black text-neutral-955 text-neutral-950">{formatPrice(item.price * item.quantity)}</p>
                                                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Order totals */}
                                        <div className="pt-4 border-t border-neutral-200/60 space-y-2 text-[13px] text-neutral-500 font-semibold max-w-sm ml-auto">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span className="text-neutral-955 text-neutral-955 text-neutral-950 font-bold">{formatPrice(order.subtotal || (order.total_amount - (order.tax || 0)))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sales Tax</span>
                                                <span className="text-neutral-955 text-neutral-955 text-neutral-950 font-bold">{formatPrice(order.tax || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-base font-black text-neutral-950 border-t border-black/5 pt-2 mt-1">
                                                <span>Total Amount</span>
                                                <span>{formatPrice(order.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination ── */}
                {orders?.links && orders.links.length > 3 && (
                    <div className="mt-8 flex items-center justify-center gap-1.5">
                        {orders.links.map((link, i) => (
                            <button
                                key={i}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`min-w-[36px] h-9 px-3 text-xs font-bold transition rounded-none border ${
                                    link.active
                                        ? 'bg-black text-white border-black'
                                        : link.url
                                            ? 'bg-white border-neutral-300 text-neutral-700 hover:border-black hover:text-black'
                                            : 'bg-neutral-50 border-neutral-200 text-neutral-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <InvoiceModal
                show={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                    setInvoiceOrder(null);
                    setAutoDownload(false);
                }}
                order={invoiceOrder}
                autoDownload={autoDownload}
            />
        </StorefrontLayout>
    );
}
