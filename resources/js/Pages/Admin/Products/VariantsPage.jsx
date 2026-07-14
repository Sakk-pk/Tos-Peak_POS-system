import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    Search,
    Layers,
    Package,
    AlertTriangle,
    XCircle,
    Check,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import axios from 'axios';

// Helper to format currency
function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function VariantsPage({ products: initialProducts = [] }) {
    // Keep products in local state to allow fast optimistic UI updates
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Track saving status per variant: { [variantId]: 'idle' | 'saving' | 'saved' | 'error' }
    const [savingStatus, setSavingStatus] = useState({});

    // Filter products based on search term (matches product name or subcategory)
    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return products;

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.sub_category.toLowerCase().includes(query)
            );
        });
    }, [products, searchTerm]);

    // Calculate dashboard statistics
    const stats = useMemo(() => {
        let totalProductsCount = products.length;
        let totalVariantsCount = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalStockValue = 0;

        products.forEach((product) => {
            product.variants.forEach((v) => {
                totalVariantsCount++;
                if (v.stock === 0) {
                    outOfStockCount++;
                } else if (v.stock <= 20) {
                    lowStockCount++;
                }
                totalStockValue += (v.price * v.stock);
            });
        });

        return {
            totalProducts: totalProductsCount,
            totalVariants: totalVariantsCount,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            stockValue: totalStockValue,
        };
    }, [products]);

    // Handle input stock value change locally for instant response
    const handleStockChange = (productName, variant, value) => {
        const numericValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);

        setProducts((prevProducts) =>
            prevProducts.map((p) => {
                if (p.name === productName) {
                    return {
                        ...p,
                        variants: p.variants.map((v) =>
                            v.color_id === variant.color_id && v.size_id === variant.size_id
                                ? { ...v, stock: numericValue }
                                : v
                        ),
                    };
                }
                return p;
            })
        );
    };

    // Save stock value to the backend (or create new variant)
    const handleSaveStock = async (productName, variant, stockValue) => {
        const stock = stockValue === '' ? 0 : parseInt(stockValue);
        const variantKey = variant.id ? String(variant.id) : `${productName}-${variant.color_id}-${variant.size_id}`;

        // Don't trigger save if state is already saving
        if (savingStatus[variantKey] === 'saving') return;

        setSavingStatus((prev) => ({ ...prev, [variantKey]: 'saving' }));

        try {
            const payload = variant.exists
                ? { id: variant.id, stock }
                : {
                      product_name: productName,
                      color_id: variant.color_id,
                      size_id: variant.size_id,
                      stock,
                  };

            const response = await axios.post(route('variants.update-stock'), payload);

            // If a new variant was created on the backend, update the local state with its new ID
            if (!variant.exists && response.data.id) {
                setProducts((prevProducts) =>
                    prevProducts.map((p) => {
                        if (p.name === productName) {
                            return {
                                ...p,
                                variants: p.variants.map((v) =>
                                    v.color_id === variant.color_id && v.size_id === variant.size_id
                                        ? { ...v, id: response.data.id, exists: true }
                                        : v
                                ),
                            };
                        }
                        return p;
                    })
                );

                const newId = String(response.data.id);
                setSavingStatus((prev) => {
                    const next = { ...prev };
                    delete next[variantKey];
                    next[newId] = 'saved';
                    return next;
                });

                setTimeout(() => {
                    setSavingStatus((prev) => ({ ...prev, [newId]: 'idle' }));
                }, 1800);
            } else {
                setSavingStatus((prev) => ({ ...prev, [variantKey]: 'saved' }));

                setTimeout(() => {
                    setSavingStatus((prev) => ({ ...prev, [variantKey]: 'idle' }));
                }, 1800);
            }
        } catch (error) {
            console.error('Failed to update stock:', error);
            setSavingStatus((prev) => ({ ...prev, [variantKey]: 'error' }));
        }
    };

    // Helper to get status badge classes and label based on stock
    const getStatusDetails = (stock) => {
        if (stock === 0) {
            return {
                label: 'Out',
                classes: 'bg-[#ef4444] text-white px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm',
            };
        }
        if (stock <= 20) {
            return {
                label: 'Low',
                classes: 'bg-[#fef3c7] text-[#b45309] px-2.5 py-1 text-xs font-semibold rounded-full border border-[#fde68a]',
            };
        }
        return {
            label: 'In stock',
            classes: 'bg-[#e6f4ea] text-[#137333] px-2.5 py-1 text-xs font-semibold rounded-full',
        };
    };

    return (
        <AdminLayout navbarTitle="Product Variants" contentClassName="px-4 pb-6 pt-2">
            <Head title="Product Variants" />

            <div className="mx-auto w-full max-w-7xl space-y-6 text-[#111111]">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product Variants</h2>
                        <p className="text-sm text-gray-500">Edit size, color and stock per variant.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search variants..."
                            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* Total Products */}
                    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</p>
                                <h4 className="text-xl font-bold text-gray-900">{stats.totalProducts}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Total Variants */}
                    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:scale-105">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Variants</p>
                                <h4 className="text-xl font-bold text-gray-900">{stats.totalVariants}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock</p>
                                <h4 className="text-xl font-bold text-gray-900">{stats.lowStock}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Out of Stock */}
                    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:scale-105">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Out of Stock</p>
                                <h4 className="text-xl font-bold text-gray-900">{stats.outOfStock}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variants List Section */}
                <div className="space-y-6">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                            const imageSrc = product.image
                                ? (product.image.startsWith('http') || product.image.startsWith('/'))
                                    ? product.image
                                    : `/storage/${product.image}`
                                : '';

                            return (
                                <div
                                    key={product.name}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                                >
                                    {/* Product Header Row */}
                                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                                        <div className="flex items-center gap-4">
                                            {/* Product Image */}
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement.innerHTML = '<span class="text-gray-400 font-bold">P</span>';
                                                        }}
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                )}
                                            </div>
                                            
                                            {/* Name and Metadata */}
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                                    {product.sub_category} <span className="text-gray-300 mx-1.5">•</span> {formatPrice(product.price)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Variants count badge */}
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                                            {product.variants.length} variants
                                        </span>
                                    </div>

                                    {/* Table of Variants */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Size
                                                    </th>
                                                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Color
                                                    </th>
                                                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Stock
                                                    </th>
                                                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {product.variants.map((variant) => {
                                                    const status = getStatusDetails(variant.stock);
                                                    const variantKey = variant.id ? String(variant.id) : `${product.name}-${variant.color_id}-${variant.size_id}`;

                                                    return (
                                                        <tr
                                                            key={variantKey}
                                                            className="group transition-colors hover:bg-gray-50/30"
                                                        >
                                                            {/* Size column */}
                                                            <td className="px-6 py-2 text-sm font-bold text-gray-950">
                                                                {variant.size}
                                                            </td>
                                                            
                                                            {/* Color column */}
                                                            <td className="px-6 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                                                                        style={{
                                                                            backgroundColor: variant.color.value,
                                                                        }}
                                                                    />
                                                                    <span className="text-sm font-semibold text-gray-700">
                                                                        {variant.color.name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            
                                                            {/* Stock Input column */}
                                                            <td className="px-6 py-2">
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={variant.stock}
                                                                        onChange={(e) =>
                                                                            handleStockChange(
                                                                                product.name,
                                                                                variant,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        onBlur={() =>
                                                                            handleSaveStock(
                                                                                product.name,
                                                                                variant,
                                                                                variant.stock
                                                                            )
                                                                        }
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.currentTarget.blur();
                                                                            }
                                                                        }}
                                                                        className="h-[34px] w-24 rounded-lg border border-gray-200 bg-white px-3 py-1 text-center text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                                                                    />

                                                                    {/* Saving / Save feedback indicators */}
                                                                    <div className="w-5 flex items-center justify-center">
                                                                        {savingStatus[variantKey] === 'saving' && (
                                                                            <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-500" />
                                                                        )}
                                                                        {savingStatus[variantKey] === 'saved' && (
                                                                            <Check className="h-4.5 w-4.5 text-emerald-500" />
                                                                        )}
                                                                        {savingStatus[variantKey] === 'error' && (
                                                                            <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            
                                                            {/* Status column */}
                                                            <td className="px-6 py-2">
                                                                <span className={status.classes}>
                                                                    {status.label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-12 text-center">
                            <Layers className="h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-bold text-gray-700">No variants found</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Try adjusting your search term to find what you are looking for.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
