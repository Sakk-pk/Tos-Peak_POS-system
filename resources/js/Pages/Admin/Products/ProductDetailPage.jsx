import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Edit, Eye, ShieldCheck, AlertTriangle, Boxes, Tag, Package } from 'lucide-react';
import ProductFormModal from './components/ProductFormModal';
import ProductDetailsModal from './components/ProductDetailsModal';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function ProductDetailPage({
    product,
    variants = [],
    categories = [],
    subCategories = [],
    colors = [],
    brands = [],
    sizes = [],
}) {
    const headTitle = `${product.name} - Variants Manager`;

    const sortedVariants = useMemo(() => {
        return [...variants].sort((a, b) => {
            const colorA = a.color?.name || '';
            const colorB = b.color?.name || '';
            const colorCompare = colorA.localeCompare(colorB);
            if (colorCompare !== 0) return colorCompare;
            
            const sizeA = parseFloat(a.size?.name || '0');
            const sizeB = parseFloat(b.size?.name || '0');
            return sizeA - sizeB;
        });
    }, [variants]);

    const groupedVariantsByColor = useMemo(() => {
        const groups = {};
        sortedVariants.forEach((v) => {
            const colorId = v.color_id || 'no-color';
            const colorName = v.color?.name || 'Default';
            const colorHex = v.color?.value || '';
            
            if (!groups[colorId]) {
                groups[colorId] = {
                    colorId,
                    colorName,
                    colorHex,
                    items: [],
                };
            }
            groups[colorId].items.push(v);
        });
        return Object.values(groups);
    }, [sortedVariants]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewProductId, setViewProductId] = useState(null);
    const [isVariantOnly, setIsVariantOnly] = useState(false);

    const { data, setData, post, reset, processing, errors } = useForm({
        name: product.name,
        description: product.description || '',
        category_id: String(product.category_id || categories[0]?.id || ''),
        sub_category_id: String(product.sub_category_id || subCategories[0]?.id || ''),
        color_id: String(colors[0]?.id ?? ''),
        brand_id: String(product.brand_id || brands[0]?.id || ''),
        size_id: String(sizes[0]?.id ?? ''),
        price: product.price,
        stock: '',
        low_stock_threshold: 5,
        low_stock_alert_enabled: true,
        image: null,
    });

    const categoryOptions = useMemo(() => categories.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [categories]);
    const subCategoryOptions = useMemo(() => subCategories.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [subCategories]);
    const colorOptions = useMemo(() => colors.map((item) => ({
        value: String(item.id),
        label: item.name,
        colorValue: item.value,
    })), [colors]);
    const brandOptions = useMemo(() => brands.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [brands]);
    const sizeOptions = useMemo(() => sizes.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [sizes]);

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const lowStockCount = variants.filter((v) => v.stock <= (v.low_stock_threshold ?? 5)).length;

    const imageSrc = product.image
        ? (product.image.startsWith('http') || product.image.startsWith('/'))
            ? product.image
            : `/storage/${product.image}`
        : '';

    const openAddModal = () => {
        setIsVariantOnly(true);
        setIsEditing(false);
        setEditingProductId(null);
        reset();
        // Prefill variants fields from parent
        setData({
            name: product.name,
            description: product.description || '',
            category_id: String(product.category_id || categories[0]?.id || ''),
            sub_category_id: String(product.sub_category_id || subCategories[0]?.id || ''),
            color_id: String(colors[0]?.id ?? ''),
            brand_id: String(product.brand_id || brands[0]?.id || ''),
            size_id: String(sizes[0]?.id ?? ''),
            price: product.price,
            stock: '',
            low_stock_threshold: 5,
            low_stock_alert_enabled: true,
            image: null,
        });
        setShowAddModal(true);
    };

    const openEditModal = (v) => {
        const isBaseEdit = v.id === product.id;
        setIsVariantOnly(!isBaseEdit);
        setIsEditing(true);
        setEditingProductId(v.id);
        
        setData({
            name: v.name,
            description: v.description || '',
            category_id: String(v.category_id || v.category?.id || ''),
            sub_category_id: String(v.sub_category_id || v.sub_category?.id || ''),
            color_id: String(v.color_id || v.color?.id || ''),
            brand_id: String(v.brand_id || v.brand?.id || ''),
            size_id: String(v.size_id || v.size?.id || ''),
            price: v.price,
            stock: v.stock,
            low_stock_threshold: v.low_stock_threshold ?? 5,
            low_stock_alert_enabled: v.low_stock_alert_enabled !== false,
            image: v.image,
        });
        
        setShowAddModal(true);
    };

    const handleDeleteProduct = (v) => {
        if (confirm(`Are you sure you want to delete this variant (${v.color?.name ?? 'N/A'} - Size ${v.size?.name ?? 'N/A'})?`)) {
            router.delete(route('products.destroy', v.id), {
                preserveScroll: true,
                onSuccess: () => {
                    // If we deleted the active variant itself and no variants remain, redirect back to index
                    if (variants.length <= 1) {
                        router.visit(route('products.index'));
                    }
                }
            });
        }
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const openViewModal = (v) => {
        setViewProductId(v.id);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewProductId(null);
    };

    const handleCreateProduct = (event) => {
        event.preventDefault();

        if (isEditing) {
            post(route('products.update', editingProductId) + '?_method=PATCH', {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    closeAddModal();
                    reset();
                },
            });
        } else {
            post(route('products.store'), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    closeAddModal();
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout navbarTitle="Product Details" contentClassName="px-8 py-6 space-y-6">
            <Head title={headTitle} />

            {/* Back to Products */}
            <div>
                <Link
                    href={route('products.index')}
                    className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to products catalog
                </Link>
            </div>

            {/* Configurator Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
                
                {/* ── Left Side: Showcase & Info (Columns 1-5) ── */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F6F6F6] border border-gray-100 flex items-center justify-center p-6">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={product.name}
                                className="h-full w-full object-contain mix-blend-multiply transition-all duration-300 scale-[0.85]"
                            />
                        ) : (
                            <div className="text-xs font-mono font-bold text-foreground/30">NO IMAGE AVAILABLE</div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            {product.brand?.name && (
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono">
                                    {product.brand.name}
                                </span>
                            )}
                            <span className="inline-flex rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-foreground/50 border border-black/[0.04]">
                                {product.category?.name || 'Uncategorized'}
                            </span>
                        </div>

                        <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-xs leading-relaxed text-gray-500 font-medium">
                            {product.description || 'No description available for this shoe model.'}
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div className="bg-gray-50/50 rounded-xl p-3 border border-black/[0.02]">
                            <span className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-wider block">Total Stock</span>
                            <span className="text-md font-black font-mono text-gray-900 mt-1 block">{totalStock} units</span>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl p-3 border border-black/[0.02]">
                            <span className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-wider block">Variants Count</span>
                            <span className="text-md font-black font-mono text-gray-900 mt-1 block">{variants.length} sizes/colors</span>
                        </div>
                    </div>
                </div>

                {/* ── Right Side: Variant Manager List (Columns 7-12) ── */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black font-mono uppercase text-gray-900">Manage Variants</h2>
                            <p className="text-[11px] text-gray-400">Configure sizes, colors, pricing and stock levels.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openEditModal(product)}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-black/8 bg-white px-4 text-xs font-bold text-gray-700 uppercase tracking-wider transition hover:bg-gray-50 active:scale-95 shadow-sm"
                            >
                                <Edit size={14} />
                                Edit Product Info
                            </button>
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#e11d2a] px-4 text-xs font-bold text-white uppercase tracking-wider transition hover:bg-[#c91823] active:scale-95 shadow-sm"
                            >
                                <Plus size={14} />
                                Add Variant
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {groupedVariantsByColor.map((group) => (
                            <div 
                                key={group.colorId} 
                                className="border border-black/5 rounded-xl bg-white overflow-hidden shadow-sm"
                            >
                                {/* Header for Color Group */}
                                <div className="flex items-center justify-between bg-gray-50/50 px-5 py-3 border-b border-black/5">
                                    <div className="flex items-center gap-2">
                                        {group.colorHex && (
                                            <div
                                                className="h-4 w-4 rounded-full border border-black/15 shadow-sm"
                                                style={{ backgroundColor: group.colorHex }}
                                            />
                                        )}
                                        <span className="text-xs font-black font-mono text-gray-800 uppercase tracking-wider">
                                            {group.colorName}
                                        </span>
                                        <span className="text-[11px] text-gray-400 font-bold bg-white px-2 py-0.5 rounded border border-black/[0.04]">
                                            {group.items.length} size{group.items.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Variants inside this Color */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-black/5 bg-white text-[9px] font-bold font-mono uppercase tracking-widest text-foreground/45">
                                                <th className="px-5 py-2.5">Size</th>
                                                <th className="px-5 py-2.5">Price</th>
                                                <th className="px-5 py-2.5">Stock Level</th>
                                                <th className="px-5 py-2.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            {group.items.map((v) => {
                                                const vThreshold = v.low_stock_threshold ?? 5;
                                                const vOutOfStock = v.stock === 0;
                                                const vLowStock = v.stock <= vThreshold && v.stock > 0;

                                                return (
                                                    <tr key={v.id} className="hover:bg-gray-50/30 transition">
                                                        {/* Size Badge */}
                                                        <td className="px-5 py-3 font-bold text-gray-850 font-mono text-sm">
                                                            {v.size?.name ? `US ${v.size.name}` : 'N/A'}
                                                        </td>

                                                        {/* Price */}
                                                        <td className="px-5 py-3 font-mono font-black text-gray-900">
                                                            {formatPrice(v.price)}
                                                        </td>

                                                        {/* Stock Level */}
                                                        <td className="px-5 py-3 font-mono">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${vOutOfStock ? 'bg-rose-500' : vLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                                <span className={`text-[11px] font-black ${vOutOfStock ? 'text-rose-600' : vLowStock ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                                    {vOutOfStock ? 'OUT OF STOCK' : `${v.stock} units`}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openViewModal(v)}
                                                                    className="h-7 w-7 rounded-lg border border-black/8 text-black/55 hover:bg-black/5 hover:text-black flex items-center justify-center transition"
                                                                    title="View details"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(v)}
                                                                    className="h-7 w-7 rounded-lg border border-black/8 text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 flex items-center justify-center transition"
                                                                    title="Edit variant"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteProduct(v)}
                                                                    className="h-7 w-7 rounded-lg border border-black/8 text-red-600 hover:bg-red-50/50 hover:border-red-200 flex items-center justify-center transition"
                                                                    title="Delete variant"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <ProductFormModal
                show={showAddModal}
                onClose={closeAddModal}
                onSubmit={handleCreateProduct}
                product={data}
                setProduct={setData}
                errors={errors}
                processing={processing}
                categories={categoryOptions}
                subCategories={subCategoryOptions}
                colors={colorOptions}
                brands={brandOptions}
                sizes={sizeOptions}
                isEditing={isEditing}
                isVariantOnly={isVariantOnly}
            />

            <ProductDetailsModal
                show={showViewModal}
                onClose={closeViewModal}
                productId={viewProductId}
            />
        </AdminLayout>
    );
}
