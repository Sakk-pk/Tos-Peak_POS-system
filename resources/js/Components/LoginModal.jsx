import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { X, Loader2, Eye, EyeOff, Lock, ShoppingBag } from 'lucide-react';

/**
 * LoginModal
 *
 * Renders an inline login overlay when a guest tries a protected action
 * (Add to Cart, Wishlist, Checkout).
 *
 * Props:
 *   isOpen       — boolean
 *   onClose      — () => void
 *   redirectTo   — URL to restore after login (defaults to current page)
 *   message      — optional headline message (e.g. "Sign in to add to your cart")
 */
export default function LoginModal({
    isOpen = false,
    onClose,
    redirectTo = null,
    message = 'Sign in to continue',
}) {
    const { props: pageProps } = usePage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const emailRef = useRef(null);

    // Focus email field when modal opens
    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setTimeout(() => emailRef.current?.focus(), 80);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        if (redirectTo) {
            sessionStorage.setItem('_tp_intended', redirectTo);
        }

        router.post(
            route('login'),
            { email, password, remember, redirect_to: redirectTo },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setProcessing(false);
                    onClose?.();
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    if (!isOpen) return null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Sign in to continue"
        >
            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
                {/* Header bar */}
                <div className="relative bg-gradient-to-br from-gray-950 to-gray-800 px-8 py-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                            TOS-PEAK
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-white leading-snug">
                        {message}
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        New here?{' '}
                        <a
                            href={route('login')}
                            className="text-white/80 underline underline-offset-2 hover:text-white transition"
                        >
                            Go to full login page
                        </a>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                    {/* Global error */}
                    {errors.email && !errors.password && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {errors.email}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="modal-email"
                            className="block text-xs font-bold uppercase tracking-widest text-gray-500"
                        >
                            Email address
                        </label>
                        <input
                            ref={emailRef}
                            id="modal-email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 ${
                                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-gray-300 focus:bg-white'
                            }`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="modal-password"
                                className="block text-xs font-bold uppercase tracking-widest text-gray-500"
                            >
                                Password
                            </label>
                            <a
                                href={route('password.request')}
                                className="text-xs text-gray-400 hover:text-gray-700 transition"
                            >
                                Forgot?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                id="modal-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 ${
                                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-gray-300 focus:bg-white'
                                }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember me */}
                    <label htmlFor="modal-remember" className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            id="modal-remember"
                            name="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800 active:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Lock className="h-4 w-4" />
                                Sign in
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-gray-400">
                                or
                            </span>
                        </div>
                    </div>

                    {/* Google */}
                    <a
                        href={route('google.redirect')}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                            G
                        </span>
                        Continue with Google
                    </a>
                </form>
            </div>
        </div>
    );
}
