import React from 'react';
import Modal from '@/Components/Modal';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title = 'Delete Item',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger',
}) {
    const isDanger = variant === 'danger';
    const isWarning = variant === 'warning';

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 text-xs text-gray-900 bg-white rounded-3xl border border-black/[0.06] shadow-2xl select-none">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            isDanger
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : isWarning
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm'
                        }`}
                    >
                        {isDanger ? (
                            <Trash2 size={20} />
                        ) : isWarning ? (
                            <AlertTriangle size={20} />
                        ) : (
                            <Info size={20} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold text-black uppercase tracking-wider font-sans">
                            {title}
                        </h3>
                        <p className="mt-2 text-gray-600 font-semibold leading-relaxed text-xs">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5 border-t border-black/[0.06] pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition active:scale-95 duration-200 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition active:scale-95 duration-200 cursor-pointer ${
                            isDanger
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : isWarning
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-black hover:bg-neutral-900'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
