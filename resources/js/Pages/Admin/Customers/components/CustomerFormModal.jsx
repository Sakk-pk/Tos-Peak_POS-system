import React, { useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { X, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

export default function CustomerFormModal({ show, onClose, customer = null }) {
    const isEdit = Boolean(customer?.id);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        status: 'Active',
        password: '',
    });

    useEffect(() => {
        if (show) {
            clearErrors();
            if (customer) {
                setData({
                    name: customer.name || '',
                    email: customer.email || '',
                    phone: customer.phone === 'N/A' ? '' : (customer.phone || ''),
                    status: customer.status || 'Active',
                    password: '',
                });
            } else {
                setData({
                    name: '',
                    email: '',
                    phone: '',
                    status: 'Active',
                    password: '',
                });
            }
        }
    }, [show, customer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('customers.update', customer.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 text-xs text-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                            <User size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                {isEdit ? 'Edit Customer' : 'Add New Customer'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isEdit ? 'Update account details and access status.' : 'Register a new customer account.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John Doe"
                                required
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        {errors.name && <p className="mt-1 text-xs font-medium text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="john@example.com"
                                required
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs font-medium text-rose-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+855 12 345 678"
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs font-medium text-rose-500">{errors.phone}</p>}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Account Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {errors.status && <p className="mt-1 text-xs font-medium text-rose-500">{errors.status}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isEdit ? 'New Password (leave blank to keep current)' : 'Password'} {!isEdit && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={isEdit ? '••••••••' : 'Enter password'}
                                required={!isEdit}
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        {errors.password && <p className="mt-1 text-xs font-medium text-rose-500">{errors.password}</p>}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95 duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-9 rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-black transition active:scale-95 duration-200 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <CheckCircle2 size={15} />
                            {isEdit ? 'Save Changes' : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
