import React, { useState, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
  ShoppingBag, Search, X, LayoutDashboard, ChevronDown, User, Heart
} from 'lucide-react';
import { useCart } from '@/Hooks/useCart';

export default function Header({ 
  user, 
  activeCategory = 'All', 
  categories = [], 
  isStaff, 
  staffDashboardUrl, 
  setShowUserDrawer 
}) {
  const { cartCount } = useCart();
  const { wishlist_ids = [] } = usePage().props;
  const wishlistCount = wishlist_ids.length;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const hoverTimeoutRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '';

  const handleMouseEnterCategory = (cat) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCategory(cat);
  };

  const handleMouseLeaveCategory = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleMouseEnterDropdown = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMouseLeaveDropdown = () => {
    setHoveredCategory(null);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    router.visit(route('cart.index'));
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      <div 
        className={`fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-[2.5px] transition-all duration-300 ${
          hoveredCategory ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setHoveredCategory(null)}
        onMouseEnter={() => setHoveredCategory(null)}
      />

      {/* Announcement Bar */}
      <div className="bg-black py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white">
        Free shipping on orders over $50 · Official TOS-PEAK Store
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* Logo */}
          <Link
            href={route('storefront.index')}
            className="flex items-center gap-3 no-underline hover:no-underline"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black">
              <img
                src="/images/Tos_Peak-Logo.png"
                alt="TOS-PEAK"
                className="h-7 w-7 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black uppercase tracking-widest text-black">TOS-PEAK</span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-gray-400">Performance Sneakers</span>
            </div>
          </Link>

          {/* Center Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-6 h-full">
            <Link
              href={route('storefront.index')}
              className={`h-full flex items-center px-3 border-b-2 text-[12px] font-bold uppercase tracking-widest no-underline hover:no-underline transition ${
                activeCategory === 'All' && !hoveredCategory
                  ? 'text-black border-black font-black' 
                  : 'text-gray-500 border-transparent hover:text-black hover:border-black/30'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="h-full flex items-center"
                onMouseEnter={() => handleMouseEnterCategory(cat)}
                onMouseLeave={handleMouseLeaveCategory}
              >
                <Link
                  href={route('storefront.index', { category: cat.name })}
                  className={`h-full flex items-center px-3 border-b-2 text-[12px] font-bold uppercase tracking-widest no-underline hover:no-underline transition ${
                    (activeCategory === cat.name || hoveredCategory?.id === cat.id)
                      ? 'text-black border-black font-black' 
                      : 'text-gray-500 border-transparent hover:text-black hover:border-black/30'
                  }`}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-50 hover:text-black"
              aria-label="Search"
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* Wishlist icon with badge */}
            <Link
              href={route('wishlist.index')}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50 hover:text-black no-underline"
              aria-label="Wishlist"
            >
              <Heart size={17} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart icon with badge */}
            <Link
              href="#"
              onClick={handleCartClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50 hover:text-black no-underline"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-2 ring-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Staff dashboard shortcut */}
            {isStaff && (
              <Link
                href={staffDashboardUrl}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-gray-50 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-100 hover:text-black no-underline hover:no-underline"
              >
                <LayoutDashboard size={12} className="shrink-0" />
                <span className="hidden xs:inline">Dashboard</span>
              </Link>
            )}

            {/* User menu trigger */}
            {user ? (
              <button
                onClick={() => setShowUserDrawer(true)}
                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 hover:text-black"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-[10px] font-black text-white overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img 
                      src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="hidden sm:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowUserDrawer(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-black px-4 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-black/90 active:scale-95"
              >
                <User size={13} />
                <span>Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Bar */}
        {showSearch && (
          <div className="border-t border-black/5 bg-white px-5 py-3 sm:px-8 lg:px-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.get(route('storefront.index'), { search: searchQuery.trim() });
                  setShowSearch(false);
                }
              }}
              className="mx-auto flex max-w-2xl items-center gap-3"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sneakers, brands, sizes..."
                  className="h-10 w-full rounded-xl border border-black/10 bg-gray-50 pl-10 pr-4 text-sm font-medium text-black outline-none placeholder:text-gray-400 transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                />
              </div>
              <button
                type="submit"
                className="h-10 rounded-xl bg-black px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black/90"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mega Menu Dropdown */}
        <div 
          className={`absolute left-0 top-[100%] z-50 w-full border-b border-black/10 bg-white shadow-2xl transition-all duration-300 ease-out origin-top ${
            hoveredCategory 
              ? 'opacity-100 translate-y-0 scale-y-100 visible' 
              : 'opacity-0 -translate-y-2 scale-y-95 invisible pointer-events-none'
          }`}
          onMouseEnter={handleMouseEnterDropdown}
          onMouseLeave={handleMouseLeaveDropdown}
        >
          <div className="mx-auto max-w-[1200px] px-8 py-10">
            {hoveredCategory && (
              <div className="grid grid-cols-4 gap-12 text-left">
                {/* Column 1: Subcategories */}
                <div>
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                    Shop {hoveredCategory.name}
                  </h4>
                  <ul className="space-y-2.5 list-none p-0 m-0">
                    <li>
                      <Link 
                        href={route('storefront.index', { category: hoveredCategory.name })}
                        className="text-[11px] font-bold text-gray-500 hover:text-black transition no-underline block"
                      >
                        All {hoveredCategory.name} Shoes
                      </Link>
                    </li>
                    {((hoveredCategory.name === 'Men' ? [
                      { name: 'Sneakers' },
                      { name: 'Running' },
                      { name: 'Casual' },
                      { name: 'Basketball' }
                    ] : hoveredCategory.name === 'Women' ? [
                      { name: 'Sneakers' },
                      { name: 'Lifestyle' },
                      { name: 'Training' }
                    ] : (hoveredCategory.sub_categories || []))).map((sub, sIdx) => (
                      <li key={sIdx}>
                        <Link 
                          href={route('storefront.index', { category: hoveredCategory.name, sub_category: sub.name })}
                          className="text-[11px] font-medium text-gray-500 hover:text-black transition no-underline block"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Brands */}
                <div>
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                    Popular Brands
                  </h4>
                  <ul className="space-y-2.5 list-none p-0 m-0">
                    {['Nike', 'Adidas', 'Puma'].map((brand) => (
                      <li key={brand}>
                        <Link 
                          href={route('storefront.index', { search: brand })}
                          className="text-[11px] font-medium text-gray-500 hover:text-black transition no-underline block"
                        >
                          {brand} Performance
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Featured */}
                <div>
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                    Featured
                  </h4>
                  <ul className="space-y-2.5 list-none p-0 m-0">
                    <li>
                      <Link 
                        href={route('storefront.index')}
                        className="text-[11px] font-medium text-gray-500 hover:text-black transition no-underline block"
                      >
                        New Arrivals
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={route('storefront.index')}
                        className="text-[11px] font-medium text-gray-500 hover:text-black transition no-underline block"
                      >
                        Best Sellers
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={route('storefront.index')}
                        className="text-[11px] font-black text-red-600 hover:text-red-700 transition no-underline block"
                      >
                        Seasonal Sale
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Collections */}
                <div>
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                    Explore Collections
                  </h4>
                  <ul className="space-y-2.5 list-none p-0 m-0">
                    {categories
                      .filter((c) => c.id !== hoveredCategory.id)
                      .map((otherCat) => (
                        <li key={otherCat.id}>
                          <Link 
                            href={route('storefront.index', { category: otherCat.name, explore: 'true' })}
                            className="text-[11px] font-medium text-gray-500 hover:text-black transition no-underline block"
                          >
                            {otherCat.name} Collection
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Category Scrollbar */}
      <div className="flex items-center gap-5 overflow-x-auto border-b border-black/[0.05] bg-gray-50 px-5 py-2.5 scrollbar-none lg:hidden">
        <Link
          href={route('storefront.index')}
          className={`shrink-0 text-[10px] font-black uppercase tracking-wider no-underline transition ${
            activeCategory === 'All' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={route('storefront.index', { category: cat.name })}
            className={`shrink-0 text-[10px] font-black uppercase tracking-wider no-underline transition ${
              activeCategory === cat.name ? 'text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </>
  );
}
