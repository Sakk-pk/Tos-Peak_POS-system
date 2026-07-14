import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { X, ArrowRight } from 'lucide-react';

export default function AddToBagSuccessModal({
  isOpen,
  onClose,
  addedProduct,
  cartItems,
  formatPrice,
  relatedProducts = [],
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key close handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !addedProduct) return null;

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const mainImageSrc = addedProduct.image
    ? (addedProduct.image.startsWith('http') || addedProduct.image.startsWith('/'))
      ? addedProduct.image
      : `/storage/${addedProduct.image}`
    : '/images/placeholder-product.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none text-[#111111] p-4 sm:p-6 lg:p-8">
      
      {/* Semi-transparent dark overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white w-full max-w-[760px] rounded-none shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto z-10 transition-transform duration-300 scale-100 animate-[scale-in_0.2s_ease-out] border border-black/5"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-8 py-5">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
            SUCCESSFULLY ADDED TO BAG!
          </h2>
          <button 
            onClick={onClose}
            className="border border-neutral-200 hover:border-black text-black transition h-11 w-11 flex items-center justify-center rounded-none shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Product Summary (md:col-span-6) */}
            <div className="md:col-span-6 flex gap-4 pr-0 md:pr-6">
              <div className="h-32 w-32 shrink-0 bg-[#F6F6F6] rounded-none border border-black/5 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src={mainImageSrc} 
                  alt={addedProduct.name} 
                  className="h-full w-full object-contain mix-blend-multiply" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-neutral-950 leading-tight">
                  {addedProduct.name}
                </h3>
                <span className="text-xs font-black text-neutral-950 block mt-1">
                  {formatPrice(addedProduct.price)}
                </span>
                
                <div className="text-[11px] text-neutral-500 font-semibold space-y-1 mt-4">
                  <p>Color: {addedProduct.color}</p>
                  <p>Size: {addedProduct.size}</p>
                  <p>Quantity: {addedProduct.quantity}</p>
                </div>
              </div>
            </div>

            {/* Vertical Divider Line */}
            <div className="hidden md:block w-px bg-black/[0.06] self-stretch" />

            {/* Right Column: Your Bag (md:col-span-5) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-6 pl-0 md:pl-2">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-950">
                  Your Bag
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500 font-semibold">
                    <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 font-semibold">
                    <span>Total Product Cost:</span>
                    <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 font-semibold">
                    <span>Total Delivery Cost:</span>
                    <span className="font-black text-neutral-900 uppercase">Free</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-neutral-950 border-t border-black/5 pt-2.5 mt-2.5">
                    <span>Total:</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-semibold leading-relaxed mt-1">
                    (inclusive of tax)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={route('cart.index')}
                  onClick={onClose}
                  className="relative w-full flex h-12 items-center justify-center bg-black hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-wider transition active:scale-[0.98] rounded-none px-6 no-underline hover:no-underline"
                >
                  <span>View bag</span>
                  <ArrowRight className="absolute right-6 h-4 w-4" />
                </Link>

                <button
                  onClick={onClose}
                  className="relative w-full flex h-12 items-center justify-center bg-white border border-neutral-300 hover:border-black text-black text-xs font-black uppercase tracking-wider transition active:scale-[0.98] rounded-none px-6"
                >
                  <span>Continue shopping</span>
                  <ArrowRight className="absolute right-6 h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Recommended Section: You May Also Like */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                These will match perfectly
              </h3>
              
              {/* Horizontal Scrollable Carousel */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {relatedProducts.map((p) => {
                  const relImg = p.image
                    ? (p.image.startsWith('http') || p.image.startsWith('/'))
                      ? p.image
                      : `/storage/${p.image}`
                    : '/images/placeholder-product.png';

                  return (
                    <Link 
                      key={p.id}
                      href={route('storefront.show', p.id)}
                      onClick={onClose}
                      className="group flex flex-col justify-between transition duration-300 w-[150px] shrink-0 no-underline hover:no-underline"
                    >
                      <div>
                        <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6] p-2 rounded-none flex items-center justify-center mb-2">
                          <img
                            src={relImg}
                            alt={p.name}
                            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 scale-[0.82] group-hover:scale-[0.88]"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.png';
                            }}
                          />
                        </div>
                        
                        <span className="text-[11px] font-black text-neutral-950 block">
                          {formatPrice(p.price)}
                        </span>
                        
                        <h4 className="text-[11px] font-extrabold text-neutral-950 truncate mt-1 leading-tight">
                          {p.name}
                        </h4>
                        
                        <span className="text-[9px] font-bold text-neutral-400 block mt-0.5">
                          {p.brand?.name || 'TOS-PEAK'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
