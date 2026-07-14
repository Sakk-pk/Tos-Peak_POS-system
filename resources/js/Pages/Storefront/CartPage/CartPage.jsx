import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import LoginModal from '@/Components/LoginModal';
import CartItemRow from './components/CartItemRow';
import { useCart } from '@/Hooks/useCart';
import { 
  ShoppingBag, ArrowRight, ArrowLeft 
} from 'lucide-react';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartPage() {
  const { auth } = usePage().props;
  const isLoggedIn = !!auth?.user;

  const { cartItems, removeFromCart, updateQuantity, cartCount, cartSubtotal } = useCart();
  const [loginModal, setLoginModal] = useState({ open: false, message: '' });

  // Calculations
  const tax = useMemo(() => {
    return cartSubtotal * 0.08;
  }, [cartSubtotal]);

  const grandTotal = useMemo(() => {
    return cartSubtotal + tax;
  }, [cartSubtotal, tax]);

  // Quantity handlers
  const handleUpdateQuantity = (productId, newQty) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    if (newQty > item.stock) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: `Only ${item.stock} items are in stock for this variant.`, type: 'error' }
      }));
      return;
    }

    updateQuantity(productId, newQty);
  };

  const handleRemoveItem = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    removeFromCart(productId);
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: `Removed "${item?.name || 'sneaker'}" from Bag.`, type: 'info' }
    }));
  };

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      setLoginModal({ open: true, message: 'Please sign in to complete your checkout' });
      return;
    }
    router.visit(route('checkout.index'));
  };

  const handleWishlistToggle = async (productId) => {
    if (!isLoggedIn) {
      setLoginModal({ open: true, message: 'Sign in to save this product to your wishlist' });
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      await fetch(route('wishlist.toggle'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
        body:    JSON.stringify({ product_id: productId }),
      });
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Updated wishlist selection.', type: 'success' }
      }));
    } catch (_) {}
  };

  return (
    <StorefrontLayout>
      <Head title="Shopping Bag | TOS-PEAK" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 pt-3 pb-10 select-none text-[#111111] animate-fade-in">
        
        {/* Breadcrumb back */}
        <Link 
          href={route('storefront.index')}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black mb-8 transition no-underline hover:no-underline"
        >
          <ArrowLeft size={13} /> Continue Shopping
        </Link>

        {/* Title */}
        <div className="pb-6 mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 flex items-baseline gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
            YOUR BAG
            <span className="text-sm font-semibold text-neutral-400 tracking-normal capitalize">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="text-[11px] text-neutral-400 font-semibold mt-1">
            Items in your bag are not reserved — check out now to make them yours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Col: Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 rounded-none border border-dashed border-black/10 flex flex-col items-center justify-center animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-none bg-neutral-100 border border-neutral-200/50 mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">Your bag is empty</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
                  Explore our boutique sneaker collections, customize size selections, and find the perfect match.
                </p>
                <Link
                  href={route('storefront.index')}
                  className="mt-6 inline-flex h-11 items-center justify-center bg-black hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-wider px-6 rounded-none transition shadow-sm active:scale-95 no-underline hover:no-underline"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    handleRemoveItem={handleRemoveItem}
                    handleWishlistToggle={handleWishlistToggle}
                    handleUpdateQuantity={handleUpdateQuantity}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Summary card */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 rounded-none shadow-sm space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                ORDER SUMMARY
              </h2>
              
              <div className="space-y-3.5 text-xs text-neutral-600 font-semibold uppercase tracking-wider">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-950 font-extrabold">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-neutral-950 font-extrabold">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-extrabold">FREE</span>
                </div>
                <div className="border-t border-neutral-200 pt-4 flex justify-between text-sm font-black text-neutral-950">
                  <span className="tracking-widest">GRAND TOTAL</span>
                  <span className="text-base">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={handleCheckoutClick}
                className="w-full flex h-12 items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-widest rounded-none transition active:scale-[0.98]"
              >
                PROCEED TO CHECKOUT <ArrowRight size={14} />
              </button>

              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center leading-relaxed">
                Security guaranteed. Scan Bakong KHQR for express authentication.
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Login requirement Modal */}
      <LoginModal 
        isOpen={loginModal.open}
        onClose={() => setLoginModal({ open: false, message: '' })}
        message={loginModal.message}
      />
    </StorefrontLayout>
  );
}
