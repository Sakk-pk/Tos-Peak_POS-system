import React from 'react';
import { Link } from '@inertiajs/react';
import { Trash2, Heart, Plus, Minus } from 'lucide-react';

export default function CartItemRow({ 
  item, 
  handleRemoveItem, 
  handleWishlistToggle, 
  handleUpdateQuantity, 
  formatPrice 
}) {
  const img = item.image
    ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`)
    : '/images/placeholder-product.png';

  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-neutral-200 bg-white rounded-none transition hover:border-neutral-300">
      
      {/* Left: Product Image & Details (Clickable to detail page) */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link 
          href={route('storefront.show', item.id)} 
          className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-50 border border-neutral-100 shrink-0 flex items-center justify-center p-2 rounded-none hover:border-neutral-400 transition"
        >
          <img 
            src={img} 
            alt={item.name} 
            className="max-h-full max-w-full object-contain mix-blend-multiply" 
            onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link 
            href={route('storefront.show', item.id)} 
            className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate leading-tight hover:underline block no-underline"
          >
            {item.name}
          </Link>
          
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium mt-1">
            {item.color && <span>{item.color}</span>}
            {item.color && item.size && <span>•</span>}
            {item.size && <span>Size {item.size}</span>}
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 mt-3 select-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateQuantity(item.id, item.quantity - 1);
              }}
              className="flex h-6 w-6 items-center justify-center border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black transition"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateQuantity(item.id, item.quantity + 1);
              }}
              disabled={item.stock && item.quantity >= item.stock}
              className="flex h-6 w-6 items-center justify-center border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black transition disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Actions & Price */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWishlistToggle(item.id)}
            className="text-neutral-400 hover:text-red-500 transition p-1"
            title="Save to Wishlist"
          >
            <Heart size={15} />
          </button>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="text-neutral-400 hover:text-black transition p-1"
            title="Remove Item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <span className="text-sm font-black text-neutral-950">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>

    </div>
  );
}

