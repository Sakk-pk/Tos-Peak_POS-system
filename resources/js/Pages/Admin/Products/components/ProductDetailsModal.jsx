import Modal from '@/Components/Modal';
import { X, Loader2, Tag, Layers, Footprints } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductDetailsModal({ show, onClose, productId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!show || !productId) {
            setData(null);
            setError('');
            return;
        }

        setLoading(true);
        setError('');

        fetch(route('products.variants', productId))
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch product details.');
                }
                return res.json();
            })
            .then((json) => {
                setData(json);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || 'An error occurred while loading details.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [show, productId]);

    // Group variants by color
    const groupedByColor = data?.variants
        ? data.variants.reduce((acc, variant) => {
              const colorId = variant.color.id || 'default';
              const colorName = variant.color.name;
              const colorValue = variant.color.value;

              if (!acc[colorId]) {
                  acc[colorId] = {
                      name: colorName,
                      value: colorValue,
                      totalStock: 0,
                      sizes: [],
                  };
              }
              acc[colorId].sizes.push(variant);
              acc[colorId].totalStock += variant.stock;
              return acc;
          }, {})
        : {};

    const imageSrc = data?.image
        ? (data.image.startsWith('http') || data.image.startsWith('/'))
            ? data.image
            : `/storage/${data.image}`
        : '';

    const formatPrice = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="relative overflow-hidden rounded-2xl bg-[#F8F6F4] text-[#111111]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4B2E2B]/10 text-[#4B2E2B]">
                            <Footprints className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-bold text-[#4B2E2B]">Product Details</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-black/40 hover:bg-black/5 hover:text-black/70 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[75vh] overflow-y-auto p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-black/50">
                            <Loader2 className="h-10 w-10 animate-spin text-[#4B2E2B]" />
                            <span className="mt-3 text-sm font-semibold">Loading stock details...</span>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}

                    {!loading && !error && data && (
                        <div className="space-y-6">
                            {/* Product Info Block */}
                            <div className="grid gap-6 md:grid-cols-3 bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                                <div className="aspect-square w-full overflow-hidden rounded-xl bg-black/5 border border-black/5 flex items-center justify-center">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={data.product_name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Footprints className="h-16 w-16 text-black/15" />
                                    )}
                                </div>
                                <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {data.brand && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-[#D9A066]/10 px-2 py-0.5 text-xs font-bold text-[#4B2E2B]">
                                                    <Tag className="h-3 w-3" />
                                                    {data.brand}
                                                </span>
                                            )}
                                            {data.category && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-black/5 px-2 py-0.5 text-xs font-bold text-black/60">
                                                    <Layers className="h-3 w-3" />
                                                    {data.category}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="mt-2 text-2xl font-bold text-black leading-tight">
                                            {data.product_name}
                                        </h4>
                                        <p className="mt-2 text-sm text-black/60 font-medium leading-relaxed">
                                            {data.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="border-t border-black/5 pt-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-black/50">Unit Price</span>
                                        <span className="text-xl font-extrabold text-[#4B2E2B]">
                                            {formatPrice(data.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Breakdown */}
                            <div className="space-y-4">
                                <h5 className="text-sm font-bold uppercase tracking-wider text-black/45">
                                    Color & Size Inventory Breakdown
                                </h5>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {Object.entries(groupedByColor).map(([colorId, details]) => {
                                        const totalStock = details.totalStock;
                                        const isLowColorStock = totalStock <= 20;

                                        return (
                                            <div
                                                key={colorId}
                                                className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-4 flex flex-col justify-between"
                                            >
                                                {/* Color header */}
                                                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
                                                            style={{ backgroundColor: details.value }}
                                                        />
                                                        <span className="font-bold text-black text-base">
                                                            {details.name}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                                            totalStock === 0
                                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                                : isLowColorStock
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        }`}
                                                    >
                                                        {totalStock} in stock
                                                    </span>
                                                </div>

                                                {/* Sizes list */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    {details.sizes
                                                        .sort((a, b) => {
                                                            const aNum = parseFloat(a.size.name);
                                                            const bNum = parseFloat(b.size.name);
                                                            return isNaN(aNum) || isNaN(bNum)
                                                                ? a.size.name.localeCompare(b.size.name)
                                                                : aNum - bNum;
                                                        })
                                                        .map((v) => {
                                                            const isOutOfStock = v.stock === 0;
                                                            const isLowStock = v.stock > 0 && v.stock <= 5;

                                                            return (
                                                                <div
                                                                    key={v.id}
                                                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                                                                        isOutOfStock
                                                                            ? 'bg-red-50/20 border-red-100/50 text-red-700/60'
                                                                            : isLowStock
                                                                            ? 'bg-amber-50/40 border-amber-100 text-amber-800'
                                                                            : 'bg-gray-50 border-black/5 text-black'
                                                                    }`}
                                                                >
                                                                    <span className="text-xs font-semibold text-black/40">
                                                                        Size
                                                                    </span>
                                                                    <span className="text-sm font-bold">
                                                                        {v.size.name}
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs font-extrabold mt-1 ${
                                                                            isOutOfStock
                                                                                ? 'text-red-500'
                                                                                : isLowStock
                                                                                ? 'text-amber-600'
                                                                                : 'text-[#4B2E2B]'
                                                                        }`}
                                                                    >
                                                                        {v.stock} pcs
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {Object.keys(groupedByColor).length === 0 && (
                                        <div className="col-span-2 text-center py-6 text-sm text-black/40 font-medium">
                                            No variants found for this product.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-black/5 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50 active:bg-gray-100 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
