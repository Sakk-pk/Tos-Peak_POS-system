import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import ProductCard from '@/Pages/Admin/POS/components/ProductCard';
import { Heart, Search, ChevronDown, SlidersHorizontal, Sparkles, X, ShoppingBag } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function Wishlist({ products }) {
    const [wishlistItems, setWishlistItems] = useState(products || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFiltersAlert, setShowFiltersAlert] = useState(false);

    const loadWishlist = () => {
        if (products) {
            setWishlistItems(products);
            return;
        }
        const stored = localStorage.getItem('wishlist_items');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setWishlistItems(parsed || []);
            } catch (e) {
                setWishlistItems([]);
            }
        } else {
            setWishlistItems([]);
        }
    };

    // Load wishlist items on client mount & listen for storage updates
    useEffect(() => {
        if (products) {
            setWishlistItems(products);
        } else {
            loadWishlist();
            window.addEventListener('storage', loadWishlist);
            const interval = setInterval(loadWishlist, 1000); // Polling backup
            return () => {
                window.removeEventListener('storage', loadWishlist);
                clearInterval(interval);
            };
        }
    }, [products]);

    // Filter and Sort Logic
    const processedItems = useMemo(() => {
        let items = [...wishlistItems];

        // Search
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            items = items.filter(item => {
                const brandName = typeof item.brand === 'object' ? (item.brand?.name || '') : (item.brand || '');
                const categoryName = typeof item.category === 'object' ? (item.category?.name || '') : (item.category || '');
                return item.name.toLowerCase().includes(query) ||
                    brandName.toLowerCase().includes(query) ||
                    categoryName.toLowerCase().includes(query);
            });
        }

        // Sort
        if (sortBy === 'Price: Low to High') {
            items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            items.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Name') {
            items.sort((a, b) => a.name.localeCompare(b.name));
        }

        return items;
    }, [wishlistItems, searchTerm, sortBy]);

    return (
        <StorefrontLayout title="My Wishlist — TOS-PEAK">
            <Head title="My Wishlist — TOS-PEAK" />

            <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 pt-3 pb-12 animate-[fadeIn_0.5s_ease-out]">
                
                {/* ── Header Area ── */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950">My Wishlist</h1>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="wishlist-search"
                                name="wishlist-search"
                                type="search"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search favorites..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex h-10 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-black"
                            >
                                <span>Sort By: {sortBy}</span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                            {showSortDropdown && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                                    <div className="absolute right-0 top-full z-40 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                                        {['Newest', 'Price: Low to High', 'Price: High to Low', 'Name'].map(option => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSortBy(option);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`flex w-full items-center px-4 py-2.5 text-left text-xs font-semibold transition hover:bg-gray-50 ${
                                                    sortBy === option ? 'bg-black text-white hover:bg-black' : 'text-gray-700'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Filters Trigger */}
                        <button
                            onClick={() => {
                                setShowFiltersAlert(true);
                                setTimeout(() => setShowFiltersAlert(false), 3000);
                            }}
                            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-black"
                        >
                            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {showFiltersAlert && (
                    <div className="mb-6 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-widest animate-bounce">
                        💡 Premium filters overlay is under design (UI only)
                    </div>
                )}

                {/* ── Wishlist Grid ── */}
                {processedItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
                        {processedItems.map(item => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                formatPrice={formatPrice}
                                isStorefront={true}
                            />
                        ))}
                    </div>
                ) : (
                    /* ── Empty State Design ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.5s_ease-out]">
                        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
                            <Heart className="h-10 w-10 text-rose-500 animate-[pulse_2s_infinite]" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Your wishlist is empty</h2>
                        <p className="mt-2 text-sm text-gray-400 max-w-sm leading-relaxed">
                            Save your favorite shoes to view them here.
                        </p>
                        <Link
                            href={route('storefront.index')}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-black/10 hover:bg-neutral-800 active:scale-95 transition"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
