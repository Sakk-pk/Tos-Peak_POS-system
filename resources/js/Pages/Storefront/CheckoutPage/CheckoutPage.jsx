import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import KhqrPayment from '@/Components/KhqrPayment';
import Modal from '@/Components/Modal';
import CheckoutInput from './components/CheckoutInput';
import CheckoutSummary from './components/CheckoutSummary';
import { useCart } from '@/Hooks/useCart';
import { orderService } from '@/Services/orderService';
import { 
  QrCode, ArrowLeft, Loader2, X, MapPin, AlertTriangle, Check
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

  const { cartItems, setCartItems, cartCount, cartSubtotal } = useCart();

  // Split name for First / Last Name inputs
  const splitName = (user?.name || '').split(' ');
  const [firstName, setFirstName] = useState(splitName[0] || '');
  const [lastName, setLastName] = useState(splitName.slice(1).join(' ') || '');
  
  const [customerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  
  // Address parameters
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('Phnom Penh');
  const [zipCode, setZipCode] = useState('');

  // Saved Addresses selector state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, setter, val) => {
    setter(val);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Phone number is required
    if (!customerPhone || !customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required.';
    } else {
      const cleanPhone = customerPhone.trim().replace(/[\s()+-]/g, '');
      if (cleanPhone.length < 8 || !/^[0-9]+$/.test(cleanPhone)) {
        newErrors.customerPhone = 'Please enter a valid phone number (min 8 digits).';
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
            
            setStreetAddress(street);
            setCity(addr.city || addr.town || addr.village || addr.county || 'Phnom Penh');
            setStateProv(addr.state || addr.province || 'Phnom Penh');
            setZipCode(addr.postcode || '12000');
            
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

  const applySelectedAddress = (addr) => {
    if (!addr) return;
    const parts = (addr.recipientName || '').split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setStreetAddress(addr.streetAddress || '');
    setApartment(addr.apartment || '');
    setCity(addr.city || '');
    setStateProv(addr.stateProv || 'Phnom Penh');
    setZipCode(addr.zipCode || '');
    setCustomerPhone(addr.phone || '');
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setUseManualAddress(false);
    applySelectedAddress(addr);
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tos_saved_addresses')) || [];
      setSavedAddresses(stored);
      
      const defaultAddr = stored.find(a => a.isDefault) || stored[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        applySelectedAddress(defaultAddr);
      } else {
        setUseManualAddress(true);
      }
    } catch (_) {
      setUseManualAddress(true);
    }
  }, []);

  const [paymentMethod] = useState('qr'); // Only Bakong KHQR accepted
  const [orderNotes, setOrderNotes] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showVouchersModal, setShowVouchersModal] = useState(false);
  const [redeemedVouchersList, setRedeemedVouchersList] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tos_redeemed_vouchers')) || [];
      setRedeemedVouchersList(stored);
    } catch (_) {}
  }, []);

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

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.visit(route('cart.index'));
    }
  }, [cartItems]);

  const removeUsedVoucher = () => {
    if (appliedVoucher) {
      try {
        const stored = JSON.parse(localStorage.getItem('tos_redeemed_vouchers')) || [];
        const filtered = stored.filter(id => id !== appliedVoucher.id);
        localStorage.setItem('tos_redeemed_vouchers', JSON.stringify(filtered));
      } catch (_) {}
    }
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

    setShowQrModal(true);
  };

  const handleCheckoutSubmit = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError('');

    // Combine addresses into order_notes
    const combinedNotes = `
Delivery Address:
${streetAddress || 'N/A'}${apartment ? `, ${apartment}` : ''}
${city || 'N/A'}, ${stateProv}
Cambodia

Notes: ${orderNotes || 'N/A'}
${appliedVoucher ? `Applied Voucher: ${appliedVoucher.name}` : ''}
    `.trim();

    try {
      const data = await orderService.placeOrder({
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        cash_received: grandTotal,
        order_notes: combinedNotes,
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity }))
      });

      if (data.success) {
        // Clear local storage cart & remove applied voucher
        localStorage.setItem('pos_cart', JSON.stringify([]));
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
    localStorage.setItem('pos_cart', JSON.stringify([]));
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

  if (cartItems.length === 0) return null;

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
              <h2 className="text-[42px] leading-tight font-black uppercase tracking-tight text-neutral-955 text-neutral-955 text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                CONTACT
              </h2>
              <p className="text-[16px] font-extrabold text-neutral-800">
                {customerEmail}
              </p>
            </div>

            {/* ADDRESS Section */}
            <div className="space-y-4 pt-6 border-t border-black/[0.06]">
              <div>
                <h2 className="text-[42px] leading-tight font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                  ADDRESS
                </h2>
                <h3 className="text-[18px] font-bold uppercase tracking-widest text-neutral-950 mt-1">
                  Delivery address
                </h3>
              </div>

              {savedAddresses.length > 0 && !useManualAddress && (
                <div className="space-y-4 mb-6">
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
                    Choose Saved Shipping Address
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.map(addr => {
                      const isSelected = selectedAddressId === addr.id && !useManualAddress;
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`border p-4 cursor-pointer transition select-none flex flex-col justify-between gap-3 rounded-none ${
                            isSelected 
                              ? 'border-black bg-neutral-50/35 shadow-sm' 
                              : 'border-neutral-200 hover:border-black bg-white'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-neutral-950 text-white px-2 py-0.5 rounded-none">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-none">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="block text-xs font-black uppercase text-neutral-950">
                              {addr.recipientName}
                            </span>
                            <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                              {addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.stateProv}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUseManualAddress(true);
                        setSelectedAddressId(null);
                        setStreetAddress('');
                        setApartment('');
                        setCity('');
                        setZipCode('');
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition underline"
                    >
                      + DELIVER TO A DIFFERENT ADDRESS
                    </button>
                  </div>
                </div>
              )}

              {savedAddresses.length > 0 && useManualAddress && (
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-black/[0.06]">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
                    Custom Delivery Address Details
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const def = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                      if (def) handleSelectAddress(def);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition underline flex items-center gap-1"
                  >
                    ← Back to Saved Addresses
                  </button>
                </div>
              )}

              {(useManualAddress || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckoutInput 
                      id="chk-firstName"
                      label="First Name" 
                      value={firstName} 
                      onChange={(val) => handleInputChange('firstName', setFirstName, val)} 
                      error={errors.firstName}
                    />
                    <CheckoutInput 
                      id="chk-lastName"
                      label="Last Name" 
                      value={lastName} 
                      onChange={(val) => handleInputChange('lastName', setLastName, val)} 
                      error={errors.lastName}
                    />
                  </div>

                  {/* Street Address */}
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[12px] font-extrabold uppercase tracking-widest text-neutral-950">
                        Street Address, PO Box
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locating}
                        className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition select-none"
                      >
                        {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                        {locating ? 'Locating...' : 'Use Current Location'}
                      </button>
                    </div>
                    <div className={`relative border rounded-none h-12 bg-white flex items-center px-4 transition-all duration-200 focus-within:ring-0 ${
                      errors.streetAddress 
                        ? 'border-red-500 focus-within:border-red-600' 
                        : streetAddress 
                          ? 'border-emerald-600 focus-within:border-emerald-700' 
                          : 'border-neutral-300 focus-within:border-black'
                    }`}>
                      <input
                        id="chk-streetAddress"
                        type="text"
                        value={streetAddress}
                        onChange={(e) => handleInputChange('streetAddress', setStreetAddress, e.target.value)}
                        className="w-full bg-transparent text-[15px] font-bold text-neutral-900 outline-none border-none p-0 focus:ring-0 placeholder:text-neutral-300 placeholder:text-[14px]"
                        placeholder="House number, street name..."
                      />
                      {errors.streetAddress ? (
                        <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 ml-2 animate-bounce" />
                      ) : streetAddress ? (
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 ml-2" />
                      ) : null}
                    </div>
                    {errors.streetAddress ? (
                      <p className="text-[10.5px] text-red-500 font-bold flex items-center gap-1 mt-1 pl-1">
                        <span>{errors.streetAddress}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-400 font-semibold pl-1 mt-1">
                        E.g. 3 Stripes Street
                      </p>
                    )}
                  </div>

                  {/* Apartment */}
                  <CheckoutInput 
                    id="chk-apartment"
                    label="Apartment/Unit (optional)" 
                    value={apartment} 
                    onChange={setApartment} 
                    helperText="Please do not enter delivery instructions here"
                  />

                  {/* City & State Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckoutInput 
                      id="chk-city"
                      label="City/Town" 
                      value={city} 
                      onChange={(val) => handleInputChange('city', setCity, val)} 
                      error={errors.city}
                    />
                    
                    {/* Custom Outlined Select */}
                    <div className="w-full space-y-2">
                      <label className="block text-[12px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                        State/Province
                      </label>
                      <div className={`relative border rounded-none h-12 bg-white flex items-center px-4 transition-all duration-200 focus-within:border-black ${
                        errors.stateProv 
                          ? 'border-red-500 focus-within:border-red-600' 
                          : stateProv 
                            ? 'border-emerald-600 focus-within:border-emerald-700' 
                            : 'border-neutral-300'
                      }`}>
                        <select
                          id="chk-stateProv"
                          value={stateProv}
                          onChange={(e) => handleInputChange('stateProv', setStateProv, e.target.value)}
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

                  {/* Country Display (Cambodia Only) */}
                  <p className="text-[14px] font-semibold text-neutral-500">
                    Country: <span className="text-neutral-950 font-bold">Cambodia</span>
                  </p>

                  {/* Phone Number */}
                  <div className="w-full sm:w-1/2">
                    <CheckoutInput 
                      id="chk-customerPhone"
                      label="Phone Number *" 
                      value={customerPhone} 
                      onChange={(val) => handleInputChange('customerPhone', setCustomerPhone, val)} 
                      helperText="E.g. (123) 456-7890"
                      error={errors.customerPhone}
                    />
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
