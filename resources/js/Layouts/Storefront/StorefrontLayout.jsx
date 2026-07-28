import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import ToastContainer from '@/Components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileDrawer from './components/ProfileDrawer';

/**
 * StorefrontLayout — Public-facing layout for the customer shopping experience.
 * No admin sidebar. No admin controls. Clean, premium e-commerce navbar.
 */
export default function StorefrontLayout({ children, title = 'TOS-PEAK' }) {
    const { auth, flash, categories = [] } = usePage().props;
    const user = auth?.user;
    const can = auth?.can ?? {};
    // Switch-to-Dashboard button is Admin-only.
    // role_names is a lean string[] shared by HandleInertiaRequests.
    // This is a UI-only check — authorization is still enforced by route middleware.
    const isAdmin = Boolean(user?.is_team_member || user?.role_names?.includes('Admin') || user?.role_names?.includes('Manager'));
    const staffDashboardUrl = '/dashboard';

    const [showUserDrawer, setShowUserDrawer] = useState(false);

    const { url } = usePage();

    const activeCategory = useMemo(() => {
        try {
            const searchParams = new URL(url, window.location.origin).searchParams;
            return searchParams.get('category') || 'All';
        } catch {
            return 'All';
        }
    }, [url]);

    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900">
            <Head title={title} />

            {/* Navigation Header */}
            <Header
                user={user}
                activeCategory={activeCategory}
                categories={categories}
                isAdmin={isAdmin}
                staffDashboardUrl={staffDashboardUrl}
                setShowUserDrawer={setShowUserDrawer}
            />

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Member Drawer */}
            <ProfileDrawer
                showUserDrawer={showUserDrawer}
                setShowUserDrawer={setShowUserDrawer}
                user={user}
            />

            {/* Flash toasts */}
            <ToastContainer flash={flash} />
        </div>
    );
}
