import { Minus, Plus, Trash2 } from 'lucide-react';

export function PosProductCard({ product, accentClass, formatPrice, onAdd }) {
    const stockTone = product.stock > 12
        ? 'bg-emerald-500/90 text-white'
        : product.stock > 4
            ? 'bg-amber-500/90 text-white'
            : 'bg-rose-500/90 text-white';

    return (
        <button
            type="button"
            onClick={() => onAdd(product)}
            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(0,0,0,0.16)] hover:border-black/10"
            aria-label={`Add ${product.name} to current sale`}
        >
            <div className={`relative ${accentClass} flex aspect-[4/5] items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 z-10" />

                <img
                    src={product.image || '/images/placeholder-product.png'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(event) => {
                        event.currentTarget.src = '/images/placeholder-product.png';
                    }}
                />

                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between z-20">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] shadow-lg ${stockTone}`}>
                        {product.stock <= 4 ? 'Low Stock' : 'Available'}
                    </span>

                    <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black backdrop-blur-md">
                        Add +
                    </span>
                </div>

                <span className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md z-20">
                    #{String(product.id).padStart(2, '0')}
                </span>
            </div>

            <div className="space-y-3 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-[15px] font-bold leading-5 text-black group-hover:text-black/90">
                        {product.name}
                    </p>
                    <p className="shrink-0 text-[18px] font-black tracking-tight text-black tabular-nums">
                        {formatPrice(product.price)}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/60">
                        {product.categoryName}
                    </p>

                    <span className="text-xs font-semibold text-black/45">
                        {product.stock} pcs
                    </span>
                </div>
            </div>
        </button>
    );
}

export function PosSaleItemRow({ item, formatPrice, onQuantityChange, onDiscountChange, onRemove }) {
    const lineTotal = Math.max(0, (item.product.price * item.quantity) - item.lineDiscount);

    const stockTone = item.product.stock > 12
        ? 'text-emerald-700 bg-emerald-100'
        : item.product.stock > 4
            ? 'text-amber-700 bg-amber-100'
            : 'text-rose-700 bg-rose-100';

    return (
        <div className="rounded-3xl border border-black/6 bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]">
            <div className="flex items-center gap-4">
                <img
                    src={item.product.image || '/images/placeholder-product.png'}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-black/5"
                    onError={(event) => {
                        event.currentTarget.src = '/images/placeholder-product.png';
                    }}
                />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-black">
                        {item.product.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-black/55">
                            {formatPrice(item.product.price)} each
                        </span>

                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stockTone}`}>
                            {item.product.stock} left
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(item.product.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:scale-105 hover:bg-red-100"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.lineDiscount.toFixed(2)}
                    onChange={(event) => onDiscountChange(item.product.id, Number(event.target.value))}
                    className="h-11 rounded-2xl border border-black/8 bg-neutral-50 px-4 text-sm font-semibold focus:border-black/20 focus:bg-white outline-none"
                    placeholder="Discount"
                />

                <div className="inline-flex h-11 overflow-hidden rounded-2xl border border-black/8 bg-neutral-50">
                    <button
                        type="button"
                        onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-11 flex items-center justify-center hover:bg-black/5"
                    >
                        <Minus className="h-4 w-4" />
                    </button>

                    <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(event) => {
                            const next = Number(event.target.value);
                            onQuantityChange(item.product.id, Number.isFinite(next) ? next : 1);
                        }}
                        className="w-14 border-x border-black/8 bg-transparent text-center text-sm font-bold outline-none"
                    />

                    <button
                        type="button"
                        onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                        className="w-11 flex items-center justify-center hover:bg-black/5"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-sm font-medium text-black/55">Line Total</span>
                <span className="text-lg font-black text-black tabular-nums">
                    {formatPrice(lineTotal)}
                </span>
            </div>
        </div>
    );
}

export function PosToastStack({ toasts, onDismiss }) {
    return (
        <div className="pointer-events-none fixed right-5 top-5 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
            {toasts.map((toast) => {
                const toneClasses = {
                    neutral: 'bg-white text-black border-black/10',
                    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                    warning: 'bg-amber-50 text-amber-900 border-amber-200',
                }[toast.tone];

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto rounded-3xl border px-4 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${toneClasses}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold">{toast.title}</p>
                                <p className="mt-1 text-xs opacity-75 leading-5">
                                    {toast.description}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onDismiss(toast.id)}
                                className="rounded-full p-2 hover:bg-black/5"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}