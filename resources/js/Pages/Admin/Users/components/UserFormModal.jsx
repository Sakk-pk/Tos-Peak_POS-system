import Modal from '@/Components/Modal';
import { X, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useEffect } from 'react';

export default function UserFormModal({ 
    show, 
    onClose, 
    onSubmit, 
    data, 
    setData, 
    errors = {}, 
    processing,
    editingMember,
    roles = []
}) {
    useEffect(() => {
        if (show && errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const el = document.getElementById(`user-form-${firstErrorKey}`);
            if (el) {
                setTimeout(() => {
                    el.focus();
                }, 50);
            }
        }
    }, [errors, show]);

    return (
        <Modal show={show} onClose={onClose}>
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-black/[0.06] text-[#111111]">
                <div className="border-b border-black/[0.06] px-8 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black font-display uppercase tracking-wider text-black">Edit Staff Role</h2>
                            <p className="mt-1 text-xs font-semibold text-gray-400">
                                Update the role and dashboard permissions for this staff member.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-xl p-1.5 text-gray-450 hover:bg-black/5 hover:text-black focus:outline-none transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="px-8 py-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Full Name (Read-only) */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.name}
                                    disabled
                                    className="w-full rounded-xl border border-black/10 bg-neutral-50/75 py-2.5 pl-10 pr-3 text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                                    placeholder="Full name"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    disabled
                                    className="w-full rounded-xl border border-black/10 bg-neutral-50/75 py-2.5 pl-10 pr-3 text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                                    placeholder="Email address"
                                />
                            </div>
                        </div>

                        {/* Phone Number (Read-only) */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.phone || 'No phone number'}
                                    disabled
                                    className="w-full rounded-xl border border-black/10 bg-neutral-50/75 py-2.5 pl-10 pr-3 text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>

                        {/* Role (Editable) */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Assigned Role</label>
                            <div className="relative">
                                <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    id="user-form-role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all duration-200 outline-none focus:ring-4 ${
                                        errors.role
                                            ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100'
                                            : 'border-black/10 hover:border-black/15 focus:border-[#f97316] focus:ring-orange-100'
                                    }`}
                                >
                                    {roles.length === 0 ? (
                                        <option value="">No roles available</option>
                                    ) : (
                                        roles.map((role) => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {errors.role && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.role}</span>}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-black/[0.06] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-white transition-all hover:bg-gray-50 active:scale-95 duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

