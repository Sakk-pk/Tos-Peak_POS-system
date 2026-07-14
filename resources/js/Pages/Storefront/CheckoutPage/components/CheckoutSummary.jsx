import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Loader2, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import CheckoutProductList from './CheckoutProductList';

export default function CheckoutSummary({
  subtotal,
  tax,
  grandTotal,
  totalItems,
  checkoutLoading,
  handlePlaceOrderClick,
  formatPrice,
  cartItems,
  appliedVoucher,
  setAppliedVoucher,
  discountAmount,
  onOpenVouchersDrawer
}) {
  return (
    <div className="lg:sticky lg:top-[90px] space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm space-y-6 text-[#111111] select-none">
        
        <div className="flex justify-between items-baseline border-b border-black/[0.06] pb-3.5">
          <h2 className="text-[36px] font-black uppercase tracking-tight text-neutral-955 text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
            YOUR ORDER
          </h2>
          <Link 
            href={route('cart.index')} 
            className="text-xs font-bold underline uppercase tracking-wider text-neutral-950 hover:text-neutral-600 transition"
          >
            Edit
          </Link>
        </div>

        {/* Subtotals & totals */}
        <div className="space-y-3.5 text-[16px] text-neutral-500 font-semibold">
          <div className="flex justify-between">
            <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            <span className="text-neutral-955 text-neutral-950 font-bold">{formatPrice(subtotal)}</span>
          </div>

          {appliedVoucher && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Voucher Discount ({appliedVoucher.name})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Sales Tax</span>
            <span className="text-neutral-955 text-neutral-950 font-bold">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="text-neutral-955 text-neutral-950 font-black">Free</span>
          </div>
          <div className="flex justify-between text-[32px] font-black text-neutral-950 border-t border-black/5 pt-4 mt-4 items-baseline">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Discounts row selection */}
        <div className="border-t border-b border-neutral-200 py-3.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-950">
          {appliedVoucher ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-emerald-600 font-bold">Applied: {appliedVoucher.name}</span>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setAppliedVoucher(null);
                }} 
                className="text-red-500 hover:text-red-700 transition"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenVouchersDrawer}
              className="flex justify-between items-center w-full hover:bg-neutral-50 p-1 outline-none text-left"
            >
              <span className="underline">Use active loyalty voucher</span>
              <ChevronRight size={13} className="text-neutral-400" />
            </button>
          )}
        </div>

        {/* Compact Payment Information Section */}
        <div className="border-t border-neutral-200 pt-5 pb-1">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-100 shrink-0 mt-0.5">
              <QrCode size={18} className="stroke-[2]" />
            </div>
            <div className="space-y-1">
              <span className="block text-[16px] font-semibold text-neutral-500 uppercase tracking-wider">
                Payment
              </span>
              <span className="block text-[18px] font-bold text-neutral-950 leading-tight">
                Bakong KHQR
              </span>
              <p className="text-[14px] text-gray-500 font-medium leading-relaxed mt-0.5">
                Secure payment via Bakong KHQR. A QR code will be generated after you click "Place Order."
              </p>
            </div>
          </div>
        </div>

        {/* Place Order main CTA */}
        <button
          type="button"
          onClick={handlePlaceOrderClick}
          disabled={checkoutLoading}
          className="relative w-full flex h-14 items-center justify-center bg-black hover:bg-neutral-900 text-white text-[18px] font-black uppercase tracking-wider transition active:scale-[0.98] rounded-none px-6 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Place Order</span>
          )}
          <ArrowRight className="absolute right-6 h-5 w-5" />
        </button>

        {/* Product List within Order Summary */}
        <CheckoutProductList cartItems={cartItems} formatPrice={formatPrice} />

        {/* Trust banner */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-neutral-400 font-semibold pt-1 border-t border-black/5">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span>Secure Checkout &bull; SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
