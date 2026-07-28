import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import KhqrPayment from '@/Components/KhqrPayment';
import Modal from '@/Components/Modal';
import CheckoutInput from './components/CheckoutInput';
import CheckoutSummary from './components/CheckoutSummary';
import { useCart } from '@/Hooks/useCart';
import { orderService } from '@/Services/orderService';
import { cartService } from '@/Services/cartService';
import { 
  QrCode, ArrowLeft, Loader2, X, MapPin, AlertTriangle, Check, ShoppingBag, Plus
} from 'lucide-react';

const VOUCHERS = [
  { id: 'v1', name: '$10 OFF VOUCHER', pts: 80, desc: 'Receive a $10 discount code for your next order.', code: 'PEAK10' },
  { id: 'v2', name: '20% OFF DISCOUNT', pts: 150, desc: 'Get 20% off any sneakers in our catalog.', code: 'PEAK20' },
  { id: 'v3', name: 'FREE DELIVERY VOUCHER', pts: 40, desc: 'Waive any delivery costs in Cambodia.', code: 'PEAKFREE' }
];

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

export default function CheckoutPage() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const { cartItems, setCartItems, cartCount, cartSubtotal, cartLoading } = useCart();

  // Split name for First / Last Name inputs
  const splitName = (user?.name || '').split(' ');
  
  const [customerEmail] = useState(user?.email || '');
  
  // ── Address System State ─────────────────────────────────────────────────
  // Mode: "saved" (select existing address) | "new" (enter custom new address)
  const [addressMode, setAddressMode] = useState('saved'); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveToProfile, setSaveToProfile] = useState(false);

  // New address form state
  const [newAddressForm, setNewAddressForm] = useState({
    firstName: splitName[0] || '',
    lastName: splitName.slice(1).join(' ') || '',
    phone: user?.phone || '',
    streetAddress: '',
    apartment: '',
    city: 'Phnom Penh',
    stateProv: 'Phnom Penh',
    zipCode: '',
  });

  const handleNewAddressChange = (field, val) => {
    setNewAddressForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Saved Addresses selector state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  const addressesKey = user?.id ? `tos_saved_addresses_${user.id}` : null;

  // Load saved addresses strictly per user on mount / user change
  useEffect(() => {
    try {
      if (user?.id) {
        const userStored = localStorage.getItem(`tos_saved_addresses_${user.id}`);
        const stored = userStored ? JSON.parse(userStored) : [];
        setSavedAddresses(stored);
        
        const defaultAddr = stored.find(a => a.isDefault) || stored[0];
        if (defaultAddr) {
          setAddressMode('saved');
          setSelectedAddressId(defaultAddr.id);
        } else {
          // No saved address for this customer -> show address input form directly!
          setAddressMode('new');
          setSelectedAddressId(null);
        }
      } else {
        // Guest user -> show address input form directly!
        setSavedAddresses([]);
        setAddressMode('new');
        setSelectedAddressId(null);
      }
    } catch (_) {
      setAddressMode('new');
      setSelectedAddressId(null);
    }
  }, [user?.id]);

  // Selected saved address object helper
  const selectedSavedAddr = useMemo(() => {
    return savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0] || null;
  }, [savedAddresses, selectedAddressId]);

  // Validate address form based on addressMode
  const validateForm = () => {
    const newErrors = {};

    if (addressMode === 'saved') {
      if (!selectedSavedAddr && savedAddresses.length > 0) {
        newErrors.savedAddress = 'Please select a saved delivery address.';
      }
    } else {
      // "new" mode validations
      if (!newAddressForm.firstName || !newAddressForm.firstName.trim()) {
        newErrors.firstName = 'First name is required.';
      }
      if (!newAddressForm.lastName || !newAddressForm.lastName.trim()) {
        newErrors.lastName = 'Last name is required.';
      }
      if (!newAddressForm.phone || !newAddressForm.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else {
        const cleanPhone = newAddressForm.phone.trim().replace(/[\s()+-]/g, '');
        if (cleanPhone.length < 8 || !/^[0-9]+$/.test(cleanPhone)) {
          newErrors.phone = 'Please enter a valid phone number (min 8 digits).';
        }
      }
      if (!newAddressForm.streetAddress || !newAddressForm.streetAddress.trim()) {
        newErrors.streetAddress = 'Street address is required.';
      }
      if (!newAddressForm.city || !newAddressForm.city.trim()) {
        newErrors.city = 'City/Khan is required.';
      }
      if (!newAddressForm.stateProv || !newAddressForm.stateProv.trim()) {
        newErrors.stateProv = 'State/Province is required.';
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Geolocation is not supported by your browser.', type: 'error' }
      }));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const houseNumber = addr.house_number || '';
            const street = `${houseNumber} ${road}`.trim() || 'Custom Location';
            
            setNewAddressForm(prev => ({
              ...prev,
              streetAddress: street,
              city: addr.city || addr.town || addr.village || addr.county || 'Phnom Penh',
              stateProv: addr.state || addr.province || 'Phnom Penh',
              zipCode: addr.postcode || '12000'
            }));
            
            window.dispatchEvent(new CustomEvent('toast', {
              detail: { message: 'Location calibrated successfully.', type: 'success' }
            }));
          } else {
            throw new Error('Location lookup failed.');
          }
        } catch (err) {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Unable to retrieve location details.', type: 'error' }
          }));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Location permission denied.', type: 'error' }
        }));
      }
    );
  };

  // Helper to save new address to profile if checkbox is checked
  const maybeSaveNewAddressToProfile = () => {
    if (addressMode === 'new' && saveToProfile) {
      const recipientName = `${newAddressForm.firstName} ${newAddressForm.lastName}`.trim();
      const newAddr = {
        id: `addr-${Date.now()}`,
        label: 'New Address',
        recipientName: recipientName || user?.name || 'Customer Name',
        phone: newAddressForm.phone,
        streetAddress: newAddressForm.streetAddress,
        apartment: newAddressForm.apartment || '',
        city: newAddressForm.city,
        stateProv: newAddressForm.stateProv,
        zipCode: newAddressForm.zipCode || '',
        isDefault: savedAddresses.length === 0,
      };
      const updated = [...savedAddresses, newAddr];
      try {
        if (addressesKey) {
          localStorage.setItem(addressesKey, JSON.stringify(updated));
        }
        setSavedAddresses(updated);
      } catch (e) {}
    }
  };

  const [paymentMethod] = useState('qr'); // Only Bakong KHQR accepted
  const [orderNotes, setOrderNotes] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Computed delivery info — resolved when the QR modal opens so the latest
  // form state is captured. Stored in state so KhqrPayment receives stable props.
  const [checkoutCustomerName, setCheckoutCustomerName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutShippingAddress, setCheckoutShippingAddress] = useState('');

  // Voucher state — read from database via Inertia shared props (auth.user.redeemed_vouchers)
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showVouchersModal, setShowVouchersModal] = useState(false);
  // Redeemed vouchers come from the database (HandleInertiaRequests shares auth.user.redeemed_vouchers)
  const redeemedVouchersList = auth?.user?.redeemed_vouchers || [];

  // Calculations
  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.id === 'v1') return 10;
    if (appliedVoucher.id === 'v2') return cartSubtotal * 0.20;
    return 0; // v3 is free delivery which is $0
  }, [appliedVoucher, cartSubtotal]);

  const tax = useMemo(() => {
    const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
    return discountedSubtotal * 0.08;
  }, [cartSubtotal, discountAmount]);

  const grandTotal = useMemo(() => {
    const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
    return discountedSubtotal + tax;
  }, [cartSubtotal, discountAmount, tax]);

  // Redirect to cart if loading is complete AND cart is still empty.
  // cartLoading starts as `true` for authenticated users (see useCart.js) so this
  // effect will NOT fire on the first render before the async fetch completes.
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.visit(route('cart.index'));
    }
  }, [cartItems, cartLoading]);

  // Vouchers are now DB-backed (written via /api/user-rewards/redeem in ProfileDrawer).
  // No localStorage cleanup needed at checkout — the DB record already reflects redeemed state.
  const removeUsedVoucher = () => { /* no-op: DB-backed */ };

  // Build the resolved delivery info from whichever address mode is active
  const resolveDeliveryInfo = () => {
    const recipientName = addressMode === 'saved'
      ? (selectedSavedAddr?.recipientName || user?.name || 'Customer')
      : `${newAddressForm.firstName} ${newAddressForm.lastName}`.trim();

    const phone = addressMode === 'saved'
      ? (selectedSavedAddr?.phone || user?.phone || '')
      : newAddressForm.phone;

    const street = addressMode === 'saved'
      ? (selectedSavedAddr?.streetAddress || '')
      : newAddressForm.streetAddress;

    const apt = addressMode === 'saved'
      ? (selectedSavedAddr?.apartment || '')
      : newAddressForm.apartment;

    const city = addressMode === 'saved'
      ? (selectedSavedAddr?.city || 'Phnom Penh')
      : newAddressForm.city;

    const state = addressMode === 'saved'
      ? (selectedSavedAddr?.stateProv || 'Phnom Penh')
      : newAddressForm.stateProv;

    const zip = addressMode === 'saved'
      ? (selectedSavedAddr?.zipCode || '')
      : newAddressForm.zipCode;

    const addressLine = [
      street,
      apt,
      `${city}, ${state}`,
      zip ? `(${zip})` : '',
      'Cambodia',
    ].filter(Boolean).join(', ').replace(/, ,/g, ',');

    return { recipientName, phone, addressLine };
  };

  const handlePlaceOrderClick = (e) => {
    e.preventDefault();
    setCheckoutError('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setCheckoutError('Please correct the highlighted fields to place the order.');
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Form validation failed.', type: 'error' }
      }));

      const firstErrorKey = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(`chk-${firstErrorKey}`) || document.querySelector(`[name="${firstErrorKey}"]`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    // Resolve and store the delivery info before opening the QR modal
    const { recipientName, phone, addressLine } = resolveDeliveryInfo();
    setCheckoutCustomerName(recipientName);
    setCheckoutPhone(phone);
    setCheckoutShippingAddress(addressLine);

    setShowQrModal(true);
  };

  const handleCheckoutSubmit = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError('');

    // Save address to profile if checked in "new" mode
    maybeSaveNewAddressToProfile();


    try {
      const { recipientName, phone, addressLine } = resolveDeliveryInfo();
      const data = await orderService.placeOrder({
        source: 'storefront',
        customer_name: recipientName,
        customer_email: customerEmail || null,
        customer_phone: phone,
        shipping_name: recipientName,
        shipping_phone: phone,
        shipping_address: addressLine,
        order_notes: orderNotes || null,
        payment_method: paymentMethod,
        cash_received: grandTotal,
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity }))
      });

      if (data.success) {
        // Clear local storage cart, server cart & remove applied voucher
        cartService.clearCart(!!user);
        setCartItems([]);
        removeUsedVoucher();
        
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Order placed successfully!', type: 'success' }
        }));

        const orderNum = data.order?.order_number || `#${String(data.order?.id).padStart(4, '0')}`;
        const queryParams = new URLSearchParams({
          order_number: orderNum,
          date: formatDate(data.order?.created_at || new Date(), true),
          payment_method: paymentMethod,
          amount: String(grandTotal),
        }).toString();
        
        router.visit(`/order-success?${queryParams}`);
      } else {
        setCheckoutError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed. Verify stock levels.');
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Order placement failed.', type: 'error' }
      }));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleQrPaymentSuccess = (details) => {
    setShowQrModal(false);
    maybeSaveNewAddressToProfile();
    cartService.clearCart(!!user);
    setCartItems([]);
    removeUsedVoucher();

    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'KHQR payment successful!', type: 'success' }
    }));

    axios.get(`/api/khqr/check/${details.orderId || ''}`).then(res => {
      const order = res.data.order;
      const queryParams = new URLSearchParams({
        order_number: order?.order_number || details.orderId,
        date: formatDate(order?.created_at || new Date(), true),
        payment_method: 'qr',
        amount: String(order?.total_amount || grandTotal),
      }).toString();
      router.visit(`/order-success?${queryParams}`);
    }).catch(() => {
      const queryParams = new URLSearchParams({
        order_number: details.orderId,
        date: formatDate(new Date(), true),
        payment_method: 'qr',
        amount: String(grandTotal),
      }).toString();
      router.visit(`/order-success?${queryParams}`);
    });
  };

  if (cartLoading) {
    return (
      <StorefrontLayout>
        <Head title="Checkout | TOS-PEAK" />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      </StorefrontLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <StorefrontLayout>
        <Head title="Checkout | TOS-PEAK" />
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center bg-gray-100">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-black uppercase text-black">Your bag is empty</h2>
          <p className="mt-2 text-xs font-medium text-gray-500">
            Add items to your bag before proceeding to checkout.
          </p>
          <Link
            href={route('storefront.index')}
            className="mt-6 inline-flex h-10 items-center justify-center bg-black px-6 text-xs font-black uppercase text-white hover:bg-neutral-800"
          >
            Explore Catalog
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <Head title="Checkout | TOS-PEAK" />

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 py-6 select-none text-[#111111] animate-fade-in">
        
        {/* Back navigation */}
        <Link 
          href={route('cart.index')}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black mb-6 transition no-underline hover:no-underline"
        >
          <ArrowLeft size={13} /> Back to Bag
        </Link>

        {/* 60% / 40% split layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start">
          
          {/* LEFT COLUMN (60%) */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* CONTACT Section */}
            <div className="space-y-2">
              <h2 className="text-[42px] leading-tight font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                CONTACT
              </h2>
              <p className="text-[16px] font-extrabold text-neutral-800">
                {customerEmail}
              </p>
            </div>

            {/* ADDRESS Section */}
            <div className="space-y-4 pt-6 border-t border-black/[0.06]">
              <div className="flex justify-between items-end pb-2">
                <div>
                  <h2 className="text-[42px] leading-tight font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                    ADDRESS
                  </h2>
                  <h3 className="text-[18px] font-bold uppercase tracking-widest text-neutral-950 mt-1">
                    Delivery address
                  </h3>
                </div>

                {/* Button to toggle to New Address when currently viewing saved addresses */}
                {addressMode === 'saved' && (
                  <button
                    type="button"
                    onClick={() => setAddressMode('new')}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-[11px] font-black uppercase tracking-wider rounded-none transition"
                  >
                    <Plus size={13} /> Deliver to a New Address
                  </button>
                )}

                {/* Button to toggle back to Saved Addresses when currently entering a new address */}
                {addressMode === 'new' && savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressMode('saved');
                      if (!selectedAddressId && savedAddresses.length > 0) {
                        const def = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                        setSelectedAddressId(def.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 text-[11px] font-black uppercase tracking-wider rounded-none transition"
                  >
                    <MapPin size={13} /> Use Saved Address ({savedAddresses.length})
                  </button>
                )}
              </div>

              {/* MODE 1: Saved Address Cards */}
              {addressMode === 'saved' && (
                <div className="space-y-4">
                  {savedAddresses.length === 0 ? (
                    <div className="p-6 border border-dashed border-neutral-300 text-center space-y-3">
                      <p className="text-xs font-medium text-neutral-500">
                        No saved addresses found in your profile.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddressMode('new')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider rounded-none"
                      >
                        <Plus size={13} /> Enter Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {savedAddresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div 
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`border p-4 cursor-pointer transition select-none flex flex-col justify-between gap-3 rounded-none relative ${
                              isSelected 
                                ? 'border-black bg-neutral-50/60 ring-1 ring-black shadow-sm' 
                                : 'border-neutral-200 hover:border-black bg-white'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name="checkout-saved-address" 
                                    checked={isSelected}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="text-black focus:ring-black h-4 w-4"
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-950 text-white px-2 py-0.5 rounded-none">
                                    {addr.label || 'Saved'}
                                  </span>
                                </div>
                                {addr.isDefault && (
                                  <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-none">
                                    Default
                                  </span>
                                )}
                              </div>
                              <span className="block text-xs font-black uppercase text-neutral-950 pl-6">
                                {addr.recipientName} ({addr.phone})
                              </span>
                              <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed pl-6">
                                {addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.stateProv} {addr.zipCode ? `(${addr.zipCode})` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}



                  {errors.savedAddress && (
                    <p className="text-[10.5px] text-red-500 font-bold mt-1 pl-1">
                      {errors.savedAddress}
                    </p>
                  )}
                </div>
              )}

              {/* MODE 2: New Address Form */}
              {addressMode === 'new' && (
                <div className="space-y-4 pt-2">
                  {/* GPS Calibration */}
                  <div className="flex justify-between items-center bg-neutral-50 border border-neutral-200 p-3">
                    <span className="text-xs font-bold text-neutral-700">Need help filling your location?</span>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black hover:text-neutral-700 disabled:opacity-50"
                    >
                      {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-emerald-600" />}
                      {locating ? 'Calibrating...' : 'Use GPS Location'}
                    </button>
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckoutInput 
                      id="chk-firstName"
                      label="First Name *" 
                      value={newAddressForm.firstName} 
                      onChange={(val) => handleNewAddressChange('firstName', val)} 
                      error={errors.firstName}
                    />
                    <CheckoutInput 
                      id="chk-lastName"
                      label="Last Name *" 
                      value={newAddressForm.lastName} 
                      onChange={(val) => handleNewAddressChange('lastName', val)} 
                      error={errors.lastName}
                    />
                  </div>

                  {/* Phone Number */}
                  <CheckoutInput 
                    id="chk-phone"
                    label="Phone Number *" 
                    value={newAddressForm.phone} 
                    onChange={(val) => handleNewAddressChange('phone', val)} 
                    placeholder="e.g. 012345678"
                    error={errors.phone}
                  />

                  {/* Street Address */}
                  <CheckoutInput 
                    id="chk-streetAddress"
                    label="Street Address, PO Box *" 
                    value={newAddressForm.streetAddress} 
                    onChange={(val) => handleNewAddressChange('streetAddress', val)} 
                    placeholder="House number, street name..."
                    error={errors.streetAddress}
                  />

                  {/* Apartment */}
                  <CheckoutInput 
                    id="chk-apartment"
                    label="Apartment/Unit (optional)" 
                    value={newAddressForm.apartment} 
                    onChange={(val) => handleNewAddressChange('apartment', val)} 
                    placeholder="Apt 4B"
                  />

                  {/* City & State/Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckoutInput 
                      id="chk-city"
                      label="City / Khan *" 
                      value={newAddressForm.city} 
                      onChange={(val) => handleNewAddressChange('city', val)} 
                      error={errors.city}
                    />
                    
                    {/* Province Dropdown */}
                    <div className="w-full space-y-2">
                      <label className="block text-[12px] font-extrabold uppercase tracking-widest text-neutral-950">
                        State / Province *
                      </label>
                      <div className={`relative border rounded-none h-12 bg-white flex items-center px-4 transition-all duration-200 focus-within:border-black ${
                        errors.stateProv 
                          ? 'border-red-500 focus-within:border-red-600' 
                          : newAddressForm.stateProv 
                            ? 'border-emerald-600 focus-within:border-emerald-700' 
                            : 'border-neutral-300'
                      }`}>
                        <select
                          id="chk-stateProv"
                          value={newAddressForm.stateProv}
                          onChange={(e) => handleNewAddressChange('stateProv', e.target.value)}
                          className="w-full bg-transparent text-[15px] font-bold text-neutral-900 outline-none border-none p-0 focus:ring-0"
                        >
                          <option value="Phnom Penh">Phnom Penh</option>
                          <option value="Siem Reap">Siem Reap</option>
                          <option value="Preah Sihanouk">Preah Sihanouk</option>
                          <option value="Battambang">Battambang</option>
                          <option value="Kampot">Kampot</option>
                        </select>
                      </div>
                      {errors.stateProv && (
                        <p className="text-[10.5px] text-red-500 font-bold flex items-center gap-1 mt-1 pl-1">
                          <span>{errors.stateProv}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Zip code & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <CheckoutInput 
                      id="chk-zipCode"
                      label="Postal Code (optional)" 
                      value={newAddressForm.zipCode} 
                      onChange={(val) => handleNewAddressChange('zipCode', val)} 
                    />
                    <p className="text-[14px] font-semibold text-neutral-500 pt-3">
                      Country: <span className="text-neutral-950 font-bold">Cambodia</span>
                    </p>
                  </div>

                  {/* Save to Profile Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-800">
                      <input 
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                      />
                      Save this address to my profile for future orders
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-4 pt-6 border-t border-black/[0.06]">
              <h2 className="text-[20px] leading-tight font-black uppercase tracking-tight text-neutral-955 text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                ORDER NOTES (OPTIONAL)
              </h2>
              <textarea
                id="chk-notes"
                rows="3"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Write any special requests or instructions for your order calibration..."
                className="w-full rounded-none border border-neutral-300 bg-white p-4 text-xs font-semibold outline-none focus:border-black transition resize-none"
              />
            </div>

            {checkoutError && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 p-3.5 rounded-none border border-red-100 animate-fade-in">
                {checkoutError}
              </p>
            )}

          </div>

          {/* RIGHT COLUMN (40%) */}
          <div className="lg:col-span-4">
            <CheckoutSummary
              subtotal={cartSubtotal}
              tax={tax}
              grandTotal={grandTotal}
              totalItems={cartCount}
              checkoutLoading={checkoutLoading}
              handlePlaceOrderClick={handlePlaceOrderClick}
              formatPrice={formatPrice}
              cartItems={cartItems}
              appliedVoucher={appliedVoucher}
              setAppliedVoucher={setAppliedVoucher}
              discountAmount={discountAmount}
              onOpenVouchersDrawer={() => setShowVouchersModal(true)}
            />
          </div>

        </div>

      </div>

      {/* Sticky Bottom Checkout Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-5 py-3 lg:hidden flex items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Total Due</span>
          <span className="text-base font-black text-gray-955">{formatPrice(grandTotal)}</span>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrderClick}
          disabled={checkoutLoading}
          className="flex-1 flex h-12 items-center justify-center gap-2 bg-black text-white rounded-none text-xs font-black uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40 shadow-sm"
        >
          {checkoutLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Place Order</span>
          )}
        </button>
      </div>

      {/* KHQR SCAN OVERLAY MODAL */}
      <Modal show={showQrModal} onClose={() => setShowQrModal(false)} maxWidth="sm">
        <div className="p-6 relative text-[#111111] text-center space-y-5">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400" style={{ fontFamily: "'Syne', sans-serif" }}>Scan to Pay</h3>
            <button onClick={() => setShowQrModal(false)} className="text-neutral-400 hover:text-black transition">
              <X size={16} />
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
            Please scan the generated Bakong KHQR code using your mobile banking app.
          </p>
          <div className="flex justify-center">
            <KhqrPayment
              grandTotal={grandTotal}
              cartItems={cartItems}
              customerEmail={customerEmail}
              customerName={checkoutCustomerName}
              customerPhone={checkoutPhone}
              shippingAddress={checkoutShippingAddress}
              source="storefront"
              onSuccess={handleQrPaymentSuccess}
              onCancel={() => setShowQrModal(false)}
            />
          </div>
        </div>
      </Modal>

      {/* SELECT VOUCHER MODAL */}
      <Modal show={showVouchersModal} onClose={() => setShowVouchersModal(false)} maxWidth="md">
        <div className="p-6 relative text-[#111111] space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Select Voucher</h3>
            <button onClick={() => setShowVouchersModal(false)} className="text-neutral-400 hover:text-black transition">
              <X size={16} />
            </button>
          </div>
          
          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
            Select one of your redeemed vouchers to apply to this order. Vouchers are earned in the club drawer.
          </p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
            {redeemedVouchersList.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 font-semibold text-xs">
                No active vouchers found.
              </div>
            ) : (
              VOUCHERS.filter(v => redeemedVouchersList.includes(v.id)).map(v => {
                const isApplied = appliedVoucher?.id === v.id;
                return (
                  <div key={v.id} className="border border-neutral-200 p-4 flex justify-between items-center bg-neutral-50">
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-neutral-950 uppercase">{v.name}</h4>
                      <p className="text-[9.5px] text-neutral-400 font-semibold">{v.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedVoucher(isApplied ? null : v);
                        setShowVouchersModal(false);
                        window.dispatchEvent(new CustomEvent('toast', {
                          detail: { message: isApplied ? 'Voucher removed.' : `Voucher "${v.name}" applied!`, type: 'success' }
                        }));
                      }}
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition ${
                        isApplied 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      {isApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

    </StorefrontLayout>
  );
}
