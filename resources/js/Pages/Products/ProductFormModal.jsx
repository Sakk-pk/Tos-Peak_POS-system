import Modal from '@/Components/Modal';
import { ImagePlus, Upload, X } from 'lucide-react';
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
}) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (!product.image || typeof product.image === 'string') {
            setPreviewUrl('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(product.image);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [product.image]);

    const setImageFile = (file) => {
        if (!file) {
            setProduct('image', null);
            return;
        }

        setProduct('image', file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 max-h-[90vh] overflow-y-auto">
                <div className="p-6 lg:p-8">
                    <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-black/55 shadow-sm shadow-black/5">
                                Catalog management
                            </div>
                            <h3 className="mt-4 text-2xl font-bold text-black">Add Product</h3>
                            <p className="mt-1 text-sm text-black/55">Single-panel layout for cleaner form flow.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-black/60 transition-all hover:bg-black/5 hover:text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="mt-6 space-y-6" encType="multipart/form-data">
                        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm shadow-black/5">
                            <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/8 pb-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Basic info</p>
                                    <h4 className="mt-1 text-lg font-bold text-black">Product details</h4>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-black">Product Name</label>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => setProduct('name', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                        placeholder="e.g. Aero Runner"
                                        required
                                    />
                                    {errors.name ? <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p> : null}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-black">Description</label>
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => setProduct('description', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                        placeholder="Brief product description"
                                        rows="3"
                                        required
                                    />
                                    {errors.description ? <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={product.price}
                                        onChange={(e) => setProduct('price', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price ? <p className="mt-1 text-xs font-medium text-red-500">{errors.price}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Stock</label>
                                    <input
                                        type="number"
                                        value={product.stock}
                                        onChange={(e) => setProduct('stock', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                        placeholder="0"
                                        required
                                    />
                                    {errors.stock ? <p className="mt-1 text-xs font-medium text-red-500">{errors.stock}</p> : null}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm shadow-black/5">
                            <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/8 pb-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Catalog selections</p>
                                    <h4 className="mt-1 text-lg font-bold text-black">Assign catalog values</h4>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Category</label>
                                    <select
                                        value={product.category_id}
                                        onChange={(e) => setProduct('category_id', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.category_id ? <p className="mt-1 text-xs font-medium text-red-500">{errors.category_id}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Sub-category</label>
                                    <select
                                        value={product.sub_category_id}
                                        onChange={(e) => setProduct('sub_category_id', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                    >
                                        <option value="">Select sub-category</option>
                                        {subCategories.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.sub_category_id ? <p className="mt-1 text-xs font-medium text-red-500">{errors.sub_category_id}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Brand</label>
                                    <select
                                        value={product.brand_id}
                                        onChange={(e) => setProduct('brand_id', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.brand_id ? <p className="mt-1 text-xs font-medium text-red-500">{errors.brand_id}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Color</label>
                                    <select
                                        value={product.color_id}
                                        onChange={(e) => setProduct('color_id', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                    >
                                        <option value="">Select color</option>
                                        {colors.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.color_id ? <p className="mt-1 text-xs font-medium text-red-500">{errors.color_id}</p> : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-black">Size</label>
                                    <select
                                        value={product.size_id}
                                        onChange={(e) => setProduct('size_id', e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition hover:border-black/15 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                                    >
                                        <option value="">Select size</option>
                                        {sizes.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.size_id ? <p className="mt-1 text-xs font-medium text-red-500">{errors.size_id}</p> : null}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm shadow-black/5">
                            <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/8 pb-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Product media</p>
                                    <h4 className="mt-1 text-lg font-bold text-black">Upload image</h4>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-6 text-center transition-all ${isDragging ? 'border-black bg-black/5' : 'border-black/15 bg-black/2 hover:bg-black/4'}`}
                            >
                                {previewUrl ? (
                                    <div className="flex w-full flex-col items-center gap-3">
                                        <img
                                            src={previewUrl}
                                            alt="Product preview"
                                            className="h-36 w-36 rounded-2xl object-cover shadow-sm"
                                        />
                                        <p className="text-sm font-medium text-black/70">Drop a different image or click to replace it</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-md shadow-black/10">
                                            {isDragging ? <ImagePlus className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-black">Drag and drop an image here</p>
                                            <p className="mt-1 text-xs text-black/50">or click to browse files</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {product.image && typeof product.image === 'string' ? (
                                <p className="mt-2 text-xs font-medium text-black/55">Current image path: {product.image}</p>
                            ) : null}
                            {errors.image ? <p className="mt-1 text-xs font-medium text-red-500">{errors.image}</p> : null}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-black/8 pt-2 sm:flex-row sm:justify-end">
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
                                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
