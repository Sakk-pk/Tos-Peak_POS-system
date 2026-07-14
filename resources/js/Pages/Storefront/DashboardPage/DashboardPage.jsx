import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import { 
  Package, ShoppingBag, Heart, User, Lock, CreditCard, 
  MapPin, CheckCircle2, Search, ChevronRight, 
  ArrowLeft, ShieldCheck, Mail, Phone, Calendar, Plus, Trash2, Edit3
} from 'lucide-react';
import Modal from '@/Components/Modal';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
  return date.toLocaleDateString('en-US', options);
}

export default function DashboardPage({ orders = [], wishlists = [], payments = [], stats = {}, filters = {} }) {
  const { auth, flash } = usePage().props;
  const user = auth.user;

  // Active tab state: overview | orders | wishlist | addresses | profile | password | payments
  const [activeTab, setActiveTab] = useState(filters.tab || 'overview');
  
  // Active detailed order for detail view
  const [activeOrderId, setActiveOrderId] = useState(null);
  
  // Search & Filter states for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderPage, setOrderPage] = useState(1);

  // Search & Filter states for Payments
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);

  // Modal states
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Profile Form
  const profileForm = useForm({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: null,
  });

  // Password Form
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Saved Address Form
  const savedAddressInitial = user.saved_address || {
    name: '',
    phone: '',
    province: '',
    district: '',
    commune: '',
    street: '',
    postal_code: '',
  };
  
  const addressForm = useForm({
    saved_address: { ...savedAddressInitial }
  });

  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null;
    return orders.find(o => o.id === activeOrderId);
  }, [orders, activeOrderId]);

  // Total spending computed client side
  const totalSpending = useMemo(() => {
    return orders
      .filter(o => o.payment_status === 'Paid')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [orders]);

  const memberSince = useMemo(() => {
    if (!user.created_at) return 'Member since 2026';
    const date = new Date(user.created_at);
    return `Member since ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
  }, [user.created_at]);

  // Filter & Search Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.order_number.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderFilter === 'All' || order.payment_status === orderFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderFilter]);

  // Paginated Orders
  const ITEMS_PER_PAGE = 5;
  const paginatedOrders = useMemo(() => {
    const startIndex = (orderPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, orderPage]);

  const orderTotalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Filter & Search Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const paymentIdStr = String(payment.id);
      const matchesSearch = 
        paymentIdStr.includes(paymentSearch) ||
        (payment.transaction_id && payment.transaction_id.toLowerCase().includes(paymentSearch.toLowerCase())) ||
        (payment.order && payment.order.order_number.toLowerCase().includes(paymentSearch.toLowerCase()));
      return matchesSearch;
    });
  }, [payments, paymentSearch]);

  // Paginated Payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (paymentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, paymentPage]);

  const paymentTotalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

  // Actions
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.post(route('customer.profile.update'), {
      preserveScroll: true,
      onSuccess: () => {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Profile settings updated successfully.', type: 'success' } }));
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: firstError || 'Failed to update profile.', type: 'error' } }));
      }
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.post(route('customer.password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Security credentials updated successfully.', type: 'success' } }));
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: firstError || 'Failed to update security credentials.', type: 'error' } }));
      }
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    addressForm.post(route('customer.profile.update'), {
      preserveScroll: true,
      onSuccess: () => {
        setShowAddressModal(false);
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Billing coordinates updated successfully.', type: 'success' } }));
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: firstError || 'Failed to save address.', type: 'error' } }));
      }
    });
  };

  const handleRemoveWishlist = (productId) => {
    router.post(route('wishlist.toggle'), { product_id: productId }, {
      preserveScroll: true,
      onSuccess: () => {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Removed sneaker from Wishlist.', type: 'info' } }));
      }
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'My Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'password', name: 'Security', icon: Lock },
    { id: 'payments', name: 'Payments', icon: CreditCard },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <StorefrontLayout>
      <Head title="My Account | TOS-PEAK" />

      {/* Main Luxury Container */}
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-8 md:py-16 text-black select-none">
        
        {/* Flash Message Banner */}
        {flash?.success && (
          <div className="mb-8 rounded-xl bg-neutral-900 px-5 py-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{flash.success}</span>
            </div>
          </div>
        )}

        {/* ── LUXURY PROFILE HEADER ── */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/10">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center border border-black/10 shrink-0 shadow-inner">
              {user.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-neutral-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {getInitials(user.name)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user.name}
              </h1>
              <p className="text-xs text-neutral-500 font-bold mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{user.email}</span>
                <span className="text-neutral-300 hidden sm:inline">&bull;</span>
                <span className="text-neutral-400">{memberSince}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Statistics */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 md:pt-0 border-t border-black/5 md:border-t-0">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Spent</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">{formatPrice(totalSpending)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Orders</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">{orders.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Wishlist</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">{wishlists.length}</p>
            </div>
          </div>
        </div>

        {/* ── MAIN WORKSPACE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-col space-y-1 bg-neutral-50/50 p-2.5 rounded-2xl border border-black/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveOrderId(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition duration-300 group ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-neutral-500 hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{tab.name}</span>
                    </div>
                    {!isActive && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Navigation Scroll */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto whitespace-nowrap flex gap-2 pb-4 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveOrderId(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Workspace View */}
          <div className="lg:col-span-9 min-h-[500px]">
            
            {/* ── 1. Tab Overview ── */}
            {activeTab === 'overview' && (
              <div className="space-y-12">
                
                {/* Shopping Summary Stats Block */}
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-6">Shopping Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: 'Completed Purchases', value: orders.filter(o => o.payment_status === 'Paid').length },
                      { label: 'Pending Orders', value: orders.filter(o => o.payment_status === 'Pending').length },
                      { label: 'Wishlist Items', value: wishlists.length },
                      { label: 'Total Expenditure', value: formatPrice(totalSpending) }
                    ].map((stat, i) => (
                      <div key={i} className="pb-4 border-b border-black/10">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{stat.label}</span>
                        <p className="text-2xl font-black text-neutral-900 mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="space-y-6 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">Recent Orders</h2>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-900 hover:underline flex items-center gap-1.5"
                    >
                      View All Orders <ChevronRight size={12} />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col items-center justify-center">
                      <ShoppingBag size={24} className="text-neutral-300 mb-3" />
                      <p className="text-xs font-bold text-neutral-900">No orders placed yet</p>
                      <Link href={route('storefront.index')} className="mt-3 text-[10px] font-black uppercase tracking-widest text-neutral-900 underline hover:no-underline">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 2).map((order) => {
                        const firstItem = order.items?.[0];
                        const imageSrc = firstItem?.product_image
                          ? (firstItem.product_image.startsWith('http') || firstItem.product_image.startsWith('/'))
                            ? firstItem.product_image
                            : `/storage/${firstItem.product_image}`
                          : '/images/placeholder-product.png';

                        return (
                          <div 
                            key={order.id} 
                            onClick={() => {
                              setActiveOrderId(order.id);
                              setActiveTab('orders');
                            }}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between border border-black/5 p-4 rounded-xl hover:border-black transition duration-300 cursor-pointer gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-black/5 group-hover:scale-95 transition-transform duration-300">
                                <img src={imageSrc} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-neutral-900">{order.order_number}</p>
                                <p className="text-[10px] text-neutral-400 font-semibold mt-1">
                                  {formatDate(order.created_at)} &bull; {order.items?.length ?? 0} Item(s)
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t border-black/5 sm:border-t-0">
                              <div className="sm:text-right">
                                <p className="text-xs font-black text-neutral-900">{formatPrice(order.total_amount)}</p>
                                <span className={`inline-block text-[9px] font-black uppercase mt-1 px-2.5 py-0.5 rounded-full ${
                                  order.payment_status === 'Paid' 
                                    ? 'bg-emerald-50 text-emerald-600' 
                                    : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {order.payment_status}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── 2. Tab Orders List ── */}
            {activeTab === 'orders' && !activeOrderId && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400">Order History</h2>
                  </div>
                  
                  {/* Status Pills Filter */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['All', 'Paid', 'Pending', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => { setOrderFilter(status); setOrderPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition ${
                          orderFilter === status 
                            ? 'bg-black text-white' 
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modern Full Width Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input 
                    type="text" 
                    value={orderSearch}
                    onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                    placeholder="Search past order references..."
                    className="h-11 w-full pl-11 pr-4 text-xs bg-neutral-50 border border-black/5 rounded-xl outline-none focus:border-black focus:bg-white transition"
                  />
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 flex flex-col items-center justify-center">
                    <Package size={28} className="text-neutral-300 mb-3" />
                    <p className="text-xs font-bold text-neutral-900">No matching orders found</p>
                    <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Try refining your keyword filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {paginatedOrders.map((order) => {
                      const firstItem = order.items?.[0];
                      const imageSrc = firstItem?.product_image
                        ? (firstItem.product_image.startsWith('http') || firstItem.product_image.startsWith('/'))
                          ? firstItem.product_image
                          : `/storage/${firstItem.product_image}`
                        : '/images/placeholder-product.png';

                      return (
                        <div 
                          key={order.id}
                          onClick={() => setActiveOrderId(order.id)}
                          className="group border border-black/5 p-5 rounded-xl bg-white hover:border-black transition duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-[#F6F6F6] rounded-lg overflow-hidden flex items-center justify-center p-2 shrink-0 border border-black/5 group-hover:scale-95 transition-transform duration-300">
                              <img src={imageSrc} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-neutral-900">{order.order_number}</span>
                                <span className="text-[10px] text-neutral-400 font-bold">| {formatDate(order.created_at)}</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 font-semibold truncate max-w-xs md:max-w-md">
                                {order.items?.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t border-neutral-50 sm:border-t-0">
                            <div className="sm:text-right">
                              <p className="text-xs font-black text-neutral-950">{formatPrice(order.total_amount)}</p>
                              <span className={`inline-block text-[9px] font-black uppercase mt-1 px-2.5 py-0.5 rounded-full ${
                                order.payment_status === 'Paid' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : order.payment_status === 'Pending' 
                                    ? 'bg-amber-50 text-amber-600' 
                                    : 'bg-red-50 text-red-600'
                              }`}>
                                {order.payment_status}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {orderTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6">
                        <button
                          disabled={orderPage === 1}
                          onClick={() => setOrderPage(p => p - 1)}
                          className="h-9 px-4 rounded-xl border border-black/10 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition duration-300"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-bold text-neutral-500">
                          Page {orderPage} of {orderTotalPages}
                        </span>
                        <button
                          disabled={orderPage === orderTotalPages}
                          onClick={() => setOrderPage(p => p + 1)}
                          className="h-9 px-4 rounded-xl border border-black/10 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition duration-300"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── 3. Tab Order Detail (Shopping Receipt Layout) ── */}
            {activeTab === 'orders' && activeOrderId && activeOrder && (
              <div className="space-y-8 animate-fade-in">
                {/* Back Button */}
                <button 
                  onClick={() => setActiveOrderId(null)}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
                </button>

                {/* Receipt Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 pb-6 gap-3">
                  <div>
                    <h2 className="text-lg font-black text-neutral-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Receipt {activeOrder.order_number}
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
                      Transaction date: {formatDate(activeOrder.created_at, true)}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                      activeOrder.payment_status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      Payment status: {activeOrder.payment_status}
                    </span>
                  </div>
                </div>

                {/* Large Product Rows */}
                <div className="divide-y divide-black/5 border-t border-b border-black/5">
                  {activeOrder.items?.map((item) => {
                    const imageSrc = item.product_image
                      ? (item.product_image.startsWith('http') || item.product_image.startsWith('/'))
                        ? item.product_image
                        : `/storage/${item.product_image}`
                      : '/images/placeholder-product.png';

                    return (
                      <div key={item.id} className="py-5 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-[#F6F6F6] border border-black/5 flex items-center justify-center p-2">
                            <img src={imageSrc} alt={item.product_name} className="h-full w-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-neutral-900 leading-tight">{item.product_name}</h4>
                            <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
                              Size {item.size} &bull; Color {item.color}
                            </p>
                            <span className="text-[10px] text-neutral-500 font-bold block mt-1.5">
                              {formatPrice(item.price)} &times; {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-neutral-950">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div className="flex flex-col md:flex-row justify-between gap-6 bg-neutral-50 p-6 rounded-2xl border border-black/5">
                  <div className="space-y-2 text-xs text-neutral-500 font-semibold">
                    <p className="uppercase tracking-widest text-[9px] font-bold text-neutral-400 block mb-1">Billing Details</p>
                    <p>Method: <span className="font-black text-neutral-900 uppercase">{activeOrder.payment_method}</span></p>
                    {activeOrder.payment_method === 'cash' && activeOrder.cash_received && (
                      <>
                        <p>Cash received: <span className="font-black text-neutral-950">{formatPrice(activeOrder.cash_received)}</span></p>
                        <p>Change: <span className="font-black text-emerald-600">{formatPrice(activeOrder.change_amount || 0)}</span></p>
                      </>
                    )}
                    {activeOrder.payment_status === 'Paid' && (
                      <button 
                        onClick={() => setReceiptOrder(activeOrder)}
                        className="mt-2.5 h-7 px-3 bg-black hover:bg-neutral-800 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition"
                      >
                        Print Receipt Invoice
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-xs self-end md:self-auto min-w-[200px] border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                    <div className="flex justify-between text-neutral-500 font-semibold"><span>Subtotal</span><span>{formatPrice(activeOrder.subtotal)}</span></div>
                    <div className="flex justify-between text-neutral-500 font-semibold"><span>Estimated Tax (8%)</span><span>{formatPrice(activeOrder.tax)}</span></div>
                    <div className="flex justify-between text-sm font-black text-neutral-950 border-t border-black/10 pt-3 mt-3">
                      <span>Total Amount</span>
                      <span>{formatPrice(activeOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. Tab Wishlist ── */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400">My Wishlist</h2>
                </div>

                {wishlists.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col items-center justify-center">
                    <Heart size={28} className="text-neutral-300 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-neutral-900">Your wishlist is empty</p>
                    <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Keep track of shoes you want to purchase.</p>
                    <Link href={route('storefront.index')} className="mt-4 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-5 py-2.5 transition duration-300">
                      Explore Sneakers
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-fade-in">
                    {wishlists.map((wl) => {
                      const prod = wl.product;
                      if (!prod) return null;
                      const imageSrc = prod.image
                        ? (prod.image.startsWith('http') || prod.image.startsWith('/'))
                          ? prod.image
                          : `/storage/${prod.image}`
                        : '/images/placeholder-product.png';

                      return (
                        <div key={wl.id} className="group flex flex-col justify-between h-auto bg-white border border-black/5 rounded-2xl p-4 hover:border-black transition duration-500">
                          <div>
                            <Link href={route('storefront.show', prod.id)} className="no-underline">
                              <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6] rounded-xl p-3 flex items-center justify-center mb-3">
                                <img 
                                  src={imageSrc} 
                                  alt={prod.name} 
                                  className="h-full w-full object-contain mix-blend-multiply scale-[0.85] group-hover:scale-95 transition-transform duration-500" 
                                  onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }}
                                />
                              </div>
                              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">
                                {prod.brand?.name || 'TOS-PEAK'}
                              </span>
                              <h4 className="text-xs font-black text-neutral-900 truncate leading-tight mt-1">
                                {prod.name}
                              </h4>
                              <span className="text-xs font-black text-neutral-950 block mt-1.5">
                                {formatPrice(prod.price)}
                              </span>
                            </Link>
                          </div>
                          
                          <div className="mt-4 flex flex-col gap-1.5">
                            <Link
                              href={route('storefront.show', prod.id)}
                              className="w-full py-2 bg-black hover:bg-neutral-800 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition text-center no-underline"
                            >
                              Add to Bag
                            </Link>
                            <button
                              onClick={() => handleRemoveWishlist(prod.id)}
                              className="w-full py-2 bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-500 text-[9px] font-black uppercase tracking-wider rounded-lg transition border border-black/5 flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── 5. Tab Addresses ── */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-black/10">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400">Shipping Addresses</h2>
                  <button 
                    onClick={() => {
                      addressForm.reset();
                      setShowAddressModal(true);
                    }}
                    className="h-8.5 px-3 bg-black hover:bg-neutral-800 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
                  >
                    <Plus size={12} /> Add Address
                  </button>
                </div>

                {!user.saved_address || !user.saved_address.name ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col items-center justify-center">
                    <MapPin size={28} className="text-neutral-300 mb-3" />
                    <p className="text-xs font-bold text-neutral-900">No addresses saved yet</p>
                    <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Save your delivery coordinates for rapid checkouts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                    {/* Saved Address Card */}
                    <div className="border border-black p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between h-44">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded">Primary</span>
                          <span className="text-[10px] font-bold text-neutral-400">Home</span>
                        </div>
                        <h4 className="text-sm font-black text-neutral-900 mt-3">{user.saved_address.name}</h4>
                        <p className="text-xs text-neutral-500 font-semibold mt-1.5 truncate">
                          {user.saved_address.street}, {user.saved_address.commune}, {user.saved_address.district}, {user.saved_address.province}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold mt-1">Tel: {user.saved_address.phone}</p>
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-black/5">
                        <button 
                          onClick={() => {
                            addressForm.setData('saved_address', { ...user.saved_address });
                            setShowAddressModal(true);
                          }}
                          className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition flex items-center gap-1"
                        >
                          <Edit3 size={11} /> Edit details
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved Address Form in Modal */}
                <Modal show={showAddressModal} onClose={() => setShowAddressModal(false)} maxWidth="md">
                  <div className="p-6 space-y-6 text-left">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Configure Address</h3>
                      <p className="text-[10px] text-neutral-400 font-bold mt-1">Setup shipping destination parameters.</p>
                    </div>

                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="addr-name" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Recipient Name</label>
                          <input 
                            id="addr-name"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.name}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, name: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="addr-phone" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Contact Phone</label>
                          <input 
                            id="addr-phone"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.phone}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, phone: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="+855 12 345 678"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="addr-province" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Province/City</label>
                          <input 
                            id="addr-province"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.province}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, province: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="Phnom Penh"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="addr-district" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">District/Khan</label>
                          <input 
                            id="addr-district"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.district}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, district: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="Chamkar Mon"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="addr-commune" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Commune/Sangkat</label>
                          <input 
                            id="addr-commune"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.commune}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, commune: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="Boeung Keng Kang I"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3 space-y-1.5">
                          <label htmlFor="addr-street" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Street & Building Details</label>
                          <input 
                            id="addr-street"
                            type="text" 
                            required
                            value={addressForm.data.saved_address.street}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, street: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="St. 310, No. 45"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="addr-postal" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Postal Code</label>
                          <input 
                            id="addr-postal"
                            type="text" 
                            value={addressForm.data.saved_address.postal_code || ''}
                            onChange={(e) => addressForm.setData('saved_address', { ...addressForm.data.saved_address, postal_code: e.target.value })}
                            className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                            placeholder="12000"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="h-10 px-4 rounded-xl border border-black/10 text-xs font-black uppercase tracking-wider hover:bg-neutral-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addressForm.processing}
                          className="h-10 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </Modal>

              </div>
            )}

            {/* ── 6. Tab Profile Settings ── */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400 pb-4 border-b border-black/10">Profile Settings</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in text-left">
                  
                  {/* Left Column: Avatar upload */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border border-neutral-100 bg-neutral-50/50 rounded-2xl text-center">
                    <div className="h-24 w-24 rounded-full bg-white overflow-hidden flex items-center justify-center border border-black/10 shadow-sm shrink-0">
                      {user.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} 
                          alt={user.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-neutral-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 w-full">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Change Avatar</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => profileForm.setData('avatar', e.target.files[0])}
                        className="w-full text-[10px] text-neutral-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white file:cursor-pointer file:hover:bg-neutral-800 transition file:duration-300"
                      />
                      {profileForm.errors.avatar && <p className="text-[10px] text-red-500 font-bold mt-1.5">{profileForm.errors.avatar}</p>}
                    </div>
                  </div>

                  {/* Right Column: Text inputs */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="prof-name" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Account Name</label>
                      <input 
                        id="prof-name"
                        type="text" 
                        required
                        value={profileForm.data.name}
                        onChange={(e) => profileForm.setData('name', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                      />
                      {profileForm.errors.name && <p className="text-[10px] text-red-500 font-bold">{profileForm.errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prof-email" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Email Address</label>
                      <input 
                        id="prof-email"
                        type="email" 
                        required
                        value={profileForm.data.email}
                        onChange={(e) => profileForm.setData('email', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                      />
                      {profileForm.errors.email && <p className="text-[10px] text-red-500 font-bold">{profileForm.errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prof-phone" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Phone Number (Optional)</label>
                      <input 
                        id="prof-phone"
                        type="text" 
                        value={profileForm.data.phone || ''}
                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                        placeholder="+855 12 345 678"
                      />
                      {profileForm.errors.phone && <p className="text-[10px] text-red-500 font-bold">{profileForm.errors.phone}</p>}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="h-10 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300"
                      >
                        Update Account Information
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            )}

            {/* ── 7. Tab Security ── */}
            {activeTab === 'password' && (
              <div className="space-y-8 animate-fade-in text-left">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400 pb-4 border-b border-black/10">Security Center</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Password Card */}
                  <form onSubmit={handlePasswordSubmit} className="md:col-span-8 space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="pwd-curr" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Current Password</label>
                      <input 
                        id="pwd-curr"
                        type="password" 
                        required
                        value={passwordForm.data.current_password}
                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                        placeholder="••••••"
                      />
                      {passwordForm.errors.current_password && <p className="text-[10px] text-red-500 font-bold">{passwordForm.errors.current_password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="pwd-new" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">New Password</label>
                      <input 
                        id="pwd-new"
                        type="password" 
                        required
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                        placeholder="••••••"
                      />
                      {passwordForm.errors.password && <p className="text-[10px] text-red-500 font-bold">{passwordForm.errors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="pwd-conf" className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Confirm New Password</label>
                      <input 
                        id="pwd-conf"
                        type="password" 
                        required
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs font-semibold outline-none focus:border-black transition"
                        placeholder="••••••"
                      />
                      {passwordForm.errors.password_confirmation && <p className="text-[10px] text-red-500 font-bold">{passwordForm.errors.password_confirmation}</p>}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordForm.processing}
                        className="h-10 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300"
                      >
                        Update Account Security
                      </button>
                    </div>
                  </form>

                  {/* Shield Status information card */}
                  <div className="md:col-span-4 border border-black/5 bg-neutral-50 p-5 rounded-2xl space-y-4">
                    <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Account Protection</h4>
                      <p className="text-[10px] text-neutral-400 font-bold mt-1">STATUS: ACTIVE & PROTECTED</p>
                      <p className="text-[11px] text-neutral-500 font-semibold mt-3.5 leading-relaxed">
                        Security details are active. Update your credentials routinely to maintain account defense integrity.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── 8. Tab Payments History ── */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-400">Payment Transactions</h2>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    <input 
                      type="text" 
                      value={paymentSearch}
                      onChange={(e) => { setPaymentSearch(e.target.value); setPaymentPage(1); }}
                      placeholder="Search receipts reference..."
                      className="h-8.5 pl-8.5 pr-3 text-xs bg-neutral-50 border border-black/10 rounded-xl outline-none focus:border-black transition w-48"
                    />
                  </div>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col items-center justify-center">
                    <CreditCard size={28} className="text-neutral-300 mb-3" />
                    <p className="text-xs font-bold text-neutral-900">No transactions recorded</p>
                    <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Your invoices appear once order checkouts are paid.</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Desktop Payments Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium border-collapse">
                        <thead>
                          <tr className="text-neutral-400 border-b border-black/5 font-bold uppercase tracking-wider text-[9px]">
                            <th className="pb-3 pr-2">Transaction ID</th>
                            <th className="pb-3 px-2">Order #</th>
                            <th className="pb-3 px-2">Payment Method</th>
                            <th className="pb-3 px-2">Total Amount</th>
                            <th className="pb-3 px-2">Status</th>
                            <th className="pb-3 px-2">Billing Date</th>
                            <th className="pb-3 text-right pl-2">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {paginatedPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-neutral-50/50 transition">
                              <td className="py-4 pr-2 font-mono font-bold text-neutral-900">
                                {payment.transaction_id || `TXN-${String(payment.id).padStart(5, '0')}`}
                              </td>
                              <td className="py-4 px-2 font-mono">{payment.order?.order_number || 'N/A'}</td>
                              <td className="py-4 px-2 uppercase font-bold text-neutral-700">{payment.order?.payment_method || 'qr'}</td>
                              <td className="py-4 px-2 font-black text-neutral-900">{formatPrice(payment.amount)}</td>
                              <td className="py-4 px-2">
                                <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  payment.payment_status === 'paid' 
                                    ? 'bg-emerald-50 text-emerald-600' 
                                    : 'bg-red-50 text-red-600'
                                }`}>
                                  {payment.payment_status}
                                </span>
                              </td>
                              <td className="py-4 px-2 font-semibold text-neutral-400">
                                {formatDate(payment.created_at)}
                              </td>
                              <td className="py-4 text-right pl-2">
                                <button
                                  onClick={() => setReceiptOrder(payment.order)}
                                  className="h-7 px-3 bg-black hover:bg-neutral-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition"
                                >
                                  Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Payments Cards List */}
                    <div className="md:hidden space-y-3">
                      {paginatedPayments.map((payment) => (
                        <div key={payment.id} className="border border-black/5 p-4 rounded-xl space-y-3 bg-white hover:border-black transition duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-neutral-900">
                              {payment.transaction_id || `TXN-${String(payment.id).padStart(5, '0')}`}
                            </span>
                            <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              payment.payment_status === 'paid' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {payment.payment_status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-end border-t border-black/5 pt-2">
                            <div>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase">Order # {payment.order?.order_number || 'N/A'}</p>
                              <p className="text-xs font-black text-neutral-900 mt-1">{formatPrice(payment.amount)} &bull; <span className="uppercase text-neutral-500">{payment.order?.payment_method}</span></p>
                              <p className="text-[9px] text-neutral-400 font-semibold mt-0.5">{formatDate(payment.created_at)}</p>
                            </div>
                            <button
                              onClick={() => setReceiptOrder(payment.order)}
                              className="h-7 px-3 bg-black hover:bg-neutral-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition"
                            >
                              Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {paymentTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6">
                        <button
                          disabled={paymentPage === 1}
                          onClick={() => setPaymentPage(p => p - 1)}
                          className="h-9 px-4 rounded-xl border border-black/10 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition duration-300"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-bold text-neutral-500">
                          Page {paymentPage} of {paymentTotalPages}
                        </span>
                        <button
                          disabled={paymentPage === paymentTotalPages}
                          onClick={() => setPaymentPage(p => p + 1)}
                          className="h-9 px-4 rounded-xl border border-black/10 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition duration-300"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Dynamic Order Receipt Modal POPUP */}
      <Modal show={!!receiptOrder} onClose={() => setReceiptOrder(null)} maxWidth="sm">
        {receiptOrder && (
          <div className="p-6 space-y-5 text-center text-[#111111] text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Payment Invoice Receipt</h3>
              <p className="text-[10px] text-neutral-400 mt-1 font-bold">Reference: {receiptOrder.order_number}</p>
            </div>

            {/* Receipt Table Details */}
            <div className="rounded-2xl border border-black/5 bg-[#F9FAFB] p-5 text-xs text-neutral-500 space-y-4">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-semibold text-neutral-600">Transaction Date</span>
                <span className="font-bold text-neutral-900">{formatDate(receiptOrder.created_at, true)}</span>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-black/5 pb-3">
                <span className="font-black text-neutral-400 uppercase tracking-widest text-[8px] block mb-1">Purchased Products</span>
                {receiptOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-neutral-800 font-semibold">
                    <span>
                      {item.product_name} <span className="text-neutral-400 text-[10px]">({item.size} / {item.color})</span> <span className="text-xs text-neutral-500 font-black">x{item.quantity}</span>
                    </span>
                    <span className="font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Break down */}
              <div className="space-y-1.5 border-b border-black/5 pb-3">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold text-neutral-900">{formatPrice(receiptOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>Estimated Tax (8%):</span><span className="font-bold text-neutral-900">{formatPrice(receiptOrder.tax)}</span></div>
                <div className="flex justify-between font-black text-neutral-950 pt-2 border-t border-black/5 text-sm">
                  <span>Grand Total:</span>
                  <span>{formatPrice(receiptOrder.total_amount)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between"><span>Payment Method:</span><span className="uppercase font-black text-neutral-900">{receiptOrder.payment_method}</span></div>
                <div className="flex justify-between"><span>Status:</span><span className="uppercase font-black text-emerald-600">{receiptOrder.payment_status}</span></div>
              </div>
            </div>

            <button
              onClick={() => setReceiptOrder(null)}
              className="w-full py-3 bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300"
            >
              Close Receipt
            </button>
          </div>
        )}
      </Modal>

    </StorefrontLayout>
  );
}
