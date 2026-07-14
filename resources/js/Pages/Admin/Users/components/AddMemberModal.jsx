import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { UserPlus, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// ── Defined at module scope so React never unmounts/remounts it on re-render ──
function Field({ label, id, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-bold text-gray-600 mb-1.5">
                {label}
            </label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}


export default function AddMemberModal({ show, onClose, roles = [] }) {
    const [showPassword, setShowPassword]         = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name:                  '',
        email:                 '',
        phone:                 '',
        password:              '',
        password_confirmation: '',
        role:                  roles[0]?.name ?? '',
    });

    useEffect(() => {
        if (show && errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const elementId = firstErrorKey === 'password_confirmation' ? 'add-password-confirm' : `add-${firstErrorKey}`;
            const el = document.getElementById(elementId);
            if (el) {
                setTimeout(() => {
                    el.focus();
                }, 50);
            }
        }
    }, [errors, show]);

    const handleClose = () => {
        reset();
        setShowPassword(false);
        setShowPasswordConfirm(false);
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    const inputClass = (hasError) =>
        `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 outline-none transitionplaceholder:text-gray-400 focus:ring-4 ${
            hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-[#f97316] focus:ring-orange-100'
        }`;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-6 text-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 border-b border-black/[0.06] pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-display uppercase tracking-wider text-gray-900">Add Team Member</h2>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">Create an account and assign a role immediately.</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={submit} autoComplete="off" className="space-y-4">
                    {/* Name */}
                    <Field label="Full Name" id="add-name" error={errors.name}>
                        <input
                            id="add-name"
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g. Sokha Chan"
                            className={inputClass(errors.name)}
                            autoComplete="off"
                        />
                    </Field>

                    {/* Email */}
                    <Field label="Email Address" id="add-email" error={errors.email}>
                        <input
                            id="add-email"
                            type="text"
                            inputMode="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="sokha@example.com"
                            className={inputClass(errors.email)}
                            autoComplete="off"
                        />
                    </Field>

                    {/* Phone */}
                    <Field label="Phone Number (optional)" id="add-phone" error={errors.phone}>
                        <input
                            id="add-phone"
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            placeholder="+855 12 345 678"
                            className={inputClass(errors.phone)}
                            autoComplete="off"
                        />
                    </Field>

                    {/* Role */}
                    <Field label="Role" id="add-role" error={errors.role}>
                        <select
                            id="add-role"
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className={inputClass(errors.role) + ' appearance-none bg-white'}
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </Field>

                    {/* Password row */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Password" id="add-password" error={errors.password}>
                            <div className="relative">
                                <input
                                    id="add-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className={inputClass(errors.password) + ' pr-10'}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </Field>

                        <Field label="Confirm Password" id="add-password-confirm" error={errors.password_confirmation}>
                            <div className="relative">
                                <input
                                    id="add-password-confirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat password"
                                    className={inputClass(errors.password_confirmation) + ' pr-10'}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                                >
                                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </Field>
                    </div>

                    {/* Info note */}
                    <p className="rounded-xl bg-orange-50/50 px-3.5 py-2.5 text-[11px] text-[#f97316] font-semibold border border-orange-100/50">
                        💡 The member will be able to log in immediately using these credentials.
                        Share the password with them securely.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-black/[0.06] pt-4 mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200 bg-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 transition active:scale-95 duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Adding…
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Add Member
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
