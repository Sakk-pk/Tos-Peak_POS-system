import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, LogIn } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Cart({
    items = [],
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onCloseDrawer,
    formatPrice,
    isStorefront = false,
    isLoggedIn = true,
}) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-white text-[#111111] select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <ShoppingBag className="h-5 w-5 text-black" />
                    <span className="text-sm font-black uppercase tracking-widest text-black">Shopping Bag</span>
                </div>
                <div className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-neutral-500">
                    {totalItems} {totalItems === 1 ? 'Pair' : 'Pairs'}
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4 scrollbar-none">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-20 text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200/50 mb-1 animate-pulse">
                            <ShoppingBag className="h-6 w-6 text-neutral-400" />
                        </div>
                        <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Your bag is empty</h3>
                        <p className="max-w-[200px] text-xs leading-relaxed text-neutral-400 font-semibold">
                            Explore our premium sneaker collections to add pairs.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {items.map((item) => {
                            const imageSrc = item.image
                                ? (item.image.startsWith('http') || item.image.startsWith('/'))
                                    ? item.image
                                    : `/storage/${item.image}`
                                : '/images/placeholder-product.png';

                            const itemSubtotal = item.price * item.quantity;

                            return (
                                <div key={item.id} className="flex items-start justify-between gap-3 border-b border-black/[0.04] pb-3.5">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-[#F6F6F6] p-2 flex items-center justify-center">
                                            <img
                                                src={imageSrc}
                                                alt={item.name}
                                                className="h-full w-full object-contain mix-blend-multiply"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder-product.png';
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">
                                                {item.brand || 'TOS-PEAK'}
                                            </span>
                                            <h4 className="truncate text-xs font-extrabold text-neutral-950 mt-0.5 leading-tight">{item.name}</h4>
                                            <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                                                US {item.size} &bull; {item.color}
                                            </p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xs font-black text-neutral-950">
                                                    {formatPrice(item.price)}
                                                </span>
                                                {item.quantity > 1 && (
                                                    <span className="text-[10px] text-neutral-400 font-bold">
                                                        Subtotal: {formatPrice(itemSubtotal)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 gap-2">
                                        {/* Quantity Stepper */}
                                        <div className="flex items-center rounded-lg border border-black/5 bg-neutral-50 p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-white border border-black/5 text-neutral-500 shadow-sm transition hover:text-black"
                                            >
                                                <Minus className="h-2.5 w-2.5" />
                                            </button>
                                            <span className="w-6 text-center text-[10px] font-bold text-neutral-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-white border border-black/5 text-neutral-500 shadow-sm transition hover:text-black disabled:opacity-40"
                                            >
                                                <Plus className="h-2.5 w-2.5" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.id)}
                                            className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition border border-black/5"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="border-t border-black/[0.06] pt-4 mt-auto space-y-4 px-1">
                <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Bag Subtotal</span>
                    <span className="text-base font-black text-neutral-950">{formatPrice(subtotal)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {isStorefront && !isLoggedIn ? (
                        <Link
                            href={route('login')}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-black uppercase tracking-wider text-white transition hover:bg-black/90 active:scale-[0.98]"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Sign in to Checkout</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={onCheckout}
                            disabled={items.length === 0}
                            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                items.length === 0
                                    ? 'bg-neutral-250 text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-neutral-900 active:scale-[0.98] shadow-sm'
                            }`}
                        >
                            <span>Continue to Checkout</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onCloseDrawer}
                        className="w-full flex h-11 items-center justify-center bg-white border border-black/10 hover:border-black text-gray-700 hover:text-black rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-[0.98]"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
