import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import Cart from './components/Cart';
import ProductCard from './components/ProductCard';
import Modal from '@/Components/Modal';
import KhqrPayment from '@/Components/KhqrPayment';
import { Search, CheckCircle2, ChevronRight, ShoppingBag, CreditCard, QrCode } from 'lucide-react';
import { Toast } from '@/Components/Toast';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function POSPage({ products: rawProducts = [], categories = [], subCategories = [] }) {
    const headTitle = 'Point of Sale';
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

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
        setSelectedSubCategory('All');
    }, [selectedCategory]);

    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [customerEmail, setCustomerEmail] = useState(() => auth?.user?.email || '');
    const [isOrderComplete, setIsOrderComplete] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState(null);

    const filteredProducts = useMemo(() => {
        return localProducts.filter((product) => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSubCategory = selectedSubCategory === 'All' || product.sub_category === selectedSubCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSubCategory && matchesSearch;
        });
    }, [localProducts, selectedCategory, selectedSubCategory, searchTerm]);

    const groupedGridProducts = useMemo(() => {
        const seen = new Set();
        return filteredProducts.filter((product) => {
            if (seen.has(product.name)) return false;
            seen.add(product.name);
            return true;
        });
    }, [filteredProducts]);

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

    const innerContent = (
        <div className="flex h-[calc(100vh-106px)] gap-3 overflow-hidden bg-transparent text-[#111111]">

            {/* Left: search + grid */}
            <div className="flex flex-1 flex-col gap-2 overflow-hidden">

                {/* Search and Category Filter Card */}
                <div className="bg-white space-y-2 rounded-2xl border border-black/8 p-2.5 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                            <input
                                id="pos-search"
                                name="search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="h-10 w-full rounded-xl border border-black/10 bg-gray-50/50 pl-10 pr-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-4 focus:ring-black/5"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full md:max-w-[450px]">
                            <button onClick={() => setSelectedCategory('All')} className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedCategory === 'All' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'}`}>
                                All
                            </button>
                            {categories.map((cat) => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedCategory === cat.name ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedCategory !== 'All' && visibleSubCategories.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-black/[0.06] scrollbar-none">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-2 select-none font-display">Sub-category:</span>
                            <button onClick={() => setSelectedSubCategory('All')} className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedSubCategory === 'All' ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'}`}>
                                All {selectedCategory}
                            </button>
                            {visibleSubCategories.map((sub) => (
                                <button key={sub.id} onClick={() => setSelectedSubCategory(sub.name)} className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedSubCategory === sub.name ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'}`}>
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Grid Area */}
                <div className="flex-1 overflow-y-auto pr-1">
                    {groupedGridProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[24px] border border-black/5 bg-white/50 p-8 text-center h-full">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <h3 className="text-md font-semibold text-gray-900">No products found</h3>
                        </div>
                    ) : (
                        <div className="grid content-start gap-3.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {groupedGridProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    formatPrice={formatPrice}
                                    isStorefront={false}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Order Bag */}
            <div className="w-[320px] shrink-0 self-start">
                <Cart
                    items={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleOpenCheckout}
                    formatPrice={formatPrice}
                    isStorefront={false}
                    isLoggedIn={isLoggedIn}
                />
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
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all duration-200 ${paymentMethod === 'cash'
                                        ? 'border-[#f97316] bg-[#f97316] text-white shadow-sm'
                                        : 'border-black/5 bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Cash</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('qr')}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all duration-200 ${paymentMethod === 'qr'
                                        ? 'border-[#f97316] bg-[#f97316] text-white shadow-sm'
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

    return (
        <AdminLayout navbarTitle={headTitle} contentClassName="px-4 pb-4 pt-2">
            <Head title={headTitle} />
            {innerContent}
            {checkoutModal}
            {toastEl}
        </AdminLayout>
    );
}
