import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bell,
    CheckCheck,
    Trash2,
    Mail,
    UserCheck,
    Info,
    CheckCircle2,
    AlertTriangle,
    XCircle,
} from 'lucide-react';

// Icon map by notification type
function NotificationIcon({ type }) {
    const base = 'h-5 w-5';
    if (type === 'invitation_sent')     return <Mail          className={`${base} text-blue-500`}    />;
    if (type === 'invitation_accepted') return <UserCheck     className={`${base} text-emerald-500`} />;
    if (type === 'warning')             return <AlertTriangle className={`${base} text-amber-500`}   />;
    if (type === 'danger')              return <XCircle       className={`${base} text-rose-500`}    />;
    return                                     <Info          className={`${base} text-neutral-400`} />;
}

// Background + border per type
function typeBg(type) {
    if (type === 'invitation_sent')     return 'bg-blue-50    border-blue-100';
    if (type === 'invitation_accepted') return 'bg-emerald-50 border-emerald-100';
    if (type === 'warning')             return 'bg-amber-50   border-amber-100';
    if (type === 'danger')              return 'bg-rose-50    border-rose-100';
    return                                     'bg-neutral-50 border-neutral-100';
}

function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)       return 'Just now';
    if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)    return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)   return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage({ notifications = [] }) {
    const [items, setItems] = useState(notifications);

    const unread = items.filter((n) => !n.read);

    const markRead = (id) => {
        router.post(route('notifications.markRead', id), {}, {
            preserveScroll: true,
            onSuccess: () => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)),
        });
    };

    const markAllRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            preserveScroll: true,
            onSuccess: () => setItems((prev) => prev.map((n) => ({ ...n, read: true }))),
        });
    };

    const remove = (id) => {
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setItems((prev) => prev.filter((n) => n.id !== id)),
        });
    };

    return (
        <AdminLayout navbarTitle="Notifications" contentClassName="px-6 pb-6 pt-4 bg-[#F8F6F4]">
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl space-y-5 text-[#111111]">

                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <Bell className="h-6 w-6 text-neutral-500" />
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Activity log for team invitations and account events.
                        </p>
                    </div>

                    {unread.length > 0 && (
                        <button
                            onClick={markAllRead}
                            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition shadow-sm"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                            <span className="ml-0.5 rounded-full bg-[#4B2E2B]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#4B2E2B]">
                                {unread.length}
                            </span>
                        </button>
                    )}
                </div>

                {/* Notification list */}
                <div className="rounded-2xl border border-black/8 bg-white shadow-sm overflow-hidden">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
                            <CheckCircle2 className="h-10 w-10 text-neutral-200" />
                            <p className="text-sm font-medium">You're all caught up! No notifications yet.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-black/5">
                            {items.map((n) => (
                                <li
                                    key={n.id}
                                    className={`group flex items-start gap-4 px-6 py-4 transition hover:bg-neutral-50/60 ${
                                        !n.read ? 'bg-amber-50/30' : ''
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${typeBg(n.type)}`}>
                                        <NotificationIcon type={n.type} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-snug ${n.read ? 'text-neutral-600' : 'font-semibold text-neutral-900'}`}>
                                                {n.message}
                                            </p>
                                            {/* Unread dot */}
                                            {!n.read && (
                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#4B2E2B]" />
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-neutral-400">{timeAgo(n.created_at)}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                        {!n.read && (
                                            <button
                                                onClick={() => markRead(n.id)}
                                                title="Mark as read"
                                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/8 text-neutral-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => remove(n.id)}
                                            title="Delete notification"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/8 text-neutral-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
