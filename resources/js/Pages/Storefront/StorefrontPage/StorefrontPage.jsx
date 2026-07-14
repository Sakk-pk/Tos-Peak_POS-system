import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import Cart from '@/Pages/Admin/POS/components/Cart';
import ProductCard from '@/Pages/Admin/POS/components/ProductCard';
import Modal from '@/Components/Modal';
import KhqrPayment from '@/Components/KhqrPayment';
import HeroCarousel from './components/HeroCarousel';
import { Search, CheckCircle2, ChevronRight, ShoppingBag, CreditCard, QrCode, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Toast } from '@/Components/Toast';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

const COLOR_MAP = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'pink': '#ec4899',
    'purple': '#a855f7',
    'grey': '#808080',
    'gray': '#808080',
    'brown': '#a16207',
    'beige': '#f5f5dc',
    'navy': '#1e3a8a',
    'cream': '#fffdd0',
    'tan': '#d2b48c',
    'olive': '#808000',
    'teal': '#008080',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
};

function ProductSkeletonCard() {
    return (
        <div className="flex w-full flex-col justify-between animate-pulse">
            <div className="relative aspect-square w-full bg-neutral-100 flex items-center justify-center p-4">
                <div className="h-2/3 w-2/3 bg-neutral-200/50 rounded-lg" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2 px-1">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-2 w-12 bg-neutral-200 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                    <div className="h-2 w-16 bg-neutral-200 rounded" />
                </div>
                <div className="flex flex-col items-end space-y-1">
                    <div className="h-3 w-8 bg-neutral-200 rounded" />
                    <div className="h-2.5 w-6 bg-neutral-200 rounded" />
                </div>
            </div>
        </div>
    );
}


export default function StorefrontPage({ products: rawProducts = [], categories = [], subCategories = [] }) {
    const headTitle = 'TOS-PEAK | Find Your Pair';
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    // Slide-out cart drawer state
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

    const products = useMemo(() => {
        const items = Array.isArray(rawProducts) ? rawProducts : (rawProducts.data || []);
        return items.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
            stock: typeof p.stock === 'string' ? parseInt(p.stock, 10) : (p.stock || 0),
            image: p.image || '',
            category: p.category?.name || p.category_name || (typeof p.category === 'string' ? p.category : 'Uncategorized'),
            sub_category: p.sub_category?.name || p.subCategory?.name || p.sub_category_name || (typeof p.sub_category === 'string' ? p.sub_category : ''),
            brand: p.brand?.name || '',
            color: p.color?.name || '',
            size: p.size?.name || '',
        }));
    }, [rawProducts]);

    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pos_cart')) || [];
        } catch (e) {
            return [];
        }
    });

    const [toast, setToast] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const successMsg = urlParams.get('success');
        if (successMsg) {
            setToast({ message: successMsg, type: 'success' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pos_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [localProducts, setLocalProducts] = useState(products);

    const activeCategoryObj = useMemo(() => {
        return categories.find(cat => cat.name === selectedCategory);
    }, [categories, selectedCategory]);

    const visibleSubCategories = useMemo(() => {
        if (!activeCategoryObj) return [];
        return subCategories.filter(sub => String(sub.category_id) === String(activeCategoryObj.id));
    }, [subCategories, activeCategoryObj]);

    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    // Sync filter state from URL parameters (e.g. ?category=Sports&sub_category=Running&search=Aero)
    const { url } = usePage();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCat = urlParams.get('category');
        const urlSub = urlParams.get('sub_category');
        const urlSearch = urlParams.get('search');

        if (urlCat) {
            setSelectedCategory(urlCat);
        } else {
            setSelectedCategory('All');
        }

        if (urlSub) {
            setSelectedSubCategory(urlSub);
        } else {
            setSelectedSubCategory('All');
        }

        if (urlSearch) {
            setSearchTerm(urlSearch);
        } else {
            setSearchTerm('');
        }
    }, [url]);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [maxPrice, setMaxPrice] = useState(null);
    const [showFiltersSidebar, setShowFiltersSidebar] = useState(true);
    const [sortBy, setSortBy] = useState('Newest');
    const [categoryFilterOpen, setCategoryFilterOpen] = useState(true);
    const [brandFilterOpen, setBrandFilterOpen] = useState(true);

    const [priceFilterOpen, setPriceFilterOpen] = useState(true);
    const [colorFilterOpen, setColorFilterOpen] = useState(true);
    const [sizeFilterOpen, setSizeFilterOpen] = useState(true);

    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [customerEmail, setCustomerEmail] = useState(() => auth?.user?.email || '');
    const [isOrderComplete, setIsOrderComplete] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState(null);

    // Extract available colors from products dynamically
    const availableColors = useMemo(() => {
        const colorsSet = new Set();
        products.forEach(p => {
            if (p.color && p.color.trim()) {
                colorsSet.add(p.color.trim());
            }
        });
        return Array.from(colorsSet).sort();
    }, [products]);

    // Extract available sizes from products dynamically
    const availableSizes = useMemo(() => {
        const sizesSet = new Set();
        products.forEach(p => {
            if (p.size && p.size.trim()) {
                sizesSet.add(p.size.trim());
            }
        });
        return Array.from(sizesSet).sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });
    }, [products]);

    // Extract available brands dynamically
    const availableBrands = useMemo(() => {
        const brandsSet = new Set();
        products.forEach(p => {
            if (p.brand && p.brand.trim()) {
                brandsSet.add(p.brand.trim());
            }
        });
        return Array.from(brandsSet).sort();
    }, [products]);

    // Get price boundaries
    const priceRangeBounds = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 1000 };
        const prices = products.map(p => p.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        };
    }, [products]);

    const priceLimit = maxPrice !== null ? maxPrice : priceRangeBounds.max;

    // Reset maxPrice when products/bounds change
    useEffect(() => {
        if (maxPrice === null || maxPrice > priceRangeBounds.max || maxPrice < priceRangeBounds.min) {
            setMaxPrice(priceRangeBounds.max);
        }
    }, [priceRangeBounds]);

    const hasActiveFilters = selectedCategory !== 'All' || 
                             selectedSubCategory !== 'All' || 
                             !!searchTerm || 
                             selectedColors.length > 0 || 
                             selectedSizes.length > 0 || 
                             selectedBrands.length > 0 ||
                             (maxPrice !== null && maxPrice < priceRangeBounds.max);

    const [isGridLoading, setIsGridLoading] = useState(false);

    useEffect(() => {
        setIsGridLoading(true);
        const timer = setTimeout(() => {
            setIsGridLoading(false);
        }, 220);
        return () => clearTimeout(timer);
    }, [selectedCategory, selectedSubCategory, selectedColors, selectedSizes, selectedBrands, priceLimit, sortBy, searchTerm]);


    const handleClearAllFilters = () => {
        setSelectedColors([]);
        setSelectedSizes([]);
        setSelectedBrands([]);
        setMaxPrice(priceRangeBounds.max);
        setSelectedSubCategory('All');
        if (selectedCategory !== 'All' || searchTerm) {
            router.get(route('storefront.index'));
        }
    };

    const filteredProducts = useMemo(() => {
        return localProducts.filter((product) => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSubCategory = selectedSubCategory === 'All' || product.sub_category === selectedSubCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Color filter
            const matchesColor = selectedColors.length === 0 || 
                (product.color && selectedColors.includes(product.color));
                
            // Size filter
            const matchesSize = selectedSizes.length === 0 || 
                (product.size && selectedSizes.includes(product.size));
                
            // Brand filter
            const matchesBrand = selectedBrands.length === 0 ||
                (product.brand && selectedBrands.includes(product.brand));
                
            // Price filter
            const matchesPrice = product.price <= priceLimit;

            return matchesCategory && matchesSubCategory && matchesSearch && matchesColor && matchesSize && matchesBrand && matchesPrice;
        });
    }, [localProducts, selectedCategory, selectedSubCategory, searchTerm, selectedColors, selectedSizes, selectedBrands, priceLimit]);

    const sortedProducts = useMemo(() => {
        const items = [...filteredProducts];
        if (sortBy === 'Newest') {
            items.sort((a, b) => b.id - a.id);
        } else if (sortBy === 'Price: Low to High') {
            items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            items.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Popular') {
            items.sort((a, b) => b.stock - a.stock);
        }
        return items;
    }, [filteredProducts, sortBy]);

    const groupedGridProducts = useMemo(() => {
        const seen = new Set();
        return sortedProducts.filter((product) => {
            if (seen.has(product.name)) return false;
            seen.add(product.name);
            return true;
        });
    }, [sortedProducts]);

    const handleAddToCart = (product) => {
        if (product.stock <= 0) return;
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    setToast({ message: `Cannot add more. Only ${product.stock} item${product.stock !== 1 ? 's' : ''} in stock.`, type: 'error' });
                    return prevItems;
                }
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId, newQty) => {
        const product = localProducts.find((p) => p.id === productId);
        if (!product) return;
        if (newQty <= 0) {
            handleRemoveItem(productId);
            return;
        }
        if (newQty > product.stock) {
            setToast({ message: `Only ${product.stock} item${product.stock !== 1 ? 's' : ''} are in stock.`, type: 'error' });
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQty } : item
            )
        );
    };

    const handleRemoveItem = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const grandTotal = subtotal + tax;

    const handleOpenCheckout = () => {
        setCashReceived('');
        setCustomerEmail(auth?.user?.email || '');
        setPaymentMethod('cash');
        setIsOrderComplete(false);
        setReceiptDetails(null);
        setShowCheckout(true);
    };

    const handleCompleteOrder = (e) => {
        e.preventDefault();
        let change = 0;
        if (paymentMethod === 'cash') {
            const cash = parseFloat(cashReceived) || 0;
            if (cash < grandTotal) {
                setToast({ message: 'Amount received is less than the total. Please enter a valid amount.', type: 'error' });
                return;
            }
            change = cash - grandTotal;
        }

        router.post(route('orders.store'), {
            customer_name: 'Walk-in Customer',
            customer_email: customerEmail,
            customer_phone: '',
            payment_method: paymentMethod,
            cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : grandTotal,
            items: cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        }, {
            onSuccess: (page) => {
                const sessionOrder = page.props.flash?.order;
                const orderId = sessionOrder?.id 
                    ? `#${String(sessionOrder.id).padStart(4, '0')}` 
                    : (sessionOrder?.order_number || `TP-${Math.floor(100000 + Math.random() * 900000)}`);
                const date = sessionOrder?.created_at 
                    ? new Date(sessionOrder.created_at).toLocaleString() 
                    : new Date().toLocaleString();

                const receipt = {
                    orderId,
                    date,
                    items: [...cartItems],
                    subtotal,
                    tax,
                    grandTotal,
                    paymentMethod,
                    cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : grandTotal,
                    change,
                };
                setReceiptDetails(receipt);
                setIsOrderComplete(true);
            },
            onError: (errors) => {
                setToast({ message: errors.error || 'Failed to complete order. Please try again.', type: 'error' });
            }
        });
    };

    const handleQrPaymentSuccess = (qrReceiptData) => {
        const receipt = {
            orderId: qrReceiptData.orderId,
            date: qrReceiptData.date,
            items: [...cartItems],
            subtotal,
            tax,
            grandTotal,
            paymentMethod: 'qr',
            cashReceived: grandTotal,
            change: 0,
        };
        setReceiptDetails(receipt);
        setIsOrderComplete(true);
    };

    const handleNewSale = () => {
        setCartItems([]);
        setShowCheckout(false);
        setIsOrderComplete(false);
        setReceiptDetails(null);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const isExplore = urlParams.get('explore') === 'true';
    const showCarousel = (isExplore && selectedSubCategory === 'All' && !searchTerm) || 
                         (selectedCategory === 'All' && selectedSubCategory === 'All' && !searchTerm);

    const innerContent = (
        <div>
            {/* ── Hero Carousel ─────────────────────────────────────── */}
            {showCarousel && <HeroCarousel />}

            {/* ── Product catalogue ─────────────────────────────────── */}
            <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
            <div>
                {/* Section Title Header & Clear Filters button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-black/[0.06]">
                    <div>
                        <h2 className="text-xl font-extrabold uppercase tracking-wider text-black">
                            {selectedCategory === 'All' 
                                ? 'All Shoes' 
                                : selectedSubCategory === 'All' 
                                    ? `${selectedCategory} Collection`
                                    : `${selectedCategory} · ${selectedSubCategory}`
                            }
                        </h2>
                        {searchTerm && (
                            <p className="text-xs font-semibold text-gray-400 mt-1">
                                Search results for "<span className="text-black font-extrabold">{searchTerm}</span>"
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-[38px] rounded-xl border border-black/10 hover:border-black bg-white pl-4 pr-8 text-xs font-bold uppercase tracking-wider outline-none focus:border-black transition cursor-pointer select-none text-black appearance-none"
                            >
                                <option value="Newest">Sort: Newest</option>
                                <option value="Price: Low to High">Price: Low to High</option>
                                <option value="Price: High to Low">Price: High to Low</option>
                                <option value="Popular">Popularity</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        <button 
                            onClick={() => setShowFiltersSidebar(!showFiltersSidebar)}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider border border-black/10 hover:border-black rounded-xl px-4 py-2 transition bg-white text-black h-[38px]"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            {showFiltersSidebar ? 'Hide Filters' : 'Filters'}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearAllFilters}
                                className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 transition"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-category Filter pills (only visible when dynamic category is selected) */}
                {selectedCategory !== 'All' && visibleSubCategories.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 select-none">Sub-category:</span>
                        <button 
                            onClick={() => setSelectedSubCategory('All')} 
                            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${selectedSubCategory === 'All' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All {selectedCategory}
                        </button>
                        {visibleSubCategories.map((sub) => (
                            <button 
                                key={sub.id} 
                                onClick={() => setSelectedSubCategory(sub.name)} 
                                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${selectedSubCategory === sub.name ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Content Layout with Sidebar + Grid */}
                <div className={`flex flex-col lg:flex-row items-start transition-all duration-300 ${
                    showFiltersSidebar ? 'gap-6 lg:gap-8' : 'gap-0'
                }`}>
                    {/* Left Sidebar Filter Section */}
                    <div 
                        className={`transition-all duration-300 ease-in-out shrink-0 lg:sticky lg:top-[90px] self-start space-y-5 ${
                            showFiltersSidebar 
                                ? 'w-full lg:w-[185px] opacity-100 translate-x-0 pr-4 mr-2 overflow-visible' 
                                : 'w-0 h-0 lg:h-auto opacity-0 -translate-x-10 overflow-hidden pointer-events-none pr-0 mr-0'
                        }`}
                    >
                        {/* Category filter */}
                        {categories.length > 0 && (
                            <div className="border-b border-black/[0.06] pb-4">
                                <button 
                                    onClick={() => setCategoryFilterOpen(!categoryFilterOpen)}
                                    className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-800 focus:outline-none"
                                >
                                    <span>Category / Gender</span>
                                    {categoryFilterOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                                </button>
                                {categoryFilterOpen && (
                                    <div className="mt-3 space-y-2">
                                        <button
                                            onClick={() => setSelectedCategory('All')}
                                            className={`block text-xs font-semibold hover:text-black transition ${
                                                selectedCategory === 'All' ? 'text-black font-extrabold' : 'text-gray-500'
                                            }`}
                                        >
                                            All Collections
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className={`block text-xs font-semibold hover:text-black transition uppercase ${
                                                    selectedCategory === cat.name ? 'text-black font-extrabold' : 'text-gray-500'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Brand filter */}
                        {availableBrands.length > 0 && (
                            <div className="border-b border-black/[0.06] pb-4">
                                <button 
                                    onClick={() => setBrandFilterOpen(!brandFilterOpen)}
                                    className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-800 focus:outline-none"
                                >
                                    <span>Shop By Brand</span>
                                    {brandFilterOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                                </button>
                                {brandFilterOpen && (
                                    <div className="mt-3 space-y-2 text-left">
                                        {availableBrands.map((brand) => {
                                            const isSelected = selectedBrands.includes(brand);
                                            return (
                                                <button
                                                    key={brand}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedBrands(prev => 
                                                            prev.includes(brand) 
                                                                ? prev.filter(b => b !== brand) 
                                                                : [...prev, brand]
                                                        );
                                                    }}
                                                    className={`block text-xs font-semibold hover:text-black transition text-left w-full ${
                                                        isSelected ? 'text-black font-extrabold' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {brand}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Price range filter */}
                        <div className="border-b border-black/[0.06] pb-4">
                            <button 
                                onClick={() => setPriceFilterOpen(!priceFilterOpen)}
                                className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-800 focus:outline-none"
                            >
                                <span>Shop By Price</span>
                                {priceFilterOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                            </button>
                            {priceFilterOpen && (
                                <div className="mt-3 space-y-2.5">
                                    <input 
                                        type="range" 
                                        min={priceRangeBounds.min} 
                                        max={priceRangeBounds.max} 
                                        value={priceLimit} 
                                        onChange={(e) => setMaxPrice(Number(e.target.value))} 
                                        className="w-full accent-black cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none" 
                                    />
                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                                        <span>{formatPrice(priceRangeBounds.min)}</span>
                                        <span className="bg-black/5 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold text-black">
                                            Under {formatPrice(priceLimit)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Color filter */}
                        {availableColors.length > 0 && (
                            <div className="border-b border-black/[0.06] pb-4">
                                <button 
                                    onClick={() => setColorFilterOpen(!colorFilterOpen)}
                                    className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-800 focus:outline-none"
                                >
                                    <span>Shop By Color</span>
                                    {colorFilterOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                                </button>
                                {colorFilterOpen && (
                                    <div className="mt-3 grid grid-cols-3 gap-y-3 gap-x-2">
                                        {availableColors.map((color) => {
                                            const isSelected = selectedColors.includes(color);
                                            const hexColor = COLOR_MAP[color.toLowerCase()] || '#e5e7eb';
                                            const isWhite = color.toLowerCase() === 'white';
                                            
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => {
                                                        setSelectedColors(prev => 
                                                            prev.includes(color) 
                                                                ? prev.filter(c => c !== color) 
                                                                : [...prev, color]
                                                        );
                                                    }}
                                                    className="flex flex-col items-center gap-1.5 focus:outline-none group"
                                                >
                                                    <span 
                                                        className={`h-6 w-6 rounded-full flex items-center justify-center shadow-sm relative transition duration-150 group-hover:scale-105 ${
                                                            isWhite ? 'border border-black/15' : ''
                                                        }`}
                                                        style={{ backgroundColor: hexColor }}
                                                    >
                                                        {isSelected && (
                                                            <span className={`h-2 w-2 rounded-full ${
                                                                isWhite || color.toLowerCase() === 'beige' ? 'bg-black' : 'bg-white'
                                                            }`} />
                                                        )}
                                                    </span>
                                                    <span className={`text-[9px] font-bold tracking-tight transition truncate max-w-full leading-none text-center ${
                                                        isSelected ? 'text-black font-black' : 'text-gray-400 group-hover:text-black'
                                                    }`}>
                                                        {color}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Size filter */}
                        {availableSizes.length > 0 && (
                            <div className="pb-2">
                                <button 
                                    onClick={() => setSizeFilterOpen(!sizeFilterOpen)}
                                    className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-800 focus:outline-none"
                                >
                                    <span>Shop By Size</span>
                                    {sizeFilterOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                                </button>
                                {sizeFilterOpen && (
                                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                                        {availableSizes.map((size) => {
                                            const isSelected = selectedSizes.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => {
                                                        setSelectedSizes(prev => 
                                                            prev.includes(size) 
                                                                ? prev.filter(s => s !== size) 
                                                                : [...prev, size]
                                                        );
                                                    }}
                                                    className={`h-8 rounded-lg text-[9px] font-bold transition flex items-center justify-center border ${
                                                        isSelected 
                                                            ? 'bg-black text-white border-black font-black shadow-sm' 
                                                            : 'bg-white text-gray-700 border-black/10 hover:border-black'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Products Grid Area */}
                    <div className="flex-1 w-full">
                        {isGridLoading ? (
                            <div className="grid content-start gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-all duration-300">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <ProductSkeletonCard key={idx} />
                                ))}
                            </div>
                        ) : groupedGridProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-[24px] border border-black/5 bg-white/50 p-8 text-center py-24">
                                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <h3 className="text-md font-semibold text-gray-900">No products found</h3>
                                <p className="text-xs text-gray-400 mt-1">Try clearing or adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="grid content-start gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-all duration-300">
                                {groupedGridProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        formatPrice={formatPrice}
                                        isStorefront={true}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );

    const checkoutModal = (
        <Modal show={showCheckout} onClose={() => !isOrderComplete && setShowCheckout(false)} maxWidth="md">
            <div className="p-6">
                {!isOrderComplete ? (
                    <form onSubmit={handleCompleteOrder} className="space-y-5">
                        <div className="border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-extrabold text-gray-900">Checkout</h2>
                            <p className="text-xs text-gray-400">Select payment method and complete order.</p>
                        </div>

                        {/* Order Summary */}
                        <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Items Summary</span>
                                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
                            </div>
                            <div className="mt-2 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">Total Amount</span>
                                <span className="text-2xl font-black text-black">{formatPrice(grandTotal)}</span>
                            </div>
                        </div>

                        {/* Customer Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="customerEmail" className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Customer Email (Optional)</label>
                            <input
                                type="email"
                                id="customerEmail"
                                name="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="Enter customer email address"
                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-black transition"
                            />
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${paymentMethod === 'cash'
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-black/5 bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Cash</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('qr')}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${paymentMethod === 'qr'
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-black/5 bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                >
                                    <QrCode className="h-4 w-4" />
                                    <span>KHQR</span>
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-black/5 bg-gray-100/50 p-3 text-xs font-bold text-gray-400 cursor-not-allowed opacity-60"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Card (N/A)</span>
                                </button>
                            </div>
                        </div>

                        {/* Cash Amount Input / QR Code Component */}
                        {paymentMethod === 'cash' ? (
                            <div className="space-y-1.5">
                                <label htmlFor="cashReceived" className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Cash Received</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                                    <input
                                        type="number"
                                        id="cashReceived"
                                        name="cash"
                                        step="0.01"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        placeholder="0.00"
                                        className="h-11 w-full rounded-xl border border-black/10 bg-white pl-7 pr-3 text-sm font-semibold outline-none focus:border-black transition"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <KhqrPayment
                                amount={grandTotal}
                                orderItems={cartItems}
                                customerEmail={customerEmail}
                                customerName="Walk-in Customer"
                                customerPhone=""
                                onSuccess={handleQrPaymentSuccess}
                            />
                        )}

                        {paymentMethod === 'cash' && (
                            <button
                                type="submit"
                                className="flex h-11 w-full items-center justify-center bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-900 active:bg-neutral-800 transition"
                            >
                                Complete Order
                            </button>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6 text-center py-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-extrabold text-gray-900">Order Completed Successfully</h3>
                            <p className="text-xs text-gray-400">Order reference: <span className="font-bold text-gray-700">{receiptDetails?.orderId}</span></p>
                        </div>

                        {/* Order Receipt */}
                        <div className="rounded-2xl border border-black/5 bg-gray-50/50 p-5 text-left text-xs text-gray-500 space-y-4">
                            <div className="flex justify-between border-b border-black/5 pb-2.5">
                                <span className="font-semibold text-gray-600">Date & Time</span>
                                <span>{receiptDetails?.date}</span>
                            </div>

                            {/* Items List */}
                            <div className="space-y-2 border-b border-black/5 pb-2.5">
                                <span className="font-semibold text-gray-600 block">Items Detail</span>
                                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                    {receiptDetails?.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-gray-700 font-medium">
                                            <span>{item.name} <span className="text-gray-400 text-[10px]">({item.size} / {item.color})</span> <span className="text-xs text-gray-500 font-bold ml-1">x{item.quantity}</span></span>
                                            <span>{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial totals */}
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Subtotal:</span><span>{formatPrice(receiptDetails?.subtotal)}</span></div>
                                <div className="flex justify-between"><span>Tax (8%):</span><span>{formatPrice(receiptDetails?.tax)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900 border-t border-black/5 pt-1.5 mt-1.5 text-sm"><span>Grand Total:</span><span>{formatPrice(receiptDetails?.grandTotal)}</span></div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Paid via:</span><span className="uppercase font-bold text-gray-900">{receiptDetails?.paymentMethod}</span></div>
                                <div className="flex justify-between"><span>Paid Amount:</span><span>{formatPrice(receiptDetails?.cashReceived)}</span></div>
                                {receiptDetails?.paymentMethod === 'cash' && (
                                    <div className="flex justify-between font-bold text-emerald-600"><span>Change:</span><span>{formatPrice(receiptDetails?.change)}</span></div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleNewSale}
                            className="flex h-11 w-full items-center justify-center gap-1.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 active:bg-red-800 transition shadow-md shadow-red-600/10"
                        >
                            <span>Start New Sale</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );

    const toastEl = toast && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto">
            <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        </div>
    );

    const cartItemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    return (
        <StorefrontLayout>
            <Head title={headTitle} />
            {innerContent}

            {/* Cart Slide-out Drawer */}
            {cartDrawerOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                        onClick={() => setCartDrawerOpen(false)}
                    />
                    <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                            <h2 className="text-sm font-black uppercase tracking-wider text-black">Your Bag</h2>
                            <button
                                onClick={() => setCartDrawerOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <Cart
                                items={cartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onCheckout={() => {
                                    setCartDrawerOpen(false);
                                    router.visit(route('checkout.index'));
                                }}
                                onCloseDrawer={() => setCartDrawerOpen(false)}
                                formatPrice={formatPrice}
                                isStorefront={true}
                                isLoggedIn={isLoggedIn}
                            />
                        </div>
                    </div>
                </>
            )}

            {checkoutModal}
            {toastEl}
        </StorefrontLayout>
    );
}
