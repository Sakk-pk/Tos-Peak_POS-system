import Modal from '@/Components/Modal';
import { Check, Palette, X } from 'lucide-react';
import { useEffect } from 'react';

const FIXED_COLORS = [
    { name: 'Black', value: '#111111' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#facc15' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
];

export default function ColorFormModal({
    show,
    onClose,
    onSubmit,
    data,
    setData,
    errors = {},
    processing,
    mode = 'add',
}) {
    useEffect(() => {
        if (show && errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const el = document.getElementById(`color-${firstErrorKey}`);
            if (el) {
                setTimeout(() => {
                    el.focus();
                }, 50);
            }
        }
    }, [errors, show]);
    const isEdit = mode === 'edit';
    const selectedValue = data.value || FIXED_COLORS[0].value;
    const colorInputValue = /^#[0-9A-Fa-f]{6}$/.test(selectedValue)
        ? selectedValue
        : FIXED_COLORS[0].value;

    const handleFixedColor = (color) => {
        setData('value', color.value);
        if (!data.name.trim()) {
            setData('name', color.name);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={onSubmit} className="overflow-hidden rounded-3xl bg-white border border-black/[0.06] shadow-2xl">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm">
                            <Palette className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-display uppercase tracking-wider text-black">{isEdit ? 'Edit Color' : 'Add Color'}</h2>
                            <p className="text-xs font-semibold text-gray-400">Choose a fixed color or customize your own.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-black/5 transition-all duration-200"
                        aria-label="Close color modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div>
                        <label htmlFor="color-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Color name
                        </label>
                        <input
                            id="color-name"
                            type="text"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Midnight Black"
                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium text-black outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-4 ${
                                errors.name
                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100'
                                    : 'border-black/10 hover:border-black/15 focus:border-[#f97316] focus:ring-orange-100'
                            }`}
                        />
                        {errors.name && (
                            <span className="mt-1 block text-xs font-semibold text-red-500">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="mb-2.5 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Fixed colors</span>
                            <span className="text-[9px] font-black uppercase tracking-wider font-display text-gray-400">Preset</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                            {FIXED_COLORS.map((color) => {
                                const isSelected = selectedValue.toLowerCase() === color.value.toLowerCase();

                                return (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => handleFixedColor(color)}
                                        className={`relative flex aspect-square items-center justify-center rounded-xl border transition ${
                                            isSelected ? 'border-orange-500 ring-4 ring-orange-100 shadow-sm' : 'border-black/10 hover:border-black/25'
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                        aria-label={`Choose ${color.name}`}
                                    >
                                        {isSelected ? (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shadow-sm">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] p-4 bg-gray-50/20">
                        <div className="mb-3.5 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Customize color</div>
                                <div className="text-[11px] font-semibold text-gray-450 mt-0.5">Pick any color or enter a hex value.</div>
                            </div>
                            <div
                                className="h-9 w-9 rounded-xl border border-black/10"
                                style={{ backgroundColor: selectedValue }}
                                aria-hidden="true"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[64px_minmax(0,1fr)]">
                            <input
                                type="color"
                                value={colorInputValue}
                                onChange={(event) => setData('value', event.target.value)}
                                className="h-11 w-16 cursor-pointer rounded-xl border border-black/10 bg-white p-1"
                                aria-label="Custom color picker"
                            />
                             <div className="flex flex-col w-full">
                                <input
                                    id="color-value"
                                    type="text"
                                    value={selectedValue}
                                    onChange={(event) => setData('value', event.target.value)}
                                    placeholder="#111111"
                                    className={`h-11 w-full rounded-xl border bg-white px-4 font-mono text-sm font-semibold uppercase text-black outline-none transition focus:ring-4 ${
                                        errors.value
                                            ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100'
                                            : 'border-black/10 hover:border-black/15 focus:border-[#f97316] focus:ring-orange-100'
                                    }`}
                                />
                                {errors.value && (
                                    <span className="mt-1 block text-xs font-semibold text-red-500">
                                        {errors.value}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-black/[0.06] px-6 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200 bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Color')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
