import Modal from '@/Components/Modal';
import { X } from 'lucide-react';
import {
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    User,
} from 'lucide-react';

export default function UserFormModal({ 
    show, 
    onClose, 
    onSubmit, 
    data, 
    setData, 
    errors, 
    processing,
    editingMember,
    roles = []
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20">
                <div className="border-b border-black/8 px-8 py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-black">{editingMember ? 'Edit User' : 'Add New User'}</h2>
                            <p className="mt-1 text-sm text-black/55">
                                {editingMember ? 'Update the account details for this team member.' : 'Enter the account details for a new team member.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-black/60 transition-all hover:bg-black/5 hover:text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="px-8 py-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Full Name</label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Enter full name"
                                />
                            </div>
                            {errors.name && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.name}</span>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Email</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={Boolean(editingMember)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Enter email address"
                                />
                            </div>
                            {errors.email && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.email}</span>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Phone Number</label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            {errors.phone && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.phone}</span>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Role</label>
                            <div className="relative">
                                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
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

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Password</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Enter password"
                                />
                            </div>
                            {errors.password && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.password}</span>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">Confirm Password</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-black transition-all placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Confirm password"
                                />
                            </div>
                            {errors.password_confirmation && <span className="mt-1.5 block text-xs font-medium text-red-500">{errors.password_confirmation}</span>}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-black/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-gradient-to-r from-black to-black/90 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (editingMember ? 'Updating...' : 'Creating...') : (editingMember ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
