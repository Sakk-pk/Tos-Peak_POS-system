import Modal from '@/Components/Modal';
import { X, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function InviteMemberModal({ show, onClose, roles = [] }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        role: roles[0]?.name ?? 'Manager',
    });

    useEffect(() => {
        if (show) {
            clearErrors();
            reset();
            if (roles.length > 0) {
                setData('role', roles[0].name);
            }
        }
    }, [show]);

    useEffect(() => {
        if (show && errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const el = document.getElementById(`invite-${firstErrorKey}`);
            if (el) {
                setTimeout(() => {
                    el.focus();
                }, 50);
            }
        }
    }, [errors, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('invitations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="w-full text-[#111111]">
                {/* Header */}
                <div className="border-b border-black/[0.06] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black font-display uppercase tracking-wider text-black">Invite Team Member</h2>
                            <p className="mt-1 text-xs font-semibold text-gray-400">
                                Send an invitation link to set up their team account.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-1.5 hover:bg-black/5 text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Email Address *
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="invite-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all duration-200 outline-none focus:ring-4 ${
                                    errors.email
                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100'
                                        : 'border-black/10 hover:border-black/15 focus:border-[#f97316] focus:ring-orange-100'
                                }`}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        {errors.email && (
                            <span className="mt-1 block text-xs font-semibold text-red-500">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Role Select */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Role / Position *
                        </label>
                        <div className="relative">
                            <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <select
                                id="invite-role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all duration-200 outline-none focus:ring-4 ${
                                    errors.role
                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100'
                                        : 'border-black/10 hover:border-black/15 focus:border-[#f97316] focus:ring-orange-100'
                                }`}
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.role && (
                            <span className="mt-1 block text-xs font-semibold text-red-500">
                                {errors.role}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex justify-end gap-3 border-t border-black/[0.06] mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 active:scale-95 disabled:opacity-50 transition-all duration-200"
                        >
                            {processing && <Loader2 className="h-3 w-3 animate-spin" />}
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
