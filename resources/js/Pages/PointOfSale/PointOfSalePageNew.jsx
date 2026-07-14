import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import { Head } from '@inertiajs/react';
import {
    CreditCard,
    Search,
    ShoppingCart,
    Wallet,
    X,
} from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
    PosProductCard,
    PosSaleItemRow,
    PosToastStack,
} from './PointOfSaleComponents';

const DEFAULT_CUSTOMERS = [
    { id: 'walk-in', name: 'Walk-in customer' },
    { id: 'c-1', name: 'Jamie Carter' },
    { id: 'c-2', name: 'Noah Lee' },
];

const ORDER_TYPE_OPTIONS = [
    { value: 'dine-in', label: 'Dine' },
    { value: 'takeaway', label: 'Take' },
    { value: 'delivery', label: 'Delv' },
];

const PAYMENT_METHOD_OPTIONS = ['cash', 'card', 'split', 'refund', 'tip'];

const ACCENT_CLASSES = [
    'bg-[#ef233c]',
    'bg-[#e5e5e5]',
    'bg-[#a7d936]',
    'bg-[#f59e0b]',
    'bg-[#dbeafe]',
    'bg-[#d1fae5]',
    'bg-[#e9d5ff]',
    'bg-[#fef3c7]',
];

function toNumber(value) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function normalizeProduct(product) {
    const image = product.image
        ? (product.image.startsWith('http') || product.image.startsWith('/'))
            ? product.image
            : `/storage/${product.image}`
        : '/images/placeholder-product.png';

    return {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        price: toNumber(product.price),
        stock: Math.max(0, Math.floor(toNumber(product.stock))),
        image,
        categoryName: product.category?.name ?? product.category_name ?? 'Casual',
    };
}

function OptionButton({ active, onClick, children, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg text-[11px] font-semibold transition ${active ? 'bg-black text-white shadow-sm' : 'bg-[#efefef] text-black/70 hover:bg-[#e4e4e4]'} ${className}`}
        >
            {children}
        </button>
    );
}

function SummaryRow({ label, value, strong = false, className = '' }) {
    return (
        <div className={`flex items-center justify-between ${strong ? 'text-base font-bold text-black' : 'text-sm text-black/65'} ${className}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

export default function PointOfSalePageNew({ products: productsProp, categories = [] }) {
    const products = useMemo(() => {
        const raw = Array.isArray(productsProp) ? productsProp : productsProp?.data ?? [];
        return raw.map(normalizeProduct).filter((item) => item.stock > 0);
    }, [productsProp]);

    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(DEFAULT_CUSTOMERS[0].id);
    const [newCustomer, setNewCustomer] = useState('');
    const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
    const [orderType, setOrderType] = useState('dine-in');
    const [taxRate, setTaxRate] = useState(8);
    const [orderDiscount, setOrderDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [tipAmount, setTipAmount] = useState(0);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const searchInputRef = useRef(null);
    const toastIdRef = useRef(1);

    const showToast = (title, description, tone = 'neutral') => {
        const id = toastIdRef.current++;
        setToasts((items) => [...items, { id, title, description, tone }]);
        window.setTimeout(() => {
            setToasts((items) => items.filter((item) => item.id !== id));
        }, 2400);
    };

    const categoryPills = useMemo(() => {
        const byPage = categories.map((item) => String(item.name));
        const byProducts = Array.from(new Set(products.map((item) => item.categoryName)));
        return ['All', ...Array.from(new Set([...byPage, ...byProducts]))];
    }, [categories, products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const byCategory = activeCategory === 'All' || product.categoryName === activeCategory;
            const bySearch = !deferredSearch
                || product.name.toLowerCase().includes(deferredSearch)
                || product.categoryName.toLowerCase().includes(deferredSearch)
                || product.description.toLowerCase().includes(deferredSearch);

            return byCategory && bySearch;
        });
    }, [products, activeCategory, deferredSearch]);

    const suggestions = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
    const totalItemsInCart = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
    const orderTypeLabel = useMemo(
        () => ORDER_TYPE_OPTIONS.find((option) => option.value === orderType)?.label ?? 'Dine',
        [orderType],
    );
    const activeCustomer = useMemo(
        () => customers.find((customer) => customer.id === selectedCustomer) ?? customers[0],
        [customers, selectedCustomer],
    );

    const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [cart]);
    const lineDiscount = useMemo(() => cart.reduce((sum, line) => sum + line.lineDiscount, 0), [cart]);
    const discount = clamp(orderDiscount + lineDiscount, 0, subtotal);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * taxRate / 100;
    const total = Math.max(0, taxable + tax + tipAmount);

    const addToCart = (product) => {
        if (product.stock <= 0) {
            showToast('Out of stock', `${product.name} is not available.`, 'warning');
            return;
        }

        setCart((items) => {
            const existing = items.find((item) => item.product.id === product.id);
            if (existing) {
                return items.map((item) => (
                    item.product.id === product.id
                        ? { ...item, quantity: clamp(item.quantity + 1, 1, item.product.stock) }
                        : item
                ));
            }
            return [...items, { product, quantity: 1, lineDiscount: 0 }];
        });

        setSearch('');
        setSuggestionIndex(0);
        showToast('Added to cart', `${product.name} added to current sale.`, 'success');
    };

    const changeQuantity = (productId, quantity) => {
        setCart((items) => {
            const current = items.find((item) => item.product.id === productId);
            if (!current) {
                return items;
            }

            if (quantity <= 0) {
                return items.filter((item) => item.product.id !== productId);
            }

            const next = clamp(quantity, 1, current.product.stock);
            return items.map((item) => (item.product.id === productId ? { ...item, quantity: next } : item));
        });
    };

    const changeLineDiscount = (productId, discountValue) => {
        setCart((items) => items.map((item) => {
            if (item.product.id !== productId) {
                return item;
            }

            const maximum = item.product.price * item.quantity;
            return { ...item, lineDiscount: clamp(Number.isFinite(discountValue) ? discountValue : 0, 0, maximum) };
        }));
    };

    const removeItem = (productId) => {
        setCart((items) => items.filter((item) => item.product.id !== productId));
    };

    const addCustomer = () => {
        const name = newCustomer.trim();
        if (!name) {
            showToast('Customer name required', 'Enter a customer name first.', 'warning');
            return;
        }

        const id = `c-${Date.now()}`;
        setCustomers((items) => [{ id, name }, ...items]);
        setSelectedCustomer(id);
        setNewCustomer('');
        showToast('Customer added', `${name} added for this sale.`, 'success');
    };

    const checkout = () => {
        if (cart.length === 0) {
            showToast('Cart is empty', 'Tap a product to begin checkout.', 'warning');
            return;
        }

        setPaymentOpen(false);
        setCart([]);
        setOrderDiscount(0);
        setTipAmount(0);
        showToast('Sale completed', 'Receipt has been prepared.', 'success');
    };

    const handleSearchKeyDown = (event) => {
        if (suggestions.length === 0) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSuggestionIndex((index) => (index + 1) % suggestions.length);
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSuggestionIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const selected = suggestions[suggestionIndex] ?? suggestions[0];
            if (selected) {
                addToCart(selected);
            }
        }
    };

    useEffect(() => {
        const onKeyDown = (event) => {
            const target = event.target;
            const inInput = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'));

            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            if (!inInput && event.key === '/') {
                event.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                setPaymentOpen(true);
                return;
            }

            if (event.altKey && event.key === '1') {
                event.preventDefault();
                setOrderType('dine-in');
            }
            if (event.altKey && event.key === '2') {
                event.preventDefault();
                setOrderType('takeaway');
            }
            if (event.altKey && event.key === '3') {
                event.preventDefault();
                setOrderType('delivery');
            }

            if (event.key === 'Escape' && paymentOpen) {
                setPaymentOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [paymentOpen]);

    return (
        <AdminLayout>
            <Head title="Point of Sale" />

            <PosToastStack toasts={toasts} onDismiss={(id) => setToasts((items) => items.filter((item) => item.id !== id))} />

            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(245,245,244,0.95)_38%,_rgba(229,231,235,0.92)_100%)] text-zinc-900">
                <div className="pointer-events-none absolute left-[-12rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-black/[0.03] blur-3xl" />
                <div className="pointer-events-none absolute right-[-8rem] top-[14rem] h-[22rem] w-[22rem] rounded-full bg-amber-300/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-10rem] left-[18%] h-[26rem] w-[26rem] rounded-full bg-white/60 blur-3xl" />

                <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                    <section className="min-w-0 flex-1 overflow-y-auto">
                        <div className="mb-6 overflow-hidden rounded-[32px] border border-black/8 bg-white/90 shadow-[0_22px_54px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex flex-col gap-5 border-b border-black/8 px-6 py-6 xl:flex-row xl:items-end xl:justify-between xl:px-8 xl:py-8">
                                <div className="max-w-3xl space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-3 py-1 text-white">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                            Live retail workspace
                                        </span>
                                        <span className="rounded-full border border-black/10 bg-white px-3 py-1">{filteredProducts.length} products visible</span>
                                        <span className="rounded-full border border-black/10 bg-white px-3 py-1">{categoryPills.length - 1} categories</span>
                                        <span className="rounded-full border border-black/10 bg-white px-3 py-1">{orderTypeLabel}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-zinc-950 sm:text-5xl xl:text-6xl">
                                            Point of Sale
                                        </h1>
                                        <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                                            A clean in-store selling surface built for quick scanning, tactile checkout, and a premium retail feel.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
                                            <kbd className="rounded-md border border-black/10 bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">⌘</kbd>
                                            K Search
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
                                            <kbd className="rounded-md border border-black/10 bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">/</kbd>
                                            Focus search
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
                                            <kbd className="rounded-md border border-black/10 bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">⌘</kbd>
                                            Enter checkout
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:w-[470px] xl:grid-cols-2">
                                    <div className="rounded-3xl border border-black/8 bg-zinc-50 px-4 py-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">Cart items</p>
                                        <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{totalItemsInCart}</p>
                                    </div>
                                    <div className="rounded-3xl border border-black/8 bg-zinc-50 px-4 py-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">Customer</p>
                                        <p className="mt-2 truncate text-2xl font-bold tracking-tight text-zinc-950">{activeCustomer?.name}</p>
                                    </div>
                                    <div className="rounded-3xl border border-black/8 bg-zinc-50 px-4 py-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">Order type</p>
                                        <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{orderTypeLabel}</p>
                                    </div>
                                    <div className="rounded-3xl border border-black/8 bg-zinc-950 px-4 py-4 text-white shadow-[0_14px_30px_rgba(0,0,0,0.15)]">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Tax rate</p>
                                        <p className="mt-2 text-3xl font-black tracking-tight">{taxRate.toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-black/8 bg-[#fafafa] px-6 py-5 xl:px-8">
                                <div className="relative max-w-5xl">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setSuggestionIndex(0);
                                        }}
                                        onKeyDown={handleSearchKeyDown}
                                        placeholder="Search products, categories, or names"
                                        className="h-14 w-full rounded-full border border-zinc-200 bg-white pl-12 pr-4 text-sm font-medium shadow-[0_10px_24px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200"
                                        aria-label="Search products"
                                    />

                                    {search.trim() ? (
                                        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
                                            <div className="max-h-72 overflow-y-auto p-1.5">
                                                {suggestions.length > 0 ? suggestions.map((product, index) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => addToCart(product)}
                                                        onMouseEnter={() => setSuggestionIndex(index)}
                                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${index === suggestionIndex ? 'bg-zinc-950 text-white' : 'hover:bg-black/5'}`}
                                                    >
                                                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold">{product.name}</p>
                                                            <p className={`truncate text-xs ${index === suggestionIndex ? 'text-white/70' : 'text-black/50'}`}>{product.categoryName}</p>
                                                        </div>
                                                        <p className="text-sm font-bold tabular-nums">{formatPrice(product.price)}</p>
                                                    </button>
                                                )) : (
                                                    <p className="px-3 py-4 text-sm text-black/55">No products found.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-5 flex gap-2 overflow-x-auto pb-1 pt-1">
                                    {categoryPills.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setActiveCategory(category)}
                                            className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition ${activeCategory === category ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950'} ${category === 'All' ? 'pl-5 pr-5' : ''}`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 xl:p-8">
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4 2xl:gap-6">
                                        {filteredProducts.map((product, index) => (
                                            <PosProductCard
                                                key={product.id}
                                                product={product}
                                                accentClass={ACCENT_CLASSES[index % ACCENT_CLASSES.length]}
                                                formatPrice={formatPrice}
                                                onAdd={addToCart}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/12 bg-zinc-50 text-center">
                                        <ShoppingCart className="h-9 w-9 text-black/28" />
                                        <p className="mt-4 text-base font-semibold text-zinc-800">No products match the current search</p>
                                        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Try a broader keyword or switch categories to reveal more inventory.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="sticky top-6 flex h-[calc(100vh-3rem)] w-[404px] shrink-0 flex-col overflow-hidden rounded-[36px] border border-black/8 bg-white/95 shadow-[0_30px_70px_-18px_rgba(15,23,42,0.18)] backdrop-blur">
                        <div className="border-b border-black/8 bg-[linear-gradient(180deg,_rgba(250,250,249,0.98),_rgba(255,255,255,0.96))] px-6 py-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/40">Checkout rail</p>
                                    <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-zinc-950">Current Sale</h2>
                                    <p className="mt-2 text-sm leading-6 text-zinc-500">A compact checkout view with quick customer and pricing controls.</p>
                                </div>
                                <span className="rounded-full border border-black/8 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700">{totalItemsInCart} items</span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-2.5">
                                <div className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">Subtotal</p>
                                    <p className="mt-1 text-lg font-black tracking-tight text-zinc-950">{formatPrice(subtotal)}</p>
                                </div>
                                <div className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">Total</p>
                                    <p className="mt-1 text-lg font-black tracking-tight text-zinc-950">{formatPrice(total)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-b border-black/8 bg-[#fcfcfb] px-5 py-5">
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">Customer</p>
                                <select
                                    value={selectedCustomer}
                                    onChange={(event) => setSelectedCustomer(event.target.value)}
                                    className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5"
                                    aria-label="Select customer"
                                >
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">Order type</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {ORDER_TYPE_OPTIONS.map((option) => (
                                        <OptionButton
                                            key={option.value}
                                            active={orderType === option.value}
                                            onClick={() => setOrderType(option.value)}
                                            className="h-11 rounded-2xl text-xs uppercase tracking-[0.14em]"
                                        >
                                            {option.label}
                                        </OptionButton>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">Quick add customer</p>
                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                    <input
                                        value={newCustomer}
                                        onChange={(event) => setNewCustomer(event.target.value)}
                                        placeholder="Add customer"
                                        className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-2 focus:ring-black/5"
                                        aria-label="Add customer"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomer}
                                        className="h-11 rounded-2xl border border-black/10 bg-zinc-950 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:scale-[1.01]"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            {cart.length > 0 ? (
                                <div className="space-y-3">
                                    {cart.map((line) => (
                                        <PosSaleItemRow
                                            key={line.product.id}
                                            item={line}
                                            formatPrice={formatPrice}
                                            onQuantityChange={changeQuantity}
                                            onDiscountChange={changeLineDiscount}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/12 bg-zinc-50 text-center">
                                    <ShoppingCart className="h-10 w-10 text-black/20" />
                                    <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-700">Cart is empty.</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-500">Tap a product to start building the order.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto border-t border-black/8 bg-[linear-gradient(180deg,_rgba(250,250,249,0.92),_rgba(255,255,255,0.98))] px-5 py-5 backdrop-blur">
                            <div className="mb-3 grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={orderDiscount}
                                    onChange={(event) => setOrderDiscount(toNumber(event.target.value))}
                                    className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-xs font-semibold outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-2 focus:ring-black/5"
                                    aria-label="Order discount"
                                    placeholder="Discount"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={taxRate}
                                    onChange={(event) => setTaxRate(toNumber(event.target.value))}
                                    className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-xs font-semibold outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-2 focus:ring-black/5"
                                    aria-label="Tax rate"
                                    placeholder="Tax %"
                                />
                            </div>

                            <div className="space-y-2 rounded-[28px] border border-black/8 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                                <SummaryRow
                                    label="Subtotal"
                                    value={formatPrice(subtotal)}
                                    className="font-medium text-zinc-600"
                                />
                                <SummaryRow
                                    label={`Tax (${taxRate.toFixed(0)}%)`}
                                    value={formatPrice(tax)}
                                    className="font-medium text-zinc-600"
                                />
                                <SummaryRow
                                    label="Discount"
                                    value={`-${formatPrice(discount)}`}
                                    className="font-medium text-zinc-600"
                                />
                                <SummaryRow
                                    label="Tip"
                                    value={formatPrice(tipAmount)}
                                    className="font-medium text-zinc-600"
                                />
                                <div className="border-t border-black/8 pt-3">
                                    <SummaryRow
                                        label="Total"
                                        value={formatPrice(total)}
                                        strong
                                        className="text-xl"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPaymentOpen(true)}
                                className="mt-4 inline-flex h-14 w-full items-center justify-center gap-3 rounded-[20px] bg-zinc-950 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
                                aria-label="Checkout"
                            >
                                <CreditCard className="h-4 w-4" />
                                Process Checkout
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <Modal show={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="2xl">
                <div className="max-h-[88vh] overflow-y-auto bg-white">
                    <div className="flex items-center justify-between border-b border-black/8 bg-[linear-gradient(180deg,_rgba(250,250,249,0.98),_rgba(255,255,255,0.96))] px-6 py-5">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">Finalize sale</p>
                            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-black">Payment & Receipt</h3>
                            <p className="mt-1 text-sm text-black/55">Review the receipt preview and confirm the payment method.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPaymentOpen(false)}
                            className="rounded-xl p-2 text-black/60 hover:bg-black/5 hover:text-black"
                            aria-label="Close payment"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                            <div className="grid gap-4 px-6 py-5 lg:grid-cols-2">
                        <section className="space-y-4 rounded-[24px] border border-black/8 bg-[#fafafa] p-4 shadow-sm">
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">Payment Method</h4>
                                <p className="mt-1 text-sm text-black/55">Choose the tender type for this sale.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {PAYMENT_METHOD_OPTIONS.map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setPaymentMethod(method)}
                                        className={`h-11 rounded-2xl border text-xs font-semibold uppercase tracking-[0.12em] transition ${paymentMethod === method ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]' : 'border-black/10 bg-white text-black/70 hover:bg-black/5'}`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'tip' ? (
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={tipAmount}
                                    onChange={(event) => setTipAmount(toNumber(event.target.value))}
                                    className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm font-semibold outline-none focus:border-black/20 focus:ring-2 focus:ring-black/5"
                                    placeholder="Tip amount"
                                />
                            ) : null}

                            {paymentMethod === 'refund' ? (
                                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                                    Refund mode selected. Confirm to create a refund receipt.
                                </p>
                            ) : null}
                        </section>

                        <section className="rounded-[24px] border border-black/8 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">Receipt Preview</h4>
                            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                                {cart.map((line) => (
                                    <div key={line.product.id} className="flex items-start justify-between rounded-2xl border border-black/8 px-3 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-black">{line.product.name}</p>
                                            <p className="text-xs text-black/55">{line.quantity} x {formatPrice(line.product.price)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-black">{formatPrice((line.product.price * line.quantity) - line.lineDiscount)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 space-y-1.5 border-t border-black/8 pt-3">
                                <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                                <SummaryRow label="Discount" value={`-${formatPrice(discount)}`} />
                                <SummaryRow label="Tax" value={formatPrice(tax)} />
                                <SummaryRow label="Tip" value={formatPrice(tipAmount)} />
                                <SummaryRow label="Total" value={formatPrice(total)} strong />
                            </div>
                        </section>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-black/8 bg-[#fcfcfb] px-6 py-4">
                        <button
                            type="button"
                            onClick={() => setPaymentOpen(false)}
                            className="h-11 rounded-2xl border border-black/10 px-4 text-sm font-semibold text-black/70 hover:bg-black/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={checkout}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
                        >
                            <Wallet className="h-4 w-4" />
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
