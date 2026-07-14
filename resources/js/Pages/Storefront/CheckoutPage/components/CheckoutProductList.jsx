import React from 'react';

export default function CheckoutProductList({ cartItems, formatPrice }) {
  return (
    <div className="pt-2 max-h-[450px] overflow-y-auto pr-1 scrollbar-none space-y-4">
      {cartItems.map((item) => {
        const img = item.image
          ? (item.image.startsWith('http') || item.image.startsWith('/'))
            ? item.image
            : `/storage/${item.image}`
          : '/images/placeholder-product.png';

        return (
          <div key={item.id} className="flex border border-neutral-200 bg-white rounded-none overflow-hidden h-36">
            {/* Product Image Section */}
            <div className="w-1/4 bg-[#F6F6F6] shrink-0 flex items-center justify-center p-2.5 border-r border-neutral-100">
              <img 
                src={img} 
                alt={item.name} 
                className="h-full w-full object-contain mix-blend-multiply" 
                onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }}
              />
            </div>

            {/* Details Section */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              {/* Upper Section */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-neutral-950 leading-snug">
                    {item.name}
                  </h3>
                  <div className="text-[10px] text-neutral-400 font-bold space-y-0.5 mt-1 uppercase tracking-wide">
                    <p>{item.color || 'Standard'}</p>
                    <p>Size: {item.size} &bull; Qty: {item.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Lower Section */}
              <div className="flex justify-end items-end">
                <span className="text-xs font-black text-neutral-950 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
