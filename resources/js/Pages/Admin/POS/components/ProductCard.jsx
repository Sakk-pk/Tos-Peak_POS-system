import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Heart, ShoppingBag } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import LoginModal from '@/Components/LoginModal';

export default function ProductCard({
    product,
    formatPrice,
    isStorefront = false,
    onAddToCart,        // (product) => void — called by POSPage to add to cart bag
}) {
    const { auth, wishlist_ids = [] } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const isCustomer = isLoggedIn && (!auth.user.role || auth.user.role === 'Customer');

    // Modal state
    const [loginModal, setLoginModal] = useState({ open: false, message: '' });

    // Wishlist state — check localStorage or fallback to props
    const [isWishlisted, setIsWishlisted] = useState(() => {
        if (!isLoggedIn) return false;
        try {
            const currentWishlist = JSON.parse(localStorage.getItem('wishlist_items')) || [];
            return currentWishlist.some(item => item.id === product.id);
        } catch {
            return wishlist_ids.includes(product.id);
        }
    });
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            setIsWishlisted(false);
            return;
        }
        try {
            const currentWishlist = JSON.parse(localStorage.getItem('wishlist_items')) || [];
            const exists = currentWishlist.some(item => item.id === product.id);
            setIsWishlisted(exists || wishlist_ids.includes(product.id));
        } catch {
            setIsWishlisted(wishlist_ids.includes(product.id));
        }
    }, [wishlist_ids, product.id, isLoggedIn]);

    const imageSrc = product.image
        ? (product.image.startsWith('http') || product.image.startsWith('/'))
            ? product.image
            : `/storage/${product.image}`
        : '/images/placeholder-product.png';

    const isOutOfStock = product.stock <= 0;

    // Consistent rating derived from product ID
    const rating = useMemo(() => {
        const score = 4.3 + ((product.id * 13) % 8) * 0.1;
        const reviewsCount = 45 + ((product.id * 89) % 2000);
        return { score: score.toFixed(1), count: reviewsCount.toLocaleString() };
    }, [product.id]);

    const originalPrice = useMemo(() => product.price * 1.25, [product.price]);

    // ── Handle heart / wishlist toggle ──────────────────────────────────────
    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setWishlistLoading(true);

        if (isLoggedIn) {
            fetch(route('wishlist.toggle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ product_id: product.id })
            })
            .then(res => res.json())
            .then(data => {
                const currentWishlist = JSON.parse(localStorage.getItem('wishlist_items')) || [];
                const exists = currentWishlist.some(item => item.id === product.id);
                let newWishlist;
                if (data.wishlisted) {
                    setIsWishlisted(true);
                    if (!exists) {
                        newWishlist = [...currentWishlist, {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            brand: product.brand || { name: 'Nike' },
                            category: product.category || 'Running',
                            stock: product.stock !== undefined ? product.stock : 10,
                            rating: 4.5,
                            colors: ['#000000', '#D1D5DB', '#EF4444', '#3B82F6'],
                            sizes: ['8', '9', '10', '11']
                        }];
                        localStorage.setItem('wishlist_items', JSON.stringify(newWishlist));
                    }
                    window.dispatchEvent(new CustomEvent('toast', {
                        detail: { message: `Added "${product.name}" to Wishlist.`, type: 'success' }
                    }));
                } else {
                    setIsWishlisted(false);
                    newWishlist = currentWishlist.filter(item => item.id !== product.id);
                    localStorage.setItem('wishlist_items', JSON.stringify(newWishlist));
                    window.dispatchEvent(new CustomEvent('toast', {
                        detail: { message: `Removed "${product.name}" from Wishlist.`, type: 'info' }
                    }));
                }
                window.dispatchEvent(new Event('storage'));
                
                // Reload Inertia props to sync wishlist count in header and other components!
                router.reload();
            })
            .catch(() => {
                // local fallback
                const currentWishlist = JSON.parse(localStorage.getItem('wishlist_items')) || [];
                const exists = currentWishlist.some(item => item.id === product.id);
                let newWishlist;
                if (exists) {
                    newWishlist = currentWishlist.filter(item => item.id !== product.id);
                    setIsWishlisted(false);
                } else {
                    newWishlist = [...currentWishlist, product];
                    setIsWishlisted(true);
                }
                localStorage.setItem('wishlist_items', JSON.stringify(newWishlist));
                window.dispatchEvent(new Event('storage'));
            })
            .finally(() => {
                setWishlistLoading(false);
            });
        } else {
            setLoginModal({
                open: true,
                message: 'Please sign in to save products to your boutique favorites.'
            });
            setWishlistLoading(false);
        }
    };

    // ── Handle "Quick Add" to Cart ───────────────────
    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isStorefront) {
            try {
                const currentCart = JSON.parse(localStorage.getItem('pos_cart')) || [];
                const defaultSize = product.size || 'Unisex';
                const defaultColor = product.color || 'Standard';
                
                const existingIndex = currentCart.findIndex(
                    item => item.id === product.id && 
                            item.size === defaultSize && 
                            item.color === defaultColor
                );

                let updatedCart;
                if (existingIndex > -1) {
                    updatedCart = [...currentCart];
                    updatedCart[existingIndex].quantity += 1;
                } else {
                    updatedCart = [
                        ...currentCart,
                        {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            size: defaultSize,
                            color: defaultColor,
                            quantity: 1,
                            stock: product.stock !== undefined ? product.stock : 10,
                            category: product.category || '',
                            brand: product.brand || 'TOS-PEAK',
                        }
                    ];
                }
                localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new CustomEvent('toast', {
                    detail: { message: `Added "${product.name}" to Bag.`, type: 'success' }
                }));
            } catch (_) {
                // fallback
            }
            return;
        }

        // POS (admin) mode: directly add via callback
        onAddToCart?.(product);
    };

    return (
        <>
            <Link
                href={route(isStorefront ? 'storefront.show' : 'point-of-sale.show', product.id)}
                className={`group flex w-full flex-col justify-between rounded-none transition-all duration-300 no-underline hover:no-underline cursor-pointer ${
                    isOutOfStock ? 'opacity-70' : ''
                }`}
            >
                <div>
                    {/* ── Image & Overlay Actions ── */}
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-none bg-[#EAEAE9] transition duration-300 p-4">
                        <img
                            src={imageSrc}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 scale-[0.82] group-hover:scale-[0.88] group-hover:rotate-2"
                            onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.png';
                            }}
                        />

                        {/* Top Left Badges */}
                        <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                            {isOutOfStock ? (
                                <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                                    Sold Out
                                </span>
                            ) : (
                                <>
                                    {product.id % 2 === 0 && (
                                        <span className="bg-black text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                                            NEW
                                        </span>
                                    )}
                                    <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                                        -20%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Wishlist Heart — only show in storefront mode */}
                        {isStorefront && (
                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:text-rose-500 hover:scale-105 active:scale-95 transition z-10 disabled:opacity-60"
                            >
                                <Heart
                                    className={`h-4 w-4 transition-colors ${
                                        isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500'
                                    }`}
                                />
                            </button>
                        )}

                        {/* Bottom overlay: "Select size" or POS "Add" */}
                        {!isStorefront && (
                            <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 z-10 transition-all duration-300 lg:opacity-0 lg:translate-y-3 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
                                {isOutOfStock ? (
                                    <div
                                        className="w-[90%] bg-gray-300 text-white text-[12px] font-bold py-3.5 px-5 rounded-full flex items-center justify-center cursor-not-allowed shadow-sm"
                                    >
                                        Sold Out
                                    </div>
                                ) : (
                                    <div
                                        className="w-[90%] bg-[#1a1a1a] hover:bg-black text-white text-[11px] font-bold py-3 px-4 rounded-full flex items-center justify-between shadow-lg transition active:scale-[0.97]"
                                    >
                                        <span className="text-[11.5px] font-semibold text-white/90 whitespace-nowrap">Select size</span>
                                        <Plus className="h-3.5 w-3.5 stroke-[2.5] text-white/90 shrink-0" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Product Info ── */}
                    <div className="mt-3 flex items-start justify-between gap-2 px-1">
                        <div className="min-w-0 flex-1">
                            <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-[0.16em] block truncate">
                                {typeof product.brand === 'object' ? (product.brand?.name || 'TOS-PEAK') : (product.brand || 'TOS-PEAK')}
                            </span>
                            <h3 className="text-[11.5px] font-extrabold leading-tight text-gray-950 mt-0.5 line-clamp-2">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-[9.5px] text-gray-500 font-bold">
                                <span className="text-amber-500">★</span>
                                <span>{rating.score}</span>
                                <span className="text-gray-400 font-semibold">({rating.count})</span>
                            </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end">
                            <span className="text-[12.5px] font-black text-gray-950 leading-none">
                                {formatPrice(product.price)}
                            </span>
                            <span className="text-[9.5px] font-semibold text-gray-400 line-through mt-0.5">
                                {formatPrice(originalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Login Modal — shown when guest tries a protected action */}
            <LoginModal
                isOpen={loginModal.open}
                onClose={() => setLoginModal({ open: false, message: '' })}
                message={loginModal.message}
                redirectTo={typeof window !== 'undefined' ? window.location.href : '/'}
            />
        </>
    );
}
