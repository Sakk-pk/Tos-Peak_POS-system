import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import LoginModal from '@/Components/LoginModal';
import AddToBagSuccessModal from './components/AddToBagSuccessModal';
import { ArrowLeft, ChevronLeft, ChevronRight, Ruler, ShieldCheck, Plus, Minus, Heart } from 'lucide-react';
import { Toast } from '@/Components/Toast';
import { useCart } from '@/Hooks/useCart';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function ProductDetail({ product, variants = [], allSizes = [], relatedProducts = [], isStorefront = false }) {
    const headTitle    = `${product.name} - TOS-PEAK`;
    const backRoute    = isStorefront ? 'storefront.index' : 'point-of-sale.index';
    const showRoute    = isStorefront ? 'storefront.show'  : 'point-of-sale.show';

    // ── Auth & Wishlist ──
    const { auth, wishlist_ids = [] } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const isCustomer = isLoggedIn && (!auth.user.role || auth.user.role === 'Customer');

    const [loginModal, setLoginModal]       = useState({ open: false, message: '' });
    const [isWishlisted, setIsWishlisted]   = useState(() => isLoggedIn && wishlist_ids.includes(product.id));
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // ── Local Storage Cart Hook ──
    const { cartItems, addToCart } = useCart();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [addedProduct, setAddedProduct] = useState(null);

    // ── Filter Unique Colors for Swatches ──
    const colorSwatches = useMemo(() => {
        const seen = new Set();
        const swatches = [];
        variants.forEach(v => {
            if (v.color_id && !seen.has(v.color_id)) {
                seen.add(v.color_id);
                swatches.push(v);
            }
        });
        if (swatches.length === 0) {
            swatches.push(product);
        }
        return swatches;
    }, [variants, product]);

    const [selectedColorId, setSelectedColorId] = useState(product.color_id);

    // Filter variants of the currently selected color
    const variantsOfSelectedColor = useMemo(() => {
        return variants.filter(v => v.color_id === selectedColorId);
    }, [variants, selectedColorId]);

    // Map size IDs to variant objects of the active color
    const variantBySize = useMemo(() => {
        const map = {};
        variantsOfSelectedColor.forEach(v => {
            if (v.size_id) {
                map[v.size_id] = v;
            }
        });
        return map;
    }, [variantsOfSelectedColor]);

    // Set initial size
    const initialSelectedSizeId = useMemo(() => {
        const matched = variantsOfSelectedColor.find(v => v.stock > 0);
        return matched ? matched.size_id : (variantsOfSelectedColor[0]?.size_id || null);
    }, [variantsOfSelectedColor]);

    const [selectedSizeId, setSelectedSizeId] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Auto-reset quantity to 1 when size or color changes
    useEffect(() => {
        setQuantity(1);
    }, [selectedSizeId, selectedColorId]);

    // Auto-select size when color changes
    useEffect(() => {
        setSelectedSizeId(initialSelectedSizeId);
    }, [selectedColorId, initialSelectedSizeId]);

    // Sync wishlist state reactively
    useEffect(() => {
        setIsWishlisted(isLoggedIn && wishlist_ids.includes(product.id));
    }, [wishlist_ids, product.id, isLoggedIn]);

    const [toast, setToast] = useState(null);

    // The active product variant based on selected color and size
    const activeProduct = useMemo(() => {
        const match = variantsOfSelectedColor.find(v => v.size_id === selectedSizeId);
        return match || variantsOfSelectedColor[0] || product;
    }, [variantsOfSelectedColor, selectedSizeId, product]);

    // ── Image Gallery Setup ──
    const mainImageSrc = activeProduct.image
        ? (activeProduct.image.startsWith('http') || activeProduct.image.startsWith('/'))
            ? activeProduct.image
            : `/storage/${activeProduct.image}`
        : '/images/placeholder-product.png';

    // Mock different angles of the sneaker for a boutique gallery feel
    const galleryImages = useMemo(() => {
        return [
            { id: 1, src: mainImageSrc, style: {} },
            { id: 2, src: mainImageSrc, style: { transform: 'scaleX(-1) rotate(-8deg)' } },
            { id: 3, src: mainImageSrc, style: { filter: 'brightness(0.95)', transform: 'rotate(15deg) scale(0.9)' } },
            { id: 4, src: mainImageSrc, style: { filter: 'contrast(1.05)', transform: 'scale(1.05) translate(2px, -2px)' } },
            { id: 5, src: mainImageSrc, style: { transform: 'rotate(-10deg) scaleX(-1)' } },
            { id: 6, src: mainImageSrc, style: { transform: 'scale(0.85) rotate(5deg)' } },
            { id: 7, src: mainImageSrc, style: { transform: 'rotate(180deg) scaleX(-1)' } },
            { id: 8, src: mainImageSrc, style: { filter: 'sepia(0.1) saturate(1.1)', transform: 'scale(0.95) rotate(-3deg)' } }
        ];
    }, [mainImageSrc]);

    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    const handlePrevImage = () => {
        setActiveGalleryIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setActiveGalleryIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        setActiveGalleryIndex(0);
    }, [mainImageSrc]);

    // ── Cart Action ──
    const handleAddToCart = () => {
        if (activeProduct.stock <= 0) {
            setToast({ message: 'This size variant is currently out of stock.', type: 'error' });
            return;
        }

        const cartItem = {
            id:       activeProduct.id,
            name:     activeProduct.name,
            price:    parseFloat(activeProduct.price),
            stock:    parseInt(activeProduct.stock, 10),
            image:    activeProduct.image || '',
            brand:    activeProduct.brand?.name  || product.brand?.name  || 'TOS-PEAK',
            color:    activeProduct.color?.name  || product.color?.name  || 'Default Color',
            size:     activeProduct.size?.name   || allSizes.find(s => s.id === selectedSizeId)?.name || 'Default Size',
            quantity: quantity,
        };

        let isQtyValid = true;
        const existingIndex = cartItems.findIndex(item => item.id === activeProduct.id);
        if (existingIndex > -1) {
            const newQty = cartItems[existingIndex].quantity + quantity;
            if (newQty > activeProduct.stock) {
                setToast({ message: `Cannot add more. Only ${activeProduct.stock} items are in stock.`, type: 'error' });
                isQtyValid = false;
                return;
            }
        }

        addToCart(activeProduct, quantity, cartItem.size, cartItem.color);

        if (isStorefront) {
            setTimeout(() => {
                if (isQtyValid) {
                    setAddedProduct(cartItem);
                    setShowSuccessModal(true);
                    window.dispatchEvent(new Event('storage'));
                }
            }, 0);
        } else {
            router.visit(route(backRoute, { success: `Successfully added ${activeProduct.name} (${activeProduct.size?.name || 'Default Size'}) to bag.` }));
        }
    };

    const handleAddRelatedToBag = (p) => {
        const defaultSize = p.size || 'Unisex';
        const defaultColor = p.color || 'Standard';

        const cartItem = {
            id:       p.id,
            name:     p.name,
            price:    parseFloat(p.price),
            stock:    p.stock !== undefined ? parseInt(p.stock, 10) : 10,
            image:    p.image || '',
            brand:    p.brand?.name || 'TOS-PEAK',
            color:    defaultColor,
            size:     defaultSize,
            quantity: 1,
        };

        addToCart(p, 1, defaultSize, defaultColor);

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: `Added "${p.name}" to Bag.`, type: 'success' }
        }));
    };

    // ── Wishlist toggle (guard for guests) ──
    const handleWishlistToggle = async () => {
        if (!isLoggedIn) {
            setLoginModal({ open: true, message: 'Sign in to save this product to your wishlist' });
            return;
        }
        if (!isCustomer) return;

        setWishlistLoading(true);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res  = await fetch(route('wishlist.toggle'), {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
                body:    JSON.stringify({ product_id: product.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setIsWishlisted(data.wishlisted);
                
                // Update local storage so that client-side wishlist page updates immediately
                const currentWishlist = JSON.parse(localStorage.getItem('wishlist_items')) || [];
                const exists = currentWishlist.some(item => item.id === product.id);
                let newWishlist;
                if (data.wishlisted) {
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
                    newWishlist = currentWishlist.filter(item => item.id !== product.id);
                    localStorage.setItem('wishlist_items', JSON.stringify(newWishlist));
                    window.dispatchEvent(new CustomEvent('toast', {
                        detail: { message: `Removed "${product.name}" from Wishlist.`, type: 'info' }
                    }));
                }
                window.dispatchEvent(new Event('storage'));
                
                // Reload Inertia props to sync wishlist count in header and other components!
                router.reload();
            }
        } catch (_) {} finally {
            setWishlistLoading(false);
        }
    };

    const Layout = isStorefront ? StorefrontLayout : AdminLayout;
    const layoutProps = isStorefront ? {} : { navbarTitle: headTitle, contentClassName: 'px-8 py-6' };

    return (
        <Layout {...layoutProps}>
            <Head title={headTitle} />

            <div className={isStorefront ? 'mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 py-8' : ''}>

                {/* Back button */}
                <div className="mb-4">
                    <Link
                        href={route(backRoute)}
                        className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Catalog
                    </Link>
                </div>

                {/* Configurator Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-none border border-black/5 p-6 shadow-sm">
                    
                    {/* Left Side: Gallery Layout */}
                    <div className="lg:col-span-7 flex gap-3 h-[460px]">
                        
                        {/* Vertical Gallery Thumbnail Column */}
                        <div className="flex flex-col gap-1.5 shrink-0 h-full overflow-y-auto scrollbar-none">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveGalleryIndex(idx)}
                                    className={`h-[48px] w-[40px] rounded-none overflow-hidden transition relative bg-[#F6F6F6] border shrink-0 ${
                                        activeGalleryIndex === idx
                                            ? 'border-black ring-1 ring-black/5'
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <div className="h-full w-full flex items-center justify-center p-1 bg-[#EAEAE9]">
                                        <img
                                            src={img.src}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="h-full w-full object-contain mix-blend-multiply"
                                            style={img.style}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Main Showcase Panel */}
                        <div className="flex-1 relative h-[460px] rounded-none overflow-hidden bg-[#F6F6F6] border border-gray-100 flex items-center justify-center">
                            
                            {/* Interactive Main Showcase */}
                            <div className="relative h-full w-full flex items-center justify-center">
                                <img
                                    src={galleryImages[activeGalleryIndex].src}
                                    alt={product.name}
                                    className="h-full w-full object-contain mix-blend-multiply transition-all duration-300 scale-[0.80]"
                                    style={galleryImages[activeGalleryIndex].style}
                                />
                            </div>

                            {/* Floating Highly Rated Badge */}
                            <div className="absolute left-6 top-6 bg-white/95 backdrop-blur-sm rounded-none px-4.5 py-2 border border-black/5 shadow-sm text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="text-gray-955 text-neutral-950 font-black">★</span> Highly Rated
                            </div>

                            {/* Navigation Control Arrows */}
                            <div className="absolute right-6 bottom-6 flex gap-2">
                                <button
                                    onClick={handlePrevImage}
                                    className="w-8.5 h-8.5 rounded-none bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 active:scale-95 transition text-gray-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="w-8.5 h-8.5 rounded-none bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 active:scale-95 transition text-gray-800"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                        </div>

                    </div>

                    {/* Right Side: Configurator Panel */}
                    <div className="lg:col-span-5 flex flex-col gap-5 pl-2 h-auto max-h-[460px] overflow-y-auto scrollbar-none">
                        
                        {/* Header Details */}
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">
                                {product.sub_category?.name || product.subCategory?.name || product.sub_category_name || 'Boutique Catalog Collection'}
                            </p>
                            <p className="text-xs font-black text-gray-900 mt-2">
                                {formatPrice(activeProduct.price)}
                            </p>
                        </div>

                        {/* Colorway Swatches Selection */}
                        <div>
                            <div className="flex flex-wrap gap-2">
                                {colorSwatches.map((swatch) => {
                                    const swatchImg = swatch.image
                                        ? (swatch.image.startsWith('http') || swatch.image.startsWith('/'))
                                            ? swatch.image
                                            : `/storage/${swatch.image}`
                                        : '/images/placeholder-product.png';
                                        
                                    const isSelected = selectedColorId === swatch.color_id;

                                    return (
                                        <button
                                            key={swatch.id}
                                            onClick={() => setSelectedColorId(swatch.color_id)}
                                            className={`h-12 w-[54px] rounded-none overflow-hidden border p-1 transition bg-[#F6F6F6] ${
                                                isSelected
                                                    ? 'border-black ring-1 ring-black'
                                                    : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="h-full w-full flex items-center justify-center bg-[#EAEAE9]">
                                                <img
                                                    src={swatchImg}
                                                    alt={swatch.color?.name || 'Color variant'}
                                                    className="h-full w-full object-contain mix-blend-multiply"
                                                />
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Nike-Style Mock Swatch for Design Your Own */}
                                <button
                                    type="button"
                                    className="h-12 w-[54px] rounded-none overflow-hidden border border-gray-200 hover:border-gray-400 p-1 bg-white flex flex-col items-center justify-center"
                                >
                                    <div className="h-4.5 w-4.5 rounded-full bg-gradient-to-tr from-rose-400 via-amber-400 to-indigo-500 mb-0.5 animate-spin-slow animate-spin"></div>
                                    <span className="text-[5.5px] font-black uppercase text-gray-500 leading-none">Design</span>
                                    <span className="text-[5.5px] font-black uppercase text-gray-500 leading-none mt-0.5">Your Own</span>
                                </button>
                            </div>
                        </div>

                        {/* Size Selector Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">
                                    Select Size
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5">
                                {allSizes.map((size) => {
                                    const variant = variantBySize[size.id];
                                    const hasVariant = !!variant;
                                    const inStock = hasVariant && variant.stock > 0;
                                    const isSelected = selectedSizeId === size.id;

                                    return (
                                        <button
                                            key={size.id}
                                            type="button"
                                            disabled={!inStock}
                                            onClick={() => setSelectedSizeId(size.id)}
                                            className={`py-2 text-center text-xs font-semibold rounded-none border transition relative ${
                                                isSelected
                                                    ? 'border-black bg-white text-gray-950 font-bold ring-1 ring-black z-10'
                                                    : inStock
                                                        ? 'border-gray-200 hover:border-black bg-white text-gray-900'
                                                        : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed opacity-35'
                                            }`}
                                        >
                                            <span>US {size.name}</span>
                                            
                                            {!inStock && (
                                                <div className="absolute inset-0 bg-transparent overflow-hidden pointer-events-none">
                                                    <div className="absolute w-[150%] h-[1px] bg-gray-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[32deg]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stock Status & Quantity Selector */}
                        <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">Availability</span>
                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    {activeProduct.stock > 10 ? (
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            In Stock
                                        </span>
                                    ) : activeProduct.stock > 0 ? (
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                            Only {activeProduct.stock} left!
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600">
                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {activeProduct.stock > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">Quantity</span>
                                    <div className="flex items-center rounded-none border border-gray-200 bg-[#F9FAFB] p-0.5">
                                        <button
                                            type="button"
                                            disabled={quantity <= 1}
                                            onClick={() => setQuantity(q => q - 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-none border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:text-black disabled:opacity-40"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-xs font-bold text-gray-800">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={quantity >= activeProduct.stock}
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-none border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:text-black disabled:opacity-40"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Capsule Buttons Stack */}
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={activeProduct.stock <= 0}
                                className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${
                                    activeProduct.stock <= 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
                                }`}
                            >
                                Add to Bag
                            </button>

                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                className="w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-none border border-gray-200 hover:border-black bg-white text-gray-950 flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-60"
                            >
                                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                                <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                            </button>
                        </div>

                        {/* Description Paragraph */}
                        <div className="mt-2 border-t border-gray-100 pt-4">
                            <p className="text-xs leading-relaxed text-gray-500 font-medium">
                                {product.description || 'A mash-up of Pegasus\' past, the sneaker features breathable mesh with horizontal and vertical overlays for a 2000s running look that is as striking as, say, a majestic winged horse.'}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Related Products Showcase */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12 border-t border-gray-100 pt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-gray-955 text-neutral-950 uppercase tracking-tight">You May Also Like</h2>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Recommendations from the same brand or category</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((p) => {
                                const relImg = p.image
                                    ? (p.image.startsWith('http') || p.image.startsWith('/'))
                                        ? p.image
                                        : `/storage/${p.image}`
                                    : '/images/placeholder-product.png';

                                return (
                                    <Link
                                        key={p.id}
                                        href={route(showRoute, p.id)}
                                        className="group flex flex-col justify-between border border-gray-100 bg-white p-3 hover:shadow-md transition duration-300 no-underline hover:no-underline"
                                    >
                                        <div>
                                            <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6] p-3 flex items-center justify-center mb-3">
                                                <img
                                                    src={relImg}
                                                    alt={p.name}
                                                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 scale-[0.8] group-hover:scale-[0.85]"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/placeholder-product.png';
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-[0.16em]">
                                                {p.brand?.name || 'TOS-PEAK'}
                                            </span>
                                            <h4 className="text-xs font-extrabold text-gray-900 truncate mt-1">
                                                {p.name}
                                            </h4>
                                        </div>
                                        <span className="text-[12.5px] font-black text-gray-950 block mt-2">
                                            {formatPrice(p.price)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Safety/Aesthetic Seals */}
                <div className="mt-8 border-t border-gray-100 pt-6 pb-2 flex justify-center items-center gap-2 text-gray-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">TOS-PEAK Premium Sneaker POS Configurator</span>
                </div>

                {toast && (
                    <div className="fixed top-5 right-5 z-[9999] pointer-events-auto">
                        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
                    </div>
                )}
            </div>

            {/* Success Modal */}
            <AddToBagSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                addedProduct={addedProduct}
                cartItems={cartItems}
                formatPrice={formatPrice}
                relatedProducts={relatedProducts}
                onAddRelatedToBag={handleAddRelatedToBag}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={loginModal.open}
                onClose={() => setLoginModal({ open: false, message: '' })}
                message={loginModal.message}
                redirectTo={typeof window !== 'undefined' ? window.location.href : '/'}
            />
        </Layout>
    );
}
