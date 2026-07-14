import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OrderSuccessPage() {
  const { orderNumber, date, paymentMethod, amount } = usePage().props;

  return (
    <StorefrontLayout>
      <Head title="Order Confirmed | TOS-PEAK" />

      <div className="mx-auto w-full max-w-[600px] px-5 py-16 text-center select-none">
        
        {/* Animated Checkmark Circle */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm relative">
          <span className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-75"></span>
          <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
            <Check size={22} className="stroke-[3]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Order Successfully Placed
        </h1>
        <p className="text-xs text-neutral-400 font-semibold max-w-sm mx-auto leading-relaxed mb-10">
          Thank you for shopping at TOS-PEAK. Your pair has been secured in stock and registered in our central fulfillment ledger.
        </p>

        {/* Order Details Panel */}
        <div className="bg-[#F9FAFB] rounded-2xl border border-black/5 p-6 mb-8 text-left space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block border-b border-black/5 pb-2">
            Invoice details
          </span>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-neutral-500">Order Number</span>
              <span className="font-bold text-neutral-900 font-mono text-right">{orderNumber || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-neutral-500">Purchase Date</span>
              <span className="font-bold text-neutral-900 text-right">{date || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-neutral-500">Payment Method</span>
              <span className="font-bold text-neutral-900 uppercase tracking-wide text-right">
                {paymentMethod === 'qr' ? 'KHQR Scan' : paymentMethod || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-black/5">
              <span className="font-black text-neutral-900">Total Paid</span>
              <span className="font-black text-neutral-950 text-sm">
                {amount ? formatPrice(parseFloat(amount)) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={route('storefront.index')}
            className="flex h-11 items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-wider px-6 transition duration-300 shadow-sm active:scale-95 no-underline hover:no-underline"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>

          <Link
            href={route('customer.dashboard', { tab: 'orders' })}
            className="flex h-11 items-center justify-center gap-2 bg-white border border-black/10 hover:border-black text-neutral-700 hover:text-black rounded-xl text-xs font-black uppercase tracking-wider px-6 transition duration-300 active:scale-95 no-underline hover:no-underline"
          >
            <span>View Order History</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </StorefrontLayout>
  );
}
