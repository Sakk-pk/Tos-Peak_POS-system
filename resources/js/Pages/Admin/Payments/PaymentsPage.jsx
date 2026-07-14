import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Search, CreditCard, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import Modal from '@/Components/Modal';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PaymentsPage({ payments = {}, filters = {} }) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [receiptOrder, setReceiptOrder] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.get(route('payments.index'), { search: searchQuery }, {
      preserveState: true,
      replace: true,
    });
  };

  const items = payments.data || [];
  const links = payments.links || [];

  return (
    <AdminLayout navbarTitle="Payments History" contentClassName="px-8 py-6 space-y-6">
      <Head title="Payments History | Admin" />

      {/* Header */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div>
          <h2 className="text-black font-black font-display uppercase tracking-wider text-base">
            Payments Log
          </h2>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Track and audit transaction histories across all checkout channels.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trans ID, order, sender..."
              className="h-10 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-xs font-semibold text-black outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-900 active:scale-95 duration-200 transition shadow-sm"
          >
            Search
          </button>
        </form>
      </section>

      {/* Main Table */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
              <CreditCard size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900">No transactions found</p>
            <p className="text-xs text-gray-400 mt-1">Adjust search parameters or verify system checkouts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-gray-50/50 text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                    <th className="pb-3.5 pt-3.5 pr-2 pl-4">Payment ID / Trans Ref</th>
                    <th className="pb-3.5 pt-3.5 px-2">Order Ref</th>
                    <th className="pb-3.5 pt-3.5 px-2">Customer</th>
                    <th className="pb-3.5 pt-3.5 px-2">Method</th>
                    <th className="pb-3.5 pt-3.5 px-2">Amount</th>
                    <th className="pb-3.5 pt-3.5 px-2">Status</th>
                    <th className="pb-3.5 pt-3.5 px-2">Paid Date</th>
                    <th className="pb-3.5 pt-3.5 text-right pr-4">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {items.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/20 transition-all duration-200">
                      <td className="py-4 pr-2 pl-4 font-mono font-bold text-black">
                        {payment.transaction_id || `TXN-${String(payment.id).padStart(5, '0')}`}
                      </td>
                      <td className="py-4 px-2 font-mono text-gray-700">
                        {payment.order ? payment.order.order_number : 'N/A'}
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-bold text-gray-950">{payment.order?.customer_name || 'Walk-in'}</span>
                        {payment.order?.customer_email && (
                          <span className="block text-[10px] text-gray-450 font-semibold mt-0.5">{payment.order.customer_email}</span>
                        )}
                      </td>
                      <td className="py-4 px-2 uppercase font-mono font-bold text-gray-500">{payment.order?.payment_method || 'QR'}</td>
                      <td className="py-4 px-2 font-bold text-black font-mono">{formatPrice(payment.amount)}</td>
                      <td className="py-4 px-2">
                        <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg border tracking-wider ${
                          payment.payment_status === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : payment.payment_status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-250'
                              : 'bg-rose-50 text-rose-700 border-rose-250'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-gray-400">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => setReceiptOrder(payment.order)}
                          className="h-7 w-7 rounded-xl border border-black/10 flex items-center justify-center text-gray-500 hover:border-black hover:text-black hover:bg-gray-50 transition-all duration-200 shadow-sm"
                          title="View Receipt"
                        >
                          <FileText size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Laravel pagination links */}
            {links.length > 3 && (
              <div className="flex justify-center items-center gap-1.5 pt-4 border-t border-black/[0.06]">
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    disabled={!link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`h-8 px-3 rounded-xl border text-[10px] font-black font-display uppercase tracking-wider transition-all duration-200 flex items-center justify-center ${
                      link.active
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'border-black/10 hover:bg-gray-50 bg-white text-gray-500'
                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal Receipt Popup */}
      <Modal show={!!receiptOrder} onClose={() => setReceiptOrder(null)} maxWidth="sm">
        {receiptOrder && (
          <div className="p-6 space-y-5 text-center text-[#111111] bg-white border border-black/[0.06] rounded-3xl shadow-2xl animate-scale-in">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black font-display uppercase tracking-wider text-gray-900">Payment Receipt</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase mt-1 tracking-wider">Order Ref: <span className="font-bold text-gray-700 font-mono">{receiptOrder.order_number}</span></p>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/20 p-4 text-left text-xs text-gray-500 space-y-3">
              <div className="flex justify-between border-b border-black/[0.06] pb-2 font-medium">
                <span className="font-semibold text-gray-500">Transaction Date</span>
                <span className="font-mono text-gray-700 font-bold">{new Date(receiptOrder.created_at).toLocaleString()}</span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
                <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-wider block mb-1">Products</span>
                {receiptOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-700 font-medium">
                    <span>
                      {item.product_name} <span className="text-gray-450 text-[9px] font-semibold">({item.size} / {item.color})</span> <span className="text-[10px] text-gray-400 font-bold font-mono">x{item.quantity}</span>
                    </span>
                    <span className="font-mono font-bold text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Break down */}
              <div className="space-y-1 text-[11px] font-medium">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-mono text-black font-bold">{formatPrice(receiptOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span className="font-mono text-black font-bold">{formatPrice(receiptOrder.tax)}</span></div>
                <div className="flex justify-between font-bold text-black border-t border-black/[0.06] pt-2 mt-2 text-sm items-baseline">
                  <span className="uppercase font-bold tracking-wider text-xs text-gray-750">Grand Total</span>
                  <span className="font-mono text-base text-[#f97316] font-black">{formatPrice(receiptOrder.total_amount)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-dashed border-black/15 text-[11px] font-medium">
                <div className="flex justify-between"><span>Payment Method</span><span className="uppercase font-bold text-gray-900">{receiptOrder.payment_method}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="uppercase font-black text-emerald-700 tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{receiptOrder.payment_status}</span></div>
              </div>
            </div>

            <button
              onClick={() => setReceiptOrder(null)}
              className="w-full py-2.5 bg-black text-white hover:bg-neutral-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
            >
              Close Receipt
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
