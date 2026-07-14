import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
    error:   <XCircle     className="h-5 w-5 text-red-500    shrink-0 mt-0.5" />,
    info:    <Info        className="h-5 w-5 text-blue-500   shrink-0 mt-0.5" />,
};

const styles = {
    success: 'border-emerald-200 bg-white',
    error:   'border-red-200   bg-white',
    info:    'border-blue-200  bg-white',
};

/**
 * Single auto-dismissing toast.
 */
export function Toast({ message, type = 'success', duration = 4500, onDismiss }) {
    const [visible, setVisible] = useState(false);  // controls CSS transition
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation on next frame
        requestAnimationFrame(() => setVisible(true));

        const hideTimer = setTimeout(() => dismiss(), duration);
        return () => clearTimeout(hideTimer);
    }, []);

    const dismiss = () => {
        setLeaving(true);
        setTimeout(() => onDismiss(), 350);
    };

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`
                flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl shadow-black/5
                transition-all duration-300 ease-out
                ${styles[type] ?? styles.info}
                ${visible && !leaving ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
            `}
        >
            {icons[type] ?? icons.info}
            <span className="flex-1 text-sm font-medium text-neutral-800 leading-snug">{message}</span>
            <button
                onClick={dismiss}
                className="ml-1 shrink-0 rounded-lg p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

/**
 * ToastContainer reads Inertia flash props and renders toasts.
 * Usage: place once inside a layout.
 */
export default function ToastContainer({ flash }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type) => {
        if (!message) return;
        setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // React to Inertia flash changes
    useEffect(() => {
        if (flash?.success) addToast(flash.success, 'success');
        if (flash?.error)   addToast(flash.error,   'error');
    }, [flash?.success, flash?.error]);

    // React to custom client-side window events
    useEffect(() => {
        const handleClientToast = (e) => {
            if (e.detail?.message) {
                addToast(e.detail.message, e.detail.type || 'success');
            }
        };
        window.addEventListener('toast', handleClientToast);
        return () => {
            window.removeEventListener('toast', handleClientToast);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-label="Notifications"
            className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none"
        >
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast
                        message={t.message}
                        type={t.type}
                        onDismiss={() => removeToast(t.id)}
                    />
                </div>
            ))}
        </div>
    );
}
