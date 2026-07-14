import React, { useState, useEffect } from 'react';
import MenuSideBar from './MenuSideBar';
import { SidebarInset, SidebarTrigger } from '@/Components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Terminal, Bell, Search, Globe, ChevronDown } from 'lucide-react';

/**
 * AdminLayout — TOS-PEAK v2.0
 * White header, premium layout, refined structure
 */
const AdminLayout = ({ breadcrumb, children, navbarTitle = 'Dashboard', contentClassName = 'px-8 py-6' }) => {
    const { auth, lowStockAlerts = [] } = usePage().props;
    const user = auth?.user;
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('admin-dashboard');
        return () => {
            document.documentElement.classList.remove('admin-dashboard');
        };
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    return (
        <MenuSideBar>
            <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">

                {/* ── Storefront-Aligned Header Bar ───────────────────────────── */}
                <header className="h-16 shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-6 sm:px-8">

                    {/* Left — Sidebar Trigger + Editorial Page Title */}
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg p-2 transition-all duration-200" />

                        <div className="flex items-center gap-2">
                            <h1
                                className="text-black font-extrabold uppercase leading-none tracking-wider font-display text-[15px]"
                                style={{
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {navbarTitle}
                            </h1>
                            {breadcrumb && (
                                <div className="hidden lg:flex items-center text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                                    <span className="mx-2">/</span>
                                    {breadcrumb}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Search icon, Notifications, Avatar */}
                    <div className="flex items-center gap-4">
                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2">
                            <Link 
                                href={route('storefront.index')}
                                className="h-9 px-3 rounded-lg border border-black/10 bg-white text-gray-700 hover:bg-gray-50 hover:text-black transition-all duration-200 flex items-center gap-1.5 text-xs font-bold uppercase no-underline hover:no-underline"
                                title="View Storefront UI"
                            >
                                <Globe size={13} />
                                <span className="hidden md:inline text-[10px] tracking-wider uppercase">Storefront</span>
                            </Link>

                            <button className="h-9 w-9 rounded-lg border border-black/10 bg-white text-gray-700 hover:bg-gray-50 hover:text-black flex items-center justify-center transition-all duration-200">
                                <Search size={14} />
                            </button>

                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="h-9 w-9 rounded-lg border border-black/10 bg-white text-gray-700 hover:bg-gray-50 hover:text-black flex items-center justify-center transition-all duration-200 relative"
                                >
                                    <Bell size={14} />
                                    {lowStockAlerts.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-2 ring-white">
                                            {lowStockAlerts.length}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-40 text-[#111111] animate-modal-in">
                                            <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                                                    <Bell size={12} className="text-red-600" />
                                                    Stock Alerts
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                                                    {lowStockAlerts.length} Alerts
                                                </span>
                                            </div>

                                            {lowStockAlerts.length === 0 ? (
                                                <div className="py-8 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                                    Healthy Stock Levels
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                    {lowStockAlerts.map((alert) => (
                                                        <div 
                                                            key={alert.id}
                                                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-orange-50/20 border border-orange-100"
                                                        >
                                                            <span className="text-xs mt-0.5">⚠️</span>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">
                                                                    {alert.name}
                                                                </h4>
                                                                <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                                                    Size {alert.size} &bull; <span className="font-bold text-orange-600">{alert.stock} remaining</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-black/[0.06]">
                                                <Link
                                                    href={route('inventory.index')}
                                                    onClick={() => setShowNotifications(false)}
                                                    className="w-full flex h-9 items-center justify-center rounded-xl bg-black text-[10px] font-black text-white uppercase tracking-widest transition-all duration-200 hover:bg-neutral-900 active:scale-95 shadow-sm cursor-pointer"
                                                >
                                                    Restock
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Avatar & Profile Dropdown */}
                        <div className="relative pl-1">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-black focus:outline-none"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-[10px] font-black text-white overflow-hidden shrink-0">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} 
                                            alt={user.name} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <span className="hidden sm:block max-w-[90px] truncate text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">
                                    {user?.name.split(' ')[0]}
                                </span>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {/* Dropdown Menu Backdrop */}
                            {showUserMenu && (
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            )}

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 top-full mt-2 w-52 bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-200 z-50 overflow-hidden ${
                                showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                            }`}>
                                <div className="px-4 py-3 border-b border-black/[0.06] bg-gray-50/50">
                                    <p className="text-xs font-black text-gray-900 truncate leading-none uppercase tracking-wider">{user?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 truncate mt-1 leading-none font-mono">{user?.email}</p>
                                </div>
                                <Link
                                    href={route('customer.dashboard', { tab: 'profile' })}
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black transition-colors no-underline"
                                >
                                    Profile Settings
                                </Link>
                                <Link
                                    href={route('storefront.index')}
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black transition-colors no-underline"
                                >
                                    View Storefront
                                </Link>
                                <div className="border-t border-black/[0.06]" />
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={() => setShowUserMenu(false)}
                                    className="w-full text-left block px-4 py-3 text-[11px] font-black uppercase tracking-wider transition-colors hover:bg-red-50 text-red-600"
                                >
                                    Log out
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Scrollable Area ───────────────────────────────── */}
                <main className="flex-1 overflow-y-auto bg-background animate-slide-up">
                    <div className={contentClassName}>
                        {children}
                    </div>
                </main>

            </SidebarInset>
        </MenuSideBar>
    );
};

export default AdminLayout;
