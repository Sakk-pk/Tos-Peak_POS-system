import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const url = typeof window !== 'undefined' ? window.location.pathname : '';
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isAdminMode = searchParams?.get('admin') === '1' || url.includes('/admin');

    const portalLabel = isAdminMode ? 'Admin Portal' : 'Member Account';
    
    let titleText = 'Sign in to continue.';
    let descText = 'A clean, project-matching entry point for users, admins, and Google sign-in.';

    if (isAdminMode) {
        titleText = 'Sign in to continue managing your workspace.';
        descText = 'Access your administrative tools, order logs, product tables, and settings.';
    } else {
        if (url.includes('/register')) {
            titleText = 'Create your member account.';
            descText = 'Join the TOS-PEAK community to save shoe wishlists, track purchases, and check out faster.';
        } else if (url.includes('/forgot-password') || url.includes('/password/reset')) {
            titleText = 'Recover your password.';
            descText = 'Enter your email address and we will mail you a link to reset your password.';
        } else {
            titleText = 'Sign in to your member account.';
            descText = 'Sign in to save your wishlist, view orders, and complete checkouts.';
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 lg:flex-row lg:items-center">
                <div className="flex flex-1 flex-col justify-center text-slate-900">
                    <Link href="/" className="inline-flex items-center gap-3 self-start rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 no-underline hover:no-underline">
                        <img
                            src="/images/Tos_Peak-Logo.png"
                            alt="TOS-PEAK"
                            className="h-11 w-11 rounded-lg object-contain"
                        />
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                                Tos Peak
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                {portalLabel}
                            </div>
                        </div>
                    </Link>

                    <div className="mt-8 max-w-xl">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                            {titleText}
                        </h1>
                        <p className="mt-4 text-base leading-7 text-gray-500 sm:text-lg">
                            {descText}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
                            Fast access
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
                            Google sign in
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
                            Mobile friendly
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center lg:max-w-lg">
                    <div className="w-full rounded-3xl border border-gray-200 bg-white p-1 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                        <div className="rounded-[1.4rem] px-6 py-8 sm:px-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
