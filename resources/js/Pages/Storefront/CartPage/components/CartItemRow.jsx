import React from 'react';
import { Trash2, Heart, Plus, Minus } from 'lucide-react';

export default function CartItemRow({ 
  item, 
  handleRemoveItem, 
  handleWishlistToggle, 
  handleUpdateQuantity, 
  formatPrice 
}) {
  const img = item.image
    ? (item.image.startsWith('http') || item.image.startsWith('/'))
      ? item.image
      : `/storage/${item.image}`
    : '/images/placeholder-product.png';

  return (
    <div className="flex border border-neutral-200 bg-white rounded-none overflow-hidden h-40">
      
      {/* Product Image Section */}
      <div className="w-1/4 sm:w-1/5 bg-[#F6F6F6] shrink-0 flex items-center justify-center p-2.5 border-r border-neutral-100">
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
            <h3 className="text-xs sm:text-sm font-extrabold text-neutral-955 text-neutral-950 leading-snug">
              {item.name}
            </h3>
            <div className="text-[10px] text-neutral-400 font-bold space-y-0.5 mt-1 uppercase tracking-wide">
              <p>{item.color || 'Standard'}</p>
              <p>Size: {item.size}</p>
            </div>
            
            {item.stock <= 5 && item.stock > 0 && (
              <p className="text-[9px] font-black text-[#F97316] uppercase tracking-wider mt-1.5 animate-pulse">
                Low in stock
              </p>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-neutral-400 hover:text-black transition p-1 hover:bg-neutral-50"
              title="Delete Item"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => handleWishlistToggle(item.id)}
              className="text-neutral-400 hover:text-black transition p-1 hover:bg-neutral-50"
              title="Add to Wishlist"
            >
              <Heart size={15} />
            </button>
          </div>
        </div>

        {/* Lower Section */}
        <div className="flex justify-between items-end">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 select-none">
              <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center bg-white border border-neutral-200 text-neutral-500 hover:text-black transition"
              >
                  <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-neutral-800">
                  {item.quantity}
              </span>
              <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="flex h-7 w-7 items-center justify-center bg-white border border-neutral-200 text-neutral-500 hover:text-black transition disabled:opacity-40"
              >
                  <Plus className="h-3 w-3" />
              </button>
          </div>

          {/* Item Subtotal Price */}
          <span className="text-xs font-black text-neutral-955 text-neutral-950 shrink-0">
            {formatPrice(item.price * item.quantity)}
          </span>

        </div>

      </div>

    </div>
  );
}
