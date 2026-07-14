import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/Storefront/StorefrontLayout';
import Modal from '@/Components/Modal';
import { 
  User, Shield, Sliders, Bell, Link2, AlertTriangle, 
  Eye, EyeOff, Loader2, ArrowLeft, Check, ShieldAlert,
  Laptop, Sun, Moon, MapPin, Trash2, Edit2, Download,
  Lock, Smartphone, LaptopIcon, Globe, Info, X,
  Tag, Compass, Hash, Phone, Layers
} from 'lucide-react';

export default function AccountSettings({ mustVerifyEmail, status, twoFactorEnabled }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  // Date Joined (read-only)
  const dateJoined = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'July 12, 2026';

  // Personal Info Form State
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.avatar 
      ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`) 
      : null
  );
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
  const [personalInfoErrors, setPersonalInfoErrors] = useState({});

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');

  // 2FA state
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});

  const handleAddressInputChange = (field, setter, val) => {
    setter(val);
    if (addressErrors[field]) {
      setAddressErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePersonalInfoInputChange = (field, setter, val) => {
    setter(val);
    if (personalInfoErrors[field]) {
      setPersonalInfoErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePasswordInputChange = (field, setter, val) => {
    setter(val);
    if (passwordErrors[field]) {
      setPasswordErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('tos_saved_addresses');
      return stored ? JSON.parse(stored) : [
        {
          id: 'addr-default-1',
          label: 'Home',
          recipientName: user?.name || 'Customer Name',
          phone: user?.phone || '012345678',
          streetAddress: 'Russian Blvd (110), Cadt Building',
          apartment: 'Apartment 402, Building A',
          city: 'Phnom Penh',
          stateProv: 'Phnom Penh',
          zipCode: '12000',
          isDefault: true
        }
      ];
    } catch (_) {
      return [];
    }
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState('add'); // 'add' | 'edit'
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address Form State
  const [formLabel, setFormLabel] = useState('Home');
  const [formRecipient, setFormRecipient] = useState(user?.name || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formStreetAddress, setFormStreetAddress] = useState('');
  const [formApartment, setFormApartment] = useState('');
  const [formCity, setFormCity] = useState('Phnom Penh');
  const [formStateProv, setFormStateProv] = useState('Phnom Penh');
  const [formZipCode, setFormZipCode] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [locating, setLocating] = useState(false);

  // Sync saved addresses to localStorage
  useEffect(() => {
    localStorage.setItem('tos_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  // Privacy expandable state
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Danger Zone Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState({});

  // Active Login Sessions list (Simulated + Current Device)
  const currentBrowser = (() => {
    if (typeof window === 'undefined') return 'Desktop Browser';
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome on macOS';
    if (ua.includes('Safari')) return 'Safari on macOS';
    if (ua.includes('Firefox')) return 'Firefox on macOS';
    return 'Web Browser';
  })();

  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: currentBrowser, location: 'Phnom Penh, KH', active: true, time: 'Active Now' },
    { id: 'sess-2', device: 'Safari on iPhone 15', location: 'Siem Reap, KH', active: false, time: '2 hours ago' },
    { id: 'sess-3', device: 'Chrome on Windows 11', location: 'Phnom Penh, KH', active: false, time: '3 days ago' }
  ]);

  // Dirty State checking for leave warning
  const isDirty = (
    name !== (user?.name || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '') ||
    profilePhoto !== null ||
    currentPassword !== '' ||
    password !== '' ||
    passwordConfirmation !== ''
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const removeBeforeVisitListener = router.on('before', (visit) => {
      if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        visit.cancel();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      removeBeforeVisitListener();
    };
  }, [isDirty]);

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  // Initials lookup
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  // Photo change handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Save Personal Info
  const handleSavePersonalInfo = (e) => {
    e.preventDefault();

    const errs = {};
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedPhone = (phone || '').trim();

    if (!trimmedName) errs.name = 'Full name is required.';
    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (trimmedPhone) {
      const cleanPhone = trimmedPhone.replace(/[\s()+-]/g, '');
      if (cleanPhone.length < 8 || !/^[0-9]+$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid phone number (min 8 digits).';
      }
    }

    if (Object.keys(errs).length > 0) {
      setPersonalInfoErrors(errs);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Please correct the highlighted errors.', type: 'error' }
      }));
      const firstErrorKey = Object.keys(errs)[0];
      setTimeout(() => {
        const el = document.getElementById(`profile-${firstErrorKey}`);
        if (el) el.focus();
      }, 50);
      return;
    }

    setPersonalInfoLoading(true);
    setPersonalInfoErrors({});

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone || '');
    if (profilePhoto) {
      formData.append('avatar', profilePhoto);
    }

    router.post(route('customer.profile.update'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setProfilePhoto(null);
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Personal details updated successfully.', type: 'success' }
        }));
      },
      onError: (errs) => {
        setPersonalInfoErrors(errs);
      },
      onFinish: () => {
        setPersonalInfoLoading(false);
      }
    });
  };

  // Save Password
  const handleSavePassword = (e) => {
    e.preventDefault();

    const errs = {};
    if (!currentPassword) errs.current_password = 'Current password is required.';
    
    if (!password) {
      errs.password = 'New password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
      errs.password = 'Password must contain at least one uppercase letter.';
    }

    if (password !== passwordConfirmation) {
      errs.password_confirmation = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Please correct the security errors.', type: 'error' }
      }));
      const firstErrorKey = Object.keys(errs)[0];
      setTimeout(() => {
        const el = document.getElementById(`password-${firstErrorKey}`);
        if (el) el.focus();
      }, 50);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});

    router.post(route('customer.password.update'), {
      current_password: currentPassword,
      password: password,
      password_confirmation: passwordConfirmation,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Security parameters updated.', type: 'success' }
        }));
      },
      onError: (errs) => {
        setPasswordErrors(errs);
      },
      onFinish: () => {
        setPasswordLoading(false);
      }
    });
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    setTwoFactorLoading(true);
    if (twoFactorEnabled) {
      router.delete(route('two-factor.disable'), {
        preserveScroll: true,
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Two-factor authentication disabled.', type: 'success' }
          }));
        },
        onFinish: () => setTwoFactorLoading(false)
      });
    } else {
      router.post(route('two-factor.enable'), {}, {
        preserveScroll: true,
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Two-factor authentication enabled successfully.', type: 'success' }
          }));
        },
        onFinish: () => setTwoFactorLoading(false)
      });
    }
  };

  // Saved Addresses Handlers
  const handleOpenAddAddress = () => {
    setAddressModalMode('add');
    setEditingAddressId(null);
    setFormLabel('Home');
    setFormRecipient(name);
    setFormPhone(phone || '012345678');
    setFormStreetAddress('');
    setFormApartment('');
    setFormCity('Phnom Penh');
    setFormStateProv('Phnom Penh');
    setFormZipCode('');
    setFormIsDefault(savedAddresses.length === 0);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setAddressModalMode('edit');
    setEditingAddressId(addr.id);
    setFormLabel(addr.label);
    setFormRecipient(addr.recipientName);
    setFormPhone(addr.phone);
    setFormStreetAddress(addr.streetAddress);
    setFormApartment(addr.apartment || '');
    setFormCity(addr.city);
    setFormStateProv(addr.stateProv);
    setFormZipCode(addr.zipCode || '');
    setFormIsDefault(addr.isDefault);
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();

    // Address Validation
    const errs = {};
    const label = (formLabel || '').trim();
    const recipient = (formRecipient || '').trim();
    const phoneNum = (formPhone || '').trim();
    const street = (formStreetAddress || '').trim();
    const cityVal = (formCity || '').trim();
    const zipVal = (formZipCode || '').trim();

    if (!label) errs.label = 'Address label is required.';
    if (!recipient) errs.recipientName = 'Recipient name is required.';
    
    const cleanPhone = phoneNum.replace(/[\s()+-]/g, '');
    if (!phoneNum) {
      errs.phone = 'Phone number is required.';
    } else if (cleanPhone.length < 8 || !/^[0-9]+$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid phone number (min 8 digits).';
    }

    if (!street) errs.streetAddress = 'Street address is required.';
    if (!cityVal) errs.city = 'City/Town is required.';
    if (!formStateProv) errs.stateProv = 'State/Province is required.';
    if (!zipVal) {
      errs.zipCode = 'Zip code is required.';
    } else if (!/^[0-9A-Za-z-]{3,10}$/.test(zipVal)) {
      errs.zipCode = 'Please enter a valid zip code.';
    }

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Please correct the highlighted errors.', type: 'error' }
      }));
      const firstErrorKey = Object.keys(errs)[0];
      setTimeout(() => {
        const el = document.getElementById(`addr-form-${firstErrorKey}`) || document.querySelector(`[name="${firstErrorKey}"]`);
        if (el) el.focus();
      }, 50);
      return;
    }

    setAddressErrors({});
    const updated = [...savedAddresses];

    const addressData = {
      id: addressModalMode === 'edit' ? editingAddressId : `addr-${Date.now()}`,
      label: formLabel,
      recipientName: formRecipient,
      phone: formPhone,
      streetAddress: formStreetAddress,
      apartment: formApartment,
      city: formCity,
      stateProv: formStateProv,
      zipCode: formZipCode,
      isDefault: formIsDefault
    };

    if (formIsDefault) {
      // Uncheck other defaults
      updated.forEach(a => a.isDefault = false);
    }

    if (addressModalMode === 'edit') {
      const idx = updated.findIndex(a => a.id === editingAddressId);
      if (idx !== -1) updated[idx] = addressData;
    } else {
      updated.push(addressData);
    }

    // Force default if only one address exists
    if (updated.length === 1) {
      updated[0].isDefault = true;
    }

    setSavedAddresses(updated);
    setShowAddressModal(false);

    window.dispatchEvent(new CustomEvent('toast', {
      detail: { 
        message: addressModalMode === 'edit' ? 'Address details updated.' : 'New address saved successfully.', 
        type: 'success' 
      }
    }));
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this shipping address?')) {
      return;
    }
    let updated = savedAddresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setSavedAddresses(updated);
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'Address removed successfully.', type: 'success' }
    }));
  };

  const handleSetDefaultAddress = (id) => {
    const updated = savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setSavedAddresses(updated);
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'Default address updated.', type: 'success' }
    }));
  };

  // Reverse geocoding via OpenStreetMap Geolocation API
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            const cityVal = addr.city || addr.town || addr.village || 'Phnom Penh';
            const stateVal = addr.state || addr.region || 'Phnom Penh';
            const postVal = addr.postcode || '';

            setFormStreetAddress(road || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            setFormCity(cityVal);
            setFormStateProv(stateVal);
            setFormZipCode(postVal);
            
            window.dispatchEvent(new CustomEvent('toast', {
              detail: { message: 'Location retrieved and address fields populated.', type: 'success' }
            }));
          } else {
            setFormStreetAddress(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
            window.dispatchEvent(new CustomEvent('toast', {
              detail: { message: 'Location set to coordinates.', type: 'info' }
            }));
          }
        } catch (err) {
          setFormStreetAddress(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Location coordinates set (reverse address lookup failed).', type: 'info' }
          }));
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        let msg = 'Failed to retrieve current location.';
        if (err.code === 1) msg = 'Location permission denied by user.';
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: msg, type: 'error' }
        }));
      }
    );
  };

  // Download Data
  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      profile: { name, email, phone, dateJoined },
      savedAddresses
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tos_peak_account_data_${user?.id || 'guest'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'Account data downloaded successfully.', type: 'success' }
    }));
  };

  // Delete Account
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteErrors({});

    router.delete(route('profile.destroy'), {
      data: { password: deleteConfirmPassword },
      preserveScroll: true,
      onSuccess: () => {
        setShowDeleteModal(false);
        setDeleteConfirmPassword('');
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Account deleted successfully.', type: 'success' }
        }));
      },
      onError: (errs) => {
        setDeleteErrors(errs);
      },
      onFinish: () => {
        setDeleteLoading(false);
      }
    });
  };

  // Log Out All Sessions
  const handleLogoutAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.active));
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'Logged out of all other active sessions.', type: 'success' }
    }));
  };

  // Scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <StorefrontLayout title="Account Settings | TOS-PEAK">
      <Head title="Account Settings | TOS-PEAK" />

      <div className="w-full max-w-none px-4 sm:px-10 lg:px-16 py-8 text-[#111111] select-none animate-fade-in">
        
        {/* Back navigation */}
        <Link 
          href={route('storefront.index')}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black mb-6 transition no-underline hover:no-underline"
        >
          <ArrowLeft size={13} /> Continue Shopping
        </Link>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-[40px] font-black uppercase tracking-tight text-neutral-955 text-neutral-950 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
            Account Settings
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-semibold">
            Calibrate your personal information, security credentials, delivery addresses, and privacy settings.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT SIDEBAR - Shortcuts */}
          <div className="lg:col-span-3 lg:sticky lg:top-[90px] space-y-1 border-l border-neutral-200 pl-4 py-1 shrink-0">
            <button 
              onClick={() => scrollToSection('personal-info')}
              className="w-full flex items-center gap-2.5 py-2 text-[11px] font-black uppercase tracking-wider text-neutral-500 hover:text-neutral-950 transition text-left outline-none"
            >
              <User size={14} /> Personal Information
            </button>
            <button 
              onClick={() => scrollToSection('security')}
              className="w-full flex items-center gap-2.5 py-2 text-[11px] font-black uppercase tracking-wider text-neutral-500 hover:text-neutral-950 transition text-left outline-none"
            >
              <Shield size={14} /> Security
            </button>
            <button 
              onClick={() => scrollToSection('saved-addresses')}
              className="w-full flex items-center gap-2.5 py-2 text-[11px] font-black uppercase tracking-wider text-neutral-500 hover:text-neutral-950 transition text-left outline-none"
            >
              <MapPin size={14} /> Saved Addresses
            </button>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-2.5 py-2 text-[11px] font-black uppercase tracking-wider text-neutral-500 hover:text-red-600 transition text-left outline-none border-t border-black/5 mt-2 pt-2"
            >
              <X size={14} /> Log Out
            </button>
          </div>

          {/* RIGHT PANELS - Main Content */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* 1. Personal Information */}
            <section id="personal-info" className="bg-white border border-neutral-200 p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-black/[0.06] pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User size={18} className="text-neutral-955 text-neutral-950" />
                  <h2 className="text-[20px] font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Personal Information
                  </h2>
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 border border-neutral-200 px-2.5 py-0.5">
                  Joined: {dateJoined}
                </span>
              </div>

              <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                
                {/* Photo Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="h-20 w-20 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[24px] font-black text-neutral-400">{initials}</span>
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <label className="inline-block bg-black text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 cursor-pointer transition">
                      Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      JPG, PNG or WEBP (Max 2MB)
                    </p>
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-950">
                      Full Name *
                    </label>
                    <input 
                      id="profile-name"
                      type="text" 
                      value={name} 
                      onChange={(e) => handlePersonalInfoInputChange('name', setName, e.target.value)} 
                      required
                      className={`w-full border rounded-none h-12 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition ${
                        personalInfoErrors.name ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                      }`}
                    />
                    {personalInfoErrors.name && (
                      <span className="text-[10.5px] font-semibold text-red-500">{personalInfoErrors.name}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                      Phone Number
                    </label>
                    <input 
                      id="profile-phone"
                      type="text" 
                      value={phone} 
                      onChange={(e) => handlePersonalInfoInputChange('phone', setPhone, e.target.value)} 
                      className={`w-full border rounded-none h-12 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition ${
                        personalInfoErrors.phone ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                      }`}
                      placeholder="E.g. (123) 456-7890"
                    />
                    {personalInfoErrors.phone && (
                      <span className="text-[10.5px] font-semibold text-red-500">{personalInfoErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Email address */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                    Email Address *
                  </label>
                  <input 
                    id="profile-email"
                    type="email" 
                    value={email} 
                    onChange={(e) => handlePersonalInfoInputChange('email', setEmail, e.target.value)} 
                    required
                    className={`w-full border rounded-none h-12 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition ${
                      personalInfoErrors.email ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {personalInfoErrors.email && (
                    <span className="text-[10.5px] font-semibold text-red-500">{personalInfoErrors.email}</span>
                  )}
                </div>

                {/* Save Changes CTA */}
                <button
                  type="submit"
                  disabled={personalInfoLoading}
                  className="inline-flex h-12 items-center justify-center bg-black hover:bg-neutral-800 text-white text-[11px] font-black uppercase tracking-widest transition rounded-none px-6 disabled:opacity-40"
                >
                  {personalInfoLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>

              </form>
            </section>

            {/* 2. Security */}
            <section id="security" className="bg-white border border-neutral-200 p-8 shadow-sm space-y-8 scroll-mt-24">
              
              {/* Password update Form */}
              <div className="space-y-6">
                <div className="border-b border-black/[0.06] pb-3.5 flex items-center gap-2.5">
                  <Shield size={18} className="text-neutral-950" />
                  <h2 className="text-[20px] font-black uppercase tracking-tight text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Security & Authentication
                  </h2>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-6">
                  
                  {/* Current Password */}
                  <div className="space-y-2 relative">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-950">
                      Current Password
                    </label>
                    <div className="relative">
                      <input 
                        id="password-current_password"
                        type={showCurrentPassword ? 'text' : 'password'} 
                        value={currentPassword} 
                        onChange={(e) => handlePasswordInputChange('current_password', setCurrentPassword, e.target.value)} 
                        className={`w-full border rounded-none h-12 bg-white pl-4 pr-11 text-sm font-bold text-neutral-900 outline-none transition ${
                          passwordErrors.current_password ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <span className="text-[10.5px] font-semibold text-red-500">{passwordErrors.current_password}</span>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 relative">
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                        New Password
                      </label>
                      <div className="relative">
                        <input 
                          id="password-password"
                          type={showPassword ? 'text' : 'password'} 
                          value={password} 
                          onChange={(e) => handlePasswordInputChange('password', setPassword, e.target.value)} 
                          className={`w-full border rounded-none h-12 bg-white pl-4 pr-11 text-sm font-bold text-neutral-900 outline-none transition ${
                            passwordErrors.password ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      {passwordStrength && (
                        <div className="flex items-center gap-1.5 pt-1 text-[9px] font-black uppercase tracking-wider">
                          <span>Strength:</span>
                          <span className={
                            passwordStrength === 'weak' ? 'text-red-500' :
                            passwordStrength === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                          }>
                            {passwordStrength}
                          </span>
                        </div>
                      )}

                      {passwordErrors.password && (
                        <span className="text-[10.5px] font-semibold text-red-500">{passwordErrors.password}</span>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input 
                          id="password-password_confirmation"
                          type={showConfirmPassword ? 'text' : 'password'} 
                          value={passwordConfirmation} 
                          onChange={(e) => handlePasswordInputChange('password_confirmation', setPasswordConfirmation, e.target.value)} 
                          className={`w-full border rounded-none h-12 bg-white pl-4 pr-11 text-sm font-bold text-neutral-900 outline-none transition ${
                            passwordErrors.password_confirmation ? 'border-red-500 focus:border-red-600' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.password_confirmation && (
                        <span className="text-[10.5px] font-semibold text-red-500">{passwordErrors.password_confirmation}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex h-12 items-center justify-center bg-black hover:bg-neutral-800 text-white text-[11px] font-black uppercase tracking-widest transition rounded-none px-6 disabled:opacity-40"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Calibration...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>

                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t border-black/[0.06] pt-8 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className={twoFactorEnabled ? 'text-emerald-600' : 'text-neutral-400'} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-955 text-neutral-950">
                    Two-Factor Authentication (2FA)
                  </h3>
                </div>
                
                <p className="text-[12px] text-neutral-500 font-semibold leading-relaxed max-w-xl">
                  Secure your account by prompting a verification code upon every login attempt.
                </p>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider border ${
                    twoFactorEnabled 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : 'text-neutral-500 bg-neutral-50 border-neutral-200'
                  }`}>
                    {twoFactorEnabled ? 'Status: Active' : 'Status: Inactive'}
                  </span>

                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    disabled={twoFactorLoading}
                    className="h-10 inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[10px] font-black uppercase tracking-widest px-4 transition disabled:opacity-40"
                  >
                    {twoFactorLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : twoFactorEnabled ? (
                      'Disable 2FA'
                    ) : (
                      'Enable 2FA'
                    )}
                  </button>
                </div>
              </div>

            </section>

            {/* 3. Saved Addresses */}
            <section id="saved-addresses" className="bg-white border border-neutral-200 p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-black/[0.06] pb-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <MapPin size={18} className="text-neutral-955 text-neutral-950" />
                  <h2 className="text-[20px] font-black uppercase tracking-tight text-neutral-955 text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Saved Addresses
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="bg-black text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 transition"
                >
                  Add Address
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="border border-dashed border-neutral-200 bg-neutral-50/50 py-12 text-center space-y-3">
                  <MapPin className="h-8 w-8 text-neutral-300 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">No saved addresses</p>
                    <p className="text-[10.5px] text-neutral-400 font-semibold max-w-[280px] mx-auto leading-relaxed">
                      Save your delivery locations to skip address configuration during checkout.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className={`border p-5 flex flex-col justify-between gap-4 cursor-pointer transition select-none ${
                        addr.isDefault 
                          ? 'border-black bg-neutral-50/20' 
                          : 'border-neutral-200 hover:border-black bg-white'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-950 text-white px-2 py-0.5">
                            {addr.label}
                          </span>
                          
                          {addr.isDefault && (
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                              Default
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="block text-xs font-black uppercase text-neutral-950">
                            {addr.recipientName}
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                            {addr.phone}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-neutral-600 font-semibold leading-relaxed">
                          {addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.stateProv} {addr.zipCode}
                        </p>
                      </div>

                      <div className="flex gap-2.5 justify-end pt-3.5 border-t border-black/5 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditAddress(addr);
                          }}
                          className="text-neutral-400 hover:text-black transition p-1 hover:bg-neutral-100 rounded"
                          title="Edit Address"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                          className="text-neutral-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded"
                          title="Remove Address"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Danger Zone */}
            <section id="danger-zone" className="bg-[#FFF5F5] border border-red-200 p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-red-100 pb-3.5 flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-red-600" />
                <h2 className="text-[20px] font-black uppercase tracking-tight text-red-700" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Danger Zone
                </h2>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="h-11 inline-flex items-center justify-center bg-white border border-neutral-300 hover:border-black text-neutral-800 hover:text-black text-[10px] font-black uppercase tracking-widest px-5 transition"
                >
                  Log Out
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="h-11 inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-5 transition"
                >
                  Delete Account
                </button>
              </div>
            </section>

          </div>

        </div>

      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      <Modal show={showAddressModal} onClose={() => setShowAddressModal(false)} maxWidth="md" className="rounded-none">
        <form onSubmit={handleSaveAddress} className="p-6 relative text-[#111111] space-y-6 select-none bg-white">
          
          {/* Modal Header */}
          <div className="flex flex-col border-b border-black/[0.06] pb-4 space-y-1 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-black uppercase tracking-tight text-neutral-955 text-neutral-955 text-neutral-950" style={{ fontFamily: "'Syne', sans-serif" }}>
                {addressModalMode === 'edit' ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button type="button" onClick={() => setShowAddressModal(false)} className="text-neutral-400 hover:text-black transition p-1">
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
              Calibrate your delivery location coordinates for faster checkout.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  Address Label *
                </label>
                <div className={`relative border focus-within:border-black transition ${
                  addressErrors.label ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
                }`}>
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input 
                    id="addr-form-label"
                    type="text" 
                    value={formLabel} 
                    onChange={(e) => handleAddressInputChange('label', setFormLabel, e.target.value)} 
                    required
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                    placeholder="Home, Work..."
                  />
                </div>
                {addressErrors.label && (
                  <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.label}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  Recipient Name *
                </label>
                <div className={`relative border focus-within:border-black transition ${
                  addressErrors.recipientName ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
                }`}>
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input 
                    id="addr-form-recipientName"
                    type="text" 
                    value={formRecipient} 
                    onChange={(e) => handleAddressInputChange('recipientName', setFormRecipient, e.target.value)} 
                    required
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                    placeholder="Recipient Name"
                  />
                </div>
                {addressErrors.recipientName && (
                  <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.recipientName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                Phone Number *
              </label>
              <div className={`relative border focus-within:border-black transition ${
                addressErrors.phone ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
              }`}>
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input 
                  id="addr-form-phone"
                  type="text" 
                  value={formPhone} 
                  onChange={(e) => handleAddressInputChange('phone', setFormPhone, e.target.value)} 
                  required
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  placeholder="Contact Phone"
                />
              </div>
              {addressErrors.phone && (
                <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  Street Address *
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition"
                >
                  {locating ? <Loader2 size={11} className="animate-spin" /> : <MapPin size={11} />}
                  {locating ? 'Locating...' : 'Use Current Location'}
                </button>
              </div>
              <div className={`relative border focus-within:border-black transition ${
                addressErrors.streetAddress ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
              }`}>
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input 
                  id="addr-form-streetAddress"
                  type="text" 
                  value={formStreetAddress} 
                  onChange={(e) => handleAddressInputChange('streetAddress', setFormStreetAddress, e.target.value)} 
                  required
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  placeholder="House number, street name..."
                />
              </div>
              {addressErrors.streetAddress && (
                <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.streetAddress}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                Apartment / Unit (optional)
              </label>
              <div className="relative border border-neutral-300 focus-within:border-black transition">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input 
                  id="addr-form-apartment"
                  type="text" 
                  value={formApartment} 
                  onChange={(e) => setFormApartment(e.target.value)} 
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  placeholder="e.g. Apt 4A"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  City *
                </label>
                <div className={`relative border focus-within:border-black transition ${
                  addressErrors.city ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
                }`}>
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input 
                    id="addr-form-city"
                    type="text" 
                    value={formCity} 
                    onChange={(e) => handleAddressInputChange('city', setFormCity, e.target.value)} 
                    required
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  />
                </div>
                {addressErrors.city && (
                  <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.city}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  Province *
                </label>
                <div className={`relative border focus-within:border-black transition ${
                  addressErrors.stateProv ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
                }`}>
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input 
                    id="addr-form-stateProv"
                    type="text" 
                    value={formStateProv} 
                    onChange={(e) => handleAddressInputChange('stateProv', setFormStateProv, e.target.value)} 
                    required
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  />
                </div>
                {addressErrors.stateProv && (
                  <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.stateProv}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950">
                  ZIP Code *
                </label>
                <div className={`relative border focus-within:border-black transition ${
                  addressErrors.zipCode ? 'border-red-500 focus-within:border-red-600' : 'border-neutral-300'
                }`}>
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input 
                    id="addr-form-zipCode"
                    type="text" 
                    value={formZipCode} 
                    onChange={(e) => handleAddressInputChange('zipCode', setFormZipCode, e.target.value)} 
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-xs font-bold text-neutral-900 outline-none border-none focus:ring-0"
                  />
                </div>
                {addressErrors.zipCode && (
                  <p className="text-[9.5px] text-red-500 font-bold pl-1 mt-0.5">{addressErrors.zipCode}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input 
                type="checkbox" 
                id="is-default-checkbox"
                checked={formIsDefault} 
                onChange={(e) => setFormIsDefault(e.target.checked)} 
                className="rounded-none border-neutral-300 text-black focus:ring-0 focus:ring-offset-0 h-4.5 w-4.5 cursor-pointer animate-pulse"
              />
              <label htmlFor="is-default-checkbox" className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-800 cursor-pointer select-none">
                Set as default shipping address
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-neutral-100 hover:bg-neutral-200 transition text-neutral-800 rounded-none border border-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-black hover:bg-neutral-800 text-white transition rounded-none"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM LOGOUT MODAL */}
      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} maxWidth="sm">
        <div className="p-6 relative text-[#111111] text-center space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Confirm Logout</h3>
            <button onClick={() => setShowLogoutModal(false)} className="text-neutral-400 hover:text-black transition">
              <X size={16} />
            </button>
          </div>
          <p className="text-[11.5px] text-neutral-500 font-semibold">
            Are you sure you want to end your current session? You will need to log back in to spend your member points.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-neutral-100 hover:bg-neutral-200 transition text-neutral-800"
            >
              Cancel
            </button>
            <Link
              href={route('logout')}
              method="post"
              as="button"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-black hover:bg-neutral-800 text-white transition animate-pulse"
            >
              Log Out
            </Link>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
        <form onSubmit={handleDeleteAccount} className="p-6 relative text-[#111111] space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Confirm Account Deletion</h3>
            <button type="button" onClick={() => setShowDeleteModal(false)} className="text-neutral-400 hover:text-black transition">
              <X size={16} />
            </button>
          </div>
          
          <p className="text-[11.5px] text-neutral-500 font-semibold leading-relaxed">
            This action is irreversible. All of your member points, redeemed vouchers, purchase history, and wishlists will be wiped. Please enter your password to confirm deletion.
          </p>

          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-950">
              Confirm Password
            </label>
            <input
              type="password"
              value={deleteConfirmPassword}
              onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              required
              className="w-full border border-neutral-300 rounded-none h-12 bg-white px-4 text-sm font-bold text-neutral-900 outline-none focus:border-red-500 transition"
              placeholder="Enter password..."
            />
            {deleteErrors.password && (
              <span className="text-[10.5px] font-semibold text-red-500">{deleteErrors.password}</span>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmPassword('');
              }}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-neutral-100 hover:bg-neutral-200 transition text-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteLoading}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-40"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </form>
      </Modal>

    </StorefrontLayout>
  );
}
