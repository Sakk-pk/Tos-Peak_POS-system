import React from 'react';

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
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}

const StatusBadge = ({ status }) => {
    const map = {
        Paid:      { color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        Pending:   { color: 'bg-amber-50  text-amber-700  border-amber-200'  },
        Refunded:  { color: 'bg-red-50    text-red-700    border-red-200'    },
        Cancelled: { color: 'bg-rose-50   text-rose-700   border-rose-200'   },
    };
    const { color } = map[status] || map.Pending;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${color}`}>
            {status}
        </span>
    );
};

export default function InvoiceBody({ order, isPDF = false }) {
    if (!order) return null;

    const invoiceNumber = `INV-${order.order_number || String(order.id).padStart(6, '0')}`;
    const orderNumber = order.order_number || String(order.id).padStart(4, '0');
    const paymentMethodLabel = { cash: 'Cash', card: 'Credit Card', qr: 'QR Pay' }[order.payment_method] || order.payment_method;
    const customerType = order.customer_name === 'Walk-in Customer' ? 'Walk-in Customer' : 'Registered User';

    return (
        <div className="p-8 sm:p-12 bg-white text-[#111111] font-sans selection:bg-neutral-100">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-black/[0.08] pb-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black shrink-0">
                        {isPDF ? (
                            <div className="text-white text-xs font-black tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>TP</div>
                        ) : (
                            <img
                                src="/images/Tos_Peak-Logo.png"
                                alt="TOS-PEAK"
                                className="h-8 w-8 object-contain filter invert"
                                onError={(e) => { 
                                    e.currentTarget.style.display = 'none';
                                    const tp = document.createElement('div');
                                    tp.className = 'text-white text-xs font-black tracking-tighter';
                                    tp.innerText = 'TP';
                                    e.currentTarget.parentElement.appendChild(tp);
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-black leading-tight">TOS-PEAK</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Official Sneakers Store</p>
                        <p className="text-[9.5px] text-gray-500 font-medium mt-2">123 Street Boulevard, Suite 500<br/>Phnom Penh, Cambodia</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-black font-display uppercase tracking-wider text-black leading-none mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>INVOICE</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Invoice Number</p>
                    <p className="text-sm font-bold font-mono text-black">{invoiceNumber}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Order Reference</p>
                    <p className="text-sm font-bold font-mono text-black">#{orderNumber}</p>
                </div>
            </div>

            {/* Metadata Details Grid */}
            <div className="grid grid-cols-3 gap-6 border-b border-black/[0.08] pb-6 mb-6">
                <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Billed To</span>
                    <p className="text-xs font-bold text-black">{order.customer_name}</p>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{customerType}</p>
                    {order.customer_email && (
                        <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">{order.customer_email}</p>
                    )}
                </div>
                <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Transaction Details</span>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider leading-none">
                        Payment: <span className="font-bold text-black">{paymentMethodLabel}</span>
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Status:</span>
                        <StatusBadge status={order.payment_status} />
                    </div>
                </div>
                <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Issue Timestamp</span>
                    <p className="text-xs font-bold text-black font-mono">{formatDate(order.created_at)}</p>
                </div>
            </div>

            {/* Item list Table */}
            <div className="mb-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/10 bg-neutral-50 text-[9px] font-black uppercase tracking-wider text-gray-500">
                            <th className="px-4 py-2.5 rounded-l-lg">Product / Details</th>
                            <th className="px-4 py-2.5 text-center">Unit Price</th>
                            <th className="px-4 py-2.5 text-center">Quantity</th>
                            <th className="px-4 py-2.5 text-right rounded-r-lg">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                        {(order.items || []).map((item, idx) => {
                            const imageSrc = item.product_image
                                ? (item.product_image.startsWith('http') || item.product_image.startsWith('/'))
                                    ? item.product_image
                                    : `/storage/${item.product_image}`
                                : null;

                            return (
                                <tr key={idx} className="text-xs">
                                    <td className="px-4 py-3.5 flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 border border-neutral-100 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    crossOrigin="anonymous"
                                                    alt={item.product_name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { 
                                                        e.currentTarget.style.display = 'none'; 
                                                        const placeholder = document.createElement('div');
                                                        placeholder.className = 'text-[8px] font-mono font-bold text-neutral-300';
                                                        placeholder.innerText = 'SNEAKER';
                                                        e.currentTarget.parentElement.appendChild(placeholder);
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-[8px] font-mono font-bold text-neutral-300">SNEAKER</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-neutral-900 truncate">{item.product_name}</p>
                                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                                                {[item.brand, item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono font-medium text-gray-500">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono font-medium text-neutral-800">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-mono font-bold text-black">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Price Summary Breakdown */}
            <div className="flex justify-end">
                <div className="w-80 space-y-2 border-t border-black/[0.08] pt-4 text-xs font-semibold text-gray-500">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold font-mono text-black">{formatPrice(order.subtotal || (order.total_amount - (order.tax || 0)))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Sales Tax (8%)</span>
                        <span className="font-bold font-mono text-black">{formatPrice(order.tax || 0)}</span>
                    </div>
                    
                    {/* Optional Shipping info */}
                    <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="font-bold font-mono text-black">Free</span>
                    </div>

                    {/* Cash payment channel change breakdown details */}
                    {order.payment_method === 'cash' && order.cash_received !== undefined && (
                        <div className="space-y-1.5 bg-neutral-50 border border-black/[0.03] p-2.5 rounded-lg my-2">
                            <div className="flex justify-between text-[11px]">
                                <span>Cash Tendered</span>
                                <span className="font-bold font-mono text-neutral-800">{formatPrice(order.cash_received)}</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-black/10 pt-1.5 mt-1.5 text-[11px]">
                                <span>Change Due</span>
                                <span className="font-bold font-mono text-emerald-600">{formatPrice(order.change_amount || 0)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between border-t border-black/10 pt-3 items-baseline">
                        <span className="text-xs font-black uppercase tracking-wider text-black">Grand Total</span>
                        <span className="text-lg font-black font-mono text-[#f97316]">
                            {formatPrice(order.total_amount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Thank you note */}
            <div className="mt-12 text-center border-t border-dashed border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Thank you for shopping at TOS-PEAK</p>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">This is a system generated print-friendly invoice statement.</p>
            </div>
        </div>
    );
}
