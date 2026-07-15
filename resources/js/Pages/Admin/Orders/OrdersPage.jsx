import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import Modal from '@/Components/Modal';
import TableContainer from '@/Components/ui/TableContainer';
import { 
    Search, 
    Eye, 
    X, 
    ShoppingBag, 
    CreditCard, 
    ArrowLeft,
    ArrowRight,
    TrendingUp,
    CheckCircle,
    Download,
    AlertOctagon
} from 'lucide-react';
import InvoiceModal from '@/Components/Order/InvoiceModal';
import { generateInvoicePDF } from '@/Utils/invoiceGenerator';

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

    const handleFilterSelect = (type, value) => {
        setSearchTerm(value);
        router.get(route('orders.index'), { search: value }, {
            preserveState: true,
            replace: true
        });
    };

    const handleCancelOrder = (orderId) => {
        if (confirm("Are you sure you want to cancel this pending order? This will release reserved stock back into inventory.")) {
            router.post(route('orders.cancel', orderId), {}, {
                onSuccess: () => {
                    closeOrderDetail();
                }
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

    const formatProductsList = (items) => {
        if (!items || items.length === 0) return 'No products';
        const firstItemName = items[0].product_name;
        if (items.length === 1) return firstItemName;
        return `${firstItemName} + ${items.length - 1} items`;
    };

    const isWalkInOrder = (order) => {
        return order.customer_name === 'Walk-in Customer' || order.payment_method === 'cash' || order.payment_method === 'card';
    };

    const getCustomerDisplayName = (order) => {
        if (order.customer_name === 'Walk-in Customer') {
            return 'Guest Customer';
        }
        return order.customer_name;
    };

    const getPaymentMethodLabel = (method) => {
        if (method === 'cash') return 'Cash';
        if (method === 'qr') return 'QR Payment';
        return method.toUpperCase();
    };

    const orderList = orders?.data || [];
    const paginationLinks = orders?.links || [];

    // Calculate aggregated metrics
    const pageTotal = orderList.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const cashTotal = orderList.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const qrTotal = orderList.filter(o => o.payment_method === 'qr' || o.payment_method === 'card').reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
        <AdminLayout navbarTitle="Orders" contentClassName="px-4 py-4 space-y-3.5 bg-[#f9f9fb] min-h-screen text-gray-900 select-none">
            <Head title="Orders" />

            {/* ── Page Metrics ─────────────────────────────────────────── */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="bg-white border border-black/[0.08] p-5 rounded-none flex items-center justify-between select-none">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">orders count</span>
                        <h4 className="text-xl font-extrabold text-black mt-1.5 leading-none">{orders?.total || 0}</h4>
                    </div>
                    <span className="p-2.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-none"><ShoppingBag size={15} /></span>
                </div>
                <div className="bg-white border border-black/[0.08] p-5 rounded-none flex items-center justify-between select-none">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">total revenue</span>
                        <h4 className="text-xl font-extrabold text-black mt-1.5 leading-none">{formatPrice(pageTotal)}</h4>
                    </div>
                    <span className="p-2.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-none"><TrendingUp size={15} /></span>
                </div>
                <div className="bg-white border border-black/[0.08] p-5 rounded-none flex items-center justify-between select-none">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">cash checkouts</span>
                        <h4 className="text-xl font-extrabold text-black mt-1.5 leading-none">{formatPrice(cashTotal)}</h4>
                    </div>
                    <span className="p-2.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-none"><CheckCircle size={15} /></span>
                </div>
                <div className="bg-white border border-black/[0.08] p-5 rounded-none flex items-center justify-between select-none">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">khqr checkouts</span>
                        <h4 className="text-xl font-extrabold text-black mt-1.5 leading-none">{formatPrice(qrTotal)}</h4>
                    </div>
                    <span className="p-2.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-none"><CreditCard size={15} /></span>
                </div>
            </section>

            {/* ── Search & Filter Controls ─────────────────────────────── */}
            <section className="bg-white border border-black/[0.08] p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search orders by customer name, order ref..."
                            className="h-[40px] w-full rounded-none border border-black/10 bg-white pl-10 pr-4 text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-0"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex h-[40px] items-center justify-center rounded-none bg-black px-6 text-xs font-bold text-white uppercase tracking-wider transition hover:bg-neutral-900 border border-black active:bg-white active:text-black"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <select
                        onChange={(e) => handleFilterSelect('method', e.target.value)}
                        className="h-[40px] px-3 border border-black/10 bg-white text-[10px] font-bold uppercase tracking-wider text-gray-600 outline-none focus:border-black transition rounded-none cursor-pointer"
                    >
                        <option value="">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="qr">KHQR</option>
                    </select>
                </div>
            </section>

            {/* ── Table Card ───────────────────────────────────────────── */}
            <div className="bg-white border border-black/[0.08] p-5 rounded-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold border-collapse">
                        <thead>
                            <tr className="text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/[0.08]">
                                <th className="pb-4 text-left">Order Details</th>
                                <th className="pb-4 px-4 text-left">Customer</th>
                                <th className="pb-4 px-4 text-left">Purchased products</th>
                                <th className="pb-4 px-4 text-left">Method</th>
                                <th className="pb-4 px-4 text-right">Total</th>
                                <th className="pb-4 pl-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {orderList.map((order) => {
                                const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                                const displayName = getCustomerDisplayName(order);

                                const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                });
                                const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                });
                                const formattedTimestamp = `${orderDate} • ${orderTime}`;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex flex-col gap-1">
                                                <span 
                                                    onClick={() => openOrderDetail(order)}
                                                    className="text-xs font-bold text-black cursor-pointer hover:underline"
                                                >
                                                    {order.order_number || `#TP-${String(order.id).padStart(6, '0')}`}
                                                </span>
                                                <span className="text-[9px] font-semibold text-gray-400">
                                                    {formattedTimestamp}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="py-5 px-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-gray-900 leading-tight truncate">
                                                    {displayName}
                                                </span>
                                                {order.customer_email && (
                                                    <span className="text-[9px] font-mono text-gray-400 mt-1 truncate">
                                                        {order.customer_email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="py-5 px-4 text-gray-655 font-sans text-xs">
                                            <div className="max-w-[200px] truncate font-bold text-gray-800" title={order.items?.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}>
                                                {formatProductsList(order.items)}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-semibold mt-1">
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                            </div>
                                        </td>

                                        <td className="py-5 px-4 uppercase font-mono font-bold text-gray-500 text-xs">
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </td>

                                        <td className="py-5 px-4 text-right font-extrabold text-gray-900 text-xs font-mono">
                                            {formatPrice(order.total_amount)}
                                        </td>
                                        
                                        <td className="py-5 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openOrderDetail(order)}
                                                    className="inline-flex h-8 items-center gap-1.5 px-3 border border-black/10 bg-white text-[9px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition"
                                                >
                                                    <Eye size={12} /> Details
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={activeDownloadingId === order.id}
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    className="inline-flex h-8 w-8 items-center justify-center border border-black/10 bg-white text-gray-500 hover:border-black hover:text-black transition"
                                                    title="Download Invoice"
                                                >
                                                    {activeDownloadingId === order.id ? (
                                                        <span className="w-3 h-3 border border-gray-400 border-t-transparent animate-spin" />
                                                    ) : (
                                                        <Download size={12} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {orderList.length === 0 && (
                <div className="px-6 py-12 text-center text-xs font-mono tracking-widest text-gray-400 bg-white border border-black/[0.08] rounded-none shadow-none mt-2">
                    NO ORDERS FOUND
                </div>
            )}

            {/* Redesigned Pagination */}
            {paginationLinks.length > 3 && (
                <div className="flex items-center justify-between border border-black/[0.08] bg-white rounded-none px-6 py-4 mt-2 shadow-none">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Showing {orders.from || 0} to {orders.to || 0} of {orders.total} transactions
                    </div>
                    <div className="flex items-center gap-1">
                        {paginationLinks.map((link, idx) => {
                            if (link.label.includes('Previous')) {
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                        className="flex h-8 w-8 items-center justify-center border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 rounded-none"
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
                                        className="flex h-8 w-8 items-center justify-center border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 rounded-none"
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
                                    className={`h-8 min-w-8 px-2.5 text-[9px] font-bold uppercase tracking-wider transition rounded-none ${
                                        link.active
                                            ? 'bg-black border border-black text-white'
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

            {/* Redesigned Order Detail Modal */}
            <Modal show={showDetailModal} onClose={closeOrderDetail} maxWidth="md">
                {selectedOrder && (
                    <div className="p-6 text-xs text-gray-900 bg-white rounded-none border border-black/[0.08] shadow-none flex flex-col space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black/[0.08] pb-3">
                            <div>
                                <h3 className="text-sm font-extrabold uppercase tracking-widest text-black">
                                    TRANSACTION DETAIL
                                </h3>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-wider leading-none">
                                    {selectedOrder.order_number || `#TP-${String(selectedOrder.id).padStart(6, '0')}`}
                                </p>
                            </div>
                            <button
                                onClick={closeOrderDetail}
                                className="flex h-7 w-7 items-center justify-center bg-gray-50 border border-black/10 text-gray-400 hover:text-black transition rounded-none"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Invoice Info Grid */}
                        <div className="grid grid-cols-2 gap-4 border-b border-black/[0.08] pb-4">
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-450 uppercase tracking-widest">customer</span>
                                <p className="font-bold text-gray-955 leading-none">{getCustomerDisplayName(selectedOrder)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-455 uppercase tracking-widest text-gray-450">email</span>
                                <p className="font-bold text-gray-900 leading-none font-mono">
                                    {selectedOrder.customer_email || 'None'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-455 uppercase tracking-widest text-gray-450">payment method</span>
                                <p className="font-bold text-gray-900 leading-none uppercase">
                                    {getPaymentMethodLabel(selectedOrder.payment_method)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-450 uppercase tracking-widest">shipping address</span>
                                <p className="font-bold text-gray-900 leading-none">
                                    {isWalkInOrder(selectedOrder) ? 'N/A - In-Store Pickup' : 'Phnom Penh, Cambodia'}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-450 mb-3">
                                purchased items
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
                                                <div className="h-9 w-9 shrink-0 rounded-none bg-gray-50 border border-black/[0.05] flex items-center justify-center">
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
                        <div className="border-t border-black/[0.08] pt-4 space-y-2">
                            <div className="flex justify-between text-gray-500 font-semibold">
                                <span>Subtotal</span>
                                <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-semibold">
                                <span>Tax (8%)</span>
                                <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.tax)}</span>
                            </div>

                            {selectedOrder.payment_method === 'cash' && (
                                <div className="space-y-1 bg-gray-50/50 p-3 text-gray-600 border border-black/[0.04] mt-2">
                                    <div className="flex justify-between text-[11px] font-semibold">
                                        <span>Cash Received</span>
                                        <span className="font-bold font-mono text-black">{formatPrice(selectedOrder.cash_received)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-black/10 pt-2 mt-2 text-[11px] font-semibold">
                                        <span>Change Amount</span>
                                        <span className="font-bold font-mono text-emerald-600">{formatPrice(selectedOrder.change_amount)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-black/[0.08] pt-3 items-baseline">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">grand total</span>
                                <span className="text-base font-bold font-mono text-black">{formatPrice(selectedOrder.total_amount)}</span>
                            </div>
                        </div>

                        {/* Order Operations */}
                        <div className="flex flex-col gap-2 pt-2">
                            {selectedOrder.payment_status === 'Pending' && (
                                <button
                                    type="button"
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                                >
                                    <AlertOctagon size={13} /> Cancel Order & Release Stock
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setInvoiceOrder(selectedOrder);
                                    setAutoDownload(false);
                                    setShowInvoiceModal(true);
                                }}
                                className="w-full h-9 bg-black border border-black hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition"
                            >
                                Generate invoice pdf
                            </button>

                            <button
                                type="button"
                                onClick={closeOrderDetail}
                                className="w-full h-9 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

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
        </AdminLayout>
    );
}
