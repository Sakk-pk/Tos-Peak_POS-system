import Modal from '@/Components/Modal';
import { Package, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ProductFormModal({
    show,
    onClose,
    onSubmit,
    product,
    setProduct,
    errors = {},
    processing = false,
    categories = [],
    subCategories = [],
    colors = [],
    brands = [],
    sizes = [],
    isEditing = false,
    isVariantOnly = false,
}) {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (!product.image) {
            setPreviewUrl('');
            return undefined;
        }

        if (typeof product.image === 'string') {
            const path = product.image.startsWith('http') || product.image.startsWith('/')
                ? product.image
                : `/storage/${product.image}`;
            setPreviewUrl(path);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(product.image);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [product.image]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setProduct('image', file);
        }
    };

    useEffect(() => {
        if (show && errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const el = document.getElementById(`prod-form-${firstErrorKey}`) || 
                       document.getElementById(`prod-form-${firstErrorKey}-full`) ||
                       document.querySelector(`[name="${firstErrorKey}"]`);
            if (el) {
                setTimeout(() => {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            }
        }
    }, [errors, show]);

    return (
        <Modal show={show} onClose={onClose} maxWidth={isVariantOnly ? "md" : "2xl"}>
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 text-[#111111]">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                    {isVariantOnly 
                                        ? (isEditing ? 'Edit Variant' : 'Add Variant') 
                                        : (isEditing ? 'Edit Product' : 'Add Product')
                                    }
                                </h3>
                                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                    {isVariantOnly 
                                        ? 'Define the variant options, stock, and price.'
                                        : 'Fill in details to update your store catalog'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition duration-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="h-px w-full bg-gray-200/80 mb-5" />

                    {/* Form */}
                    <form onSubmit={onSubmit} encType="multipart/form-data">
                        {isVariantOnly ? (
                            /* Simplified Variant-Only Fields */
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Size */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Size
                                        </label>
                                        <select
                                            id="prod-form-size_id"
                                            value={product.size_id}
                                            onChange={(e) => setProduct('size_id', e.target.value)}
                                            className={`h-11 w-full rounded-xl border px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 focus:ring-4 ${
                                                errors.size_id 
                                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                            }`}
                                            required
                                        >
                                            <option value="">Select size</option>
                                            {sizes.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select>
                                        {errors.size_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.size_id}</p>}
                                    </div>

                                    {/* Color Swatch */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Color Swatch
                                        </label>
                                        <div className="flex items-center gap-2 flex-wrap p-2.5 border border-gray-200 rounded-xl bg-gray-50/50">
                                            {colors.map((item) => {
                                                const isSelected = String(product.color_id) === String(item.value);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={item.value}
                                                        onClick={() => setProduct('color_id', item.value)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${
                                                            isSelected
                                                                ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-100 shadow-sm'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {item.colorValue && (
                                                            <div
                                                                className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                                                                style={{ backgroundColor: item.colorValue }}
                                                            />
                                                        )}
                                                        {item.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.color_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.color_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Price */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Price
                                        </label>
                                        <input
                                            id="prod-form-price"
                                            type="number"
                                            step="0.01"
                                            value={product.price}
                                            onChange={(e) => setProduct('price', e.target.value)}
                                            placeholder="0.00"
                                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 ${
                                                errors.price 
                                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                            }`}
                                            required
                                        />
                                        {errors.price && <p className="mt-1 text-xs font-semibold text-red-500">{errors.price}</p>}
                                    </div>

                                    {/* Stock */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Stock
                                        </label>
                                        <input
                                            id="prod-form-stock"
                                            type="number"
                                            value={product.stock}
                                            onChange={(e) => setProduct('stock', e.target.value)}
                                            placeholder="0"
                                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 ${
                                                errors.stock 
                                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                            }`}
                                            required
                                        />
                                        {errors.stock && <p className="mt-1 text-xs font-semibold text-red-500">{errors.stock}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 items-center">
                                    {/* Low Stock Threshold */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Low Stock Threshold
                                        </label>
                                        <input
                                            type="number"
                                            value={product.low_stock_threshold || ''}
                                            onChange={(e) => setProduct('low_stock_threshold', e.target.value)}
                                            placeholder="Default: 5"
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                        />
                                        {errors.low_stock_threshold && <p className="mt-1 text-xs font-semibold text-red-500">{errors.low_stock_threshold}</p>}
                                    </div>

                                    {/* Enable Alerts */}
                                    <div className="flex items-center gap-3 h-11 mt-5">
                                        <input
                                            type="checkbox"
                                            id={`low_stock_alert_enabled_${product.id || 'new'}`}
                                            checked={product.low_stock_alert_enabled !== false}
                                            onChange={(e) => setProduct('low_stock_alert_enabled', e.target.checked)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor={`low_stock_alert_enabled_${product.id || 'new'}`} className="text-sm font-semibold text-gray-900">
                                            Enable Low Stock Alerts
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Full Product Details Form (Name, Description, Image, Category, Brand, sub-category, color, size, price, stock) */
                            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
                                {/* Left Column: Basic Info (Name, Description, Price, Stock) */}
                                <div className="space-y-4">
                                    {/* Product Name */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Product Name
                                        </label>
                                        <input
                                            id="prod-form-name"
                                            type="text"
                                            value={product.name}
                                            onChange={(e) => setProduct('name', e.target.value)}
                                            placeholder="e.g. Aero Runner"
                                            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 ${
                                                errors.name 
                                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                            }`}
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="flex flex-col">
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Description
                                        </label>
                                        <textarea
                                            id="prod-form-description"
                                            value={product.description}
                                            onChange={(e) => setProduct('description', e.target.value)}
                                            placeholder="Brief product description..."
                                            rows="4"
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 resize-none ${
                                                errors.description 
                                                    ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                            }`}
                                            required
                                        />
                                        {errors.description && <p className="mt-1 text-xs font-semibold text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Price & Stock */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Price */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Price
                                            </label>
                                            <input
                                                id="prod-form-price-full"
                                                type="number"
                                                step="0.01"
                                                value={product.price}
                                                onChange={(e) => setProduct('price', e.target.value)}
                                                placeholder="0.00"
                                                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 ${
                                                    errors.price 
                                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                                }`}
                                                required
                                            />
                                            {errors.price && <p className="mt-1 text-xs font-semibold text-red-500">{errors.price}</p>}
                                        </div>

                                        {/* Stock */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Stock
                                            </label>
                                            <input
                                                id="prod-form-stock-full"
                                                type="number"
                                                value={product.stock}
                                                onChange={(e) => setProduct('stock', e.target.value)}
                                                placeholder="0"
                                                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:ring-4 ${
                                                    errors.stock 
                                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                                }`}
                                                required
                                            />
                                            {errors.stock && <p className="mt-1 text-xs font-semibold text-red-500">{errors.stock}</p>}
                                        </div>
                                        
                                        {/* Low Stock Threshold */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Low Stock Threshold
                                            </label>
                                            <input
                                                type="number"
                                                value={product.low_stock_threshold || ''}
                                                onChange={(e) => setProduct('low_stock_threshold', e.target.value)}
                                                placeholder="Default: 5"
                                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition duration-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                            />
                                            {errors.low_stock_threshold && <p className="mt-1 text-xs font-semibold text-red-500">{errors.low_stock_threshold}</p>}
                                        </div>
                                        
                                        {/* Enable Alerts */}
                                        <div className="flex items-center gap-3 h-11 mt-1">
                                            <input
                                                type="checkbox"
                                                id={`low_stock_alert_enabled_${product.id || 'new'}`}
                                                checked={product.low_stock_alert_enabled !== false} // default true if undefined
                                                onChange={(e) => setProduct('low_stock_alert_enabled', e.target.checked)}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <label htmlFor={`low_stock_alert_enabled_${product.id || 'new'}`} className="text-sm font-semibold text-gray-900">
                                                Enable Low Stock Alerts
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Separator line (visible on md screens and up) */}
                                <div className="hidden md:block w-px bg-gray-200/80 h-full self-stretch" />

                                {/* Right Column: Image & Dropdowns */}
                                <div className="space-y-4">
                                    {/* Product Image */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                            Product Image
                                        </label>
                                        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => fileInputRef.current?.click()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        fileInputRef.current?.click();
                                                    }
                                                }}
                                                className="h-14 w-14 shrink-0 rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 cursor-pointer overflow-hidden transition duration-200"
                                            >
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Upload className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-sm font-bold text-[#e11d48] hover:text-[#be123c] block text-left transition duration-200"
                                                >
                                                    Choose File
                                                </button>
                                                <p className="text-xs text-gray-400 mt-0.5">JPG or PNG formats</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        {errors.image && <p className="mt-1 text-xs font-semibold text-red-500">{errors.image}</p>}
                                    </div>

                                    {/* Selections Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Category */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Category
                                            </label>
                                            <select
                                                id="prod-form-category_id"
                                                value={product.category_id}
                                                onChange={(e) => setProduct('category_id', e.target.value)}
                                                className={`h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 focus:ring-4 ${
                                                    errors.category_id 
                                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                                }`}
                                            >
                                                <option value="">Select</option>
                                                {categories.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                            {errors.category_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.category_id}</p>}
                                        </div>

                                        {/* Sub-category */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Sub-category
                                            </label>
                                            <select
                                                value={product.sub_category_id}
                                                onChange={(e) => setProduct('sub_category_id', e.target.value)}
                                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                            >
                                                <option value="">Select</option>
                                                {subCategories.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                            {errors.sub_category_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.sub_category_id}</p>}
                                        </div>

                                        {/* Brand */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Brand
                                            </label>
                                            <select
                                                value={product.brand_id}
                                                onChange={(e) => setProduct('brand_id', e.target.value)}
                                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                            >
                                                <option value="">Select</option>
                                                {brands.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                            {errors.brand_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.brand_id}</p>}
                                        </div>

                                        {/* Color */}
                                        <div className="flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Color
                                            </label>
                                            <select
                                                value={product.color_id}
                                                onChange={(e) => setProduct('color_id', e.target.value)}
                                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                            >
                                                <option value="">Select</option>
                                                {colors.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                            {errors.color_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.color_id}</p>}
                                        </div>

                                        {/* Size (Full width of right column) */}
                                        <div className="col-span-2 flex flex-col">
                                            <label className="mb-1.5 block text-sm font-bold text-gray-900">
                                                Size
                                            </label>
                                            <select
                                                id="prod-form-size_id-full"
                                                value={product.size_id}
                                                onChange={(e) => setProduct('size_id', e.target.value)}
                                                className={`h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition duration-200 focus:ring-4 ${
                                                    errors.size_id 
                                                        ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-100' 
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-[#f97316] focus:ring-orange-100'
                                                }`}
                                            >
                                                <option value="">Select size</option>
                                                {sizes.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                            {errors.size_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.size_id}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-px w-full bg-gray-200/80 mt-6 mb-5" />

                        {/* Footer Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-11 rounded-xl border border-black/10 px-6 text-xs font-bold uppercase tracking-wider text-gray-700 bg-white transition-all duration-200 hover:bg-gray-50 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="h-11 rounded-xl bg-black px-6 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-neutral-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Product')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
