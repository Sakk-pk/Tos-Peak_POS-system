import React, { useMemo, useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Search, AlertTriangle, Tag, Package, Boxes, Eye, Check, Loader2, SlidersHorizontal, ShoppingBag, XCircle, Plus, DollarSign } from 'lucide-react';
import axios from 'axios';
import InventoryDetailsModal from './components/InventoryDetailsModal';
import InventoryProductRow from './components/InventoryProductRow';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import TableContainer from '@/Components/ui/TableContainer';
import Badge from '@/Components/ui/Badge';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function InventoryPage({
    inventory: initialItems = [],
    categories = [],
    brands = [],
}) {
    const [items, setItems] = useState(initialItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All categories');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewProductId, setViewProductId] = useState(null);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    // Modal States for stock management
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null); // 'stock-in' | 'adjust'
    const [inputQuantity, setInputQuantity] = useState(1);
    const [inputAdjustStock, setInputAdjustStock] = useState(0);
    const [processing, setProcessing] = useState(false);

    // UI toast feedback
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const categoryFilterOptions = useMemo(() => [
        'All categories',
        ...categories.map((c) => c.name),
    ], [categories]);

    const brandFilterOptions = useMemo(() => [
        'All',
        ...brands.map((b) => b.name),
    ], [brands]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return items.filter((item) => {
            const productCategoryName = item.category ?? '';
            const productBrandName = item.brand ?? '';

            const matchesCategory = category === 'All categories' || productCategoryName === category;
            const matchesBrand = selectedBrand === 'All' || productBrandName === selectedBrand;
            const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
            const matchesSearch = !normalizedSearch
                || item.name.toLowerCase().includes(normalizedSearch)
                || productCategoryName.toLowerCase().includes(normalizedSearch)
                || item.sku.toLowerCase().includes(normalizedSearch);

            return matchesCategory && matchesBrand && matchesStatus && matchesSearch;
        });
    }, [items, searchTerm, category, selectedBrand, selectedStatus]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        filteredItems.forEach(p => {
            if (!groups[p.name]) {
                groups[p.name] = {
                    id: p.id,
                    name: p.name,
                    brand: p.brand,
                    category: p.category,
                    sub_category: p.sub_category,
                    description: p.description,
                    price: p.price,
                    image: p.image,
                    variants: []
                };
            }
            groups[p.name].variants.push(p);
        });
        return Object.values(groups);
    }, [filteredItems]);

    // Stats calculations
    const stats = useMemo(() => {
        let totalItems = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalValue = 0;

        items.forEach((item) => {
            totalItems += item.stock;
            if (item.stock === 0) {
                outOfStockCount++;
            } else if (item.stock <= item.alert_level) {
                lowStockCount++;
            }
            totalValue += item.price * item.stock;
        });

        return {
            totalItems,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            totalValue,
        };
    }, [items]);

    const lowStockAlertsLocal = useMemo(() => {
        return items.filter(v => v.stock <= (v.alert_level ?? 5));
    }, [items]);

    const openViewModal = (group) => {
        setViewProductId(group.id);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewProductId(null);
    };

    // Perform Stock-In request
    const handleStockInSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setProcessing(true);
        try {
            await axios.post(route('inventory.stock-in'), {
                id: selectedItem.id,
                quantity: inputQuantity,
            });

            // Update local state optimistically
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === selectedItem.id
                        ? {
                              ...item,
                              stock: item.stock + inputQuantity,
                              status:
                                  item.stock + inputQuantity === 0
                                      ? 'Out of Stock'
                                      : item.stock + inputQuantity <= item.alert_level
                                      ? 'Low Stock'
                                      : 'In Stock',
                              last_updated: 'Just now',
                          }
                        : item
                )
            );

            showToast(`Added ${inputQuantity} units to stock for ${selectedItem.name}.`);
            setModalType(null);
            setSelectedItem(null);
            setInputQuantity(1);
        } catch (error) {
            console.error(error);
            showToast('Failed to update stock. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Perform Stock Adjustment request
    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setProcessing(true);
        try {
            await axios.post(route('inventory.adjust'), {
                id: selectedItem.id,
                quantity: inputAdjustStock,
            });

            // Update local state optimistically
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === selectedItem.id
                        ? {
                              ...item,
                              stock: inputAdjustStock,
                              status:
                                  inputAdjustStock === 0
                                      ? 'Out of Stock'
                                      : inputAdjustStock <= item.alert_level
                                      ? 'Low Stock'
                                      : 'In Stock',
                              last_updated: 'Just now',
                          }
                        : item
                )
            );

            showToast(`Adjusted ${selectedItem.name} stock to ${inputAdjustStock}.`);
            setModalType(null);
            setSelectedItem(null);
        } catch (error) {
            console.error(error);
            showToast('Failed to adjust stock. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Notify supplier via telegram mock API call
    const handleNotifySupplier = async (productId) => {
        try {
            const response = await axios.post(route('inventory.notify-supplier'), {
                id: productId,
            });

            if (response.data.success) {
                showToast(response.data.message);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to notify supplier.', 'error');
        }
    };

    return (
        <AdminLayout navbarTitle="Inventory Management" contentClassName="px-8 py-6 space-y-6">
            <Head title="Inventory Management" />

            {/* Custom UI Toast Alert */}
            {toast && (
                <div
                    className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all duration-300 animate-slide-in ${
                        toast.type === 'error'
                            ? 'bg-rose-50 border-rose-100 text-rose-800'
                            : 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
                    }`}
                >
                    <Check className={`h-5 w-5 ${toast.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            )}

            {/* ── Inventory Stats ────────────────────────────────────────── */}
            <section className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {/* Total Products */}
                <div className="bg-white border border-black/[0.06] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-black border border-black/[0.04] shadow-sm">
                        <Boxes size={20} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black font-display text-black leading-none">{groupedProducts.length}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block font-display">Total Products</span>
                    </div>
                </div>

                {/* Low Stock Warnings */}
                <div className="bg-white border border-black/[0.06] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#f97316] border border-orange-100 shadow-sm">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black font-display text-[#f97316] leading-none">{stats.lowStock}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block font-display">Low Stock</span>
                    </div>
                </div>

                {/* Inventory Value */}
                <div className="bg-white border border-black/[0.06] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition duration-200 select-none">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-black border border-black/[0.04] shadow-sm">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black font-display text-black leading-none">{formatPrice(stats.totalValue)}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block font-display">Inventory Value</span>
                    </div>
                </div>
            </section>

            {/* ── Active Alerts ─────────────────────────────────────────── */}
            {lowStockAlertsLocal.length > 0 && (
                <section className="space-y-3">
                    <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-widest block">
                        Alert Center ({lowStockAlertsLocal.length})
                    </span>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {lowStockAlertsLocal.map((alert) => {
                            const isOutOfStock = alert.stock === 0;
                            const indicatorColor = isOutOfStock ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.5)]';
                            return (
                                <div 
                                    key={alert.id}
                                    className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-black/10 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${indicatorColor}`} />
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-gray-900 truncate leading-tight">
                                                {alert.name}
                                            </h5>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                                                Size {alert.size} &bull; <span className={isOutOfStock ? "text-red-600 font-extrabold" : "text-orange-600 font-extrabold"}>{alert.stock} left</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedItem(alert);
                                            setInputQuantity(1);
                                            setModalType('stock-in');
                                        }}
                                        className="text-[10px] font-black text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 border border-black/10 rounded-xl px-3 py-1.5 transition-all duration-200 uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Restock
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Search & Filter Panel ────────────────────────────────── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Search bar */}
                    <div className="flex-1 max-w-md">
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search Nike, Air Max, etc..."
                            icon={Search}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                        className={`h-10 px-5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                            showMoreFilters 
                                ? 'bg-black text-white shadow-sm' 
                                : 'bg-gray-50 text-gray-700 border border-black/10 hover:bg-gray-100 hover:text-black'
                        }`}
                    >
                        <SlidersHorizontal size={14} />
                        <span>{showMoreFilters ? 'Hide Filters' : 'More Filters'}</span>
                    </button>
                </div>

                {/* Collapsable Filters Block */}
                {showMoreFilters && (
                    <div className="border-t border-black/[0.06] pt-4 grid gap-4 grid-cols-1 sm:grid-cols-3 animate-modal-in">
                        {/* Brand Select */}
                        <div className="flex flex-col">
                            <label className="mb-1.5 text-[9px] font-black font-display text-gray-400 uppercase tracking-widest">
                                Brand
                            </label>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="All">All Brands</option>
                                {brandFilterOptions.slice(1).map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Select */}
                        <div className="flex flex-col">
                            <label className="mb-1.5 text-[9px] font-black font-display text-gray-400 uppercase tracking-widest">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="All">All Statuses</option>
                                <option value="In Stock">🟢 In Stock</option>
                                <option value="Low Stock">🟡 Low Stock</option>
                                <option value="Out of Stock">🔴 Out of Stock</option>
                            </select>
                        </div>

                        {/* Category Select Dropdown */}
                        <div className="flex flex-col">
                            <label className="mb-1.5 text-[9px] font-black font-display text-gray-400 uppercase tracking-widest">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="All categories">All Categories</option>
                                {categoryFilterOptions.slice(1).map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Table Card ───────────────────────────────────────────── */}
            <TableContainer variant="separated">
                <thead className="sr-only">
                    <tr className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                        <th className="px-6 pb-2">Product Details</th>
                        <th className="px-6 pb-2">Category</th>
                        <th className="px-6 pb-2">Base Price</th>
                        <th className="px-6 pb-2">Stock & Variants</th>
                        <th className="px-6 pb-2">Actions</th>
                    </tr>
                </thead>
                        <tbody>
                            {groupedProducts.map((group) => (
                                <InventoryProductRow
                                    key={group.id}
                                    product={group}
                                    formatPrice={formatPrice}
                                    onView={() => openViewModal(group)}
                                    onStockIn={() => {
                                        setSelectedItem(group.variants[0]);
                                        setInputQuantity(1);
                                        setModalType('stock-in');
                                    }}
                                    onViewHistory={() => router.visit(route('orders.index'))}
                                    variant="separated"
                                />
                            ))}
                        </tbody>
            </TableContainer>

            {groupedProducts.length === 0 && (
                <div className="px-6 py-12 text-center text-xs font-mono tracking-widest text-foreground/45">
                    NO SNEAKERS MATCH FILTERS
                </div>
            )}

            {/* Inventory Details Modal */}
            <InventoryDetailsModal
                show={showViewModal}
                onClose={closeViewModal}
                productId={viewProductId}
                onStockIn={(variant) => {
                    setSelectedItem(variant);
                    setInputQuantity(1);
                    setModalType('stock-in');
                }}
                onAdjust={(variant) => {
                    setSelectedItem(variant);
                    setInputAdjustStock(variant.stock);
                    setModalType('adjust');
                }}
                onNotifySupplier={(variantId) => {
                    handleNotifySupplier(variantId);
                }}
            />

            {/* ── RESTOCK & ADJUST MODALS ── */}

            {/* 1. Stock In Modal */}
            {modalType === 'stock-in' && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Stock In</h3>
                                <p className="text-xs font-semibold text-gray-400 mt-0.5">Add inventory units to the store catalog.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalType(null)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleStockInSubmit} className="space-y-4">
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                                    {selectedItem.image ? (
                                        <img src={selectedItem.image.startsWith('http') ? selectedItem.image : `/storage/${selectedItem.image}`} className="h-full w-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedItem.name}</p>
                                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                                        {selectedItem.brand} <span className="mx-1">•</span> Size {selectedItem.size} <span className="mx-1">•</span> Color {selectedItem.color.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Current Stock</span>
                                    <span className="text-sm font-black text-gray-800">{selectedItem.stock} items</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Target Size</span>
                                    <span className="text-sm font-black text-gray-800">EU {selectedItem.size}</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Quantity to Add
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={inputQuantity}
                                    onChange={(e) => setInputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 text-center"
                                />
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModalType(null)}
                                    className="flex-1 h-11 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 h-11 rounded-xl bg-black px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Stock In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Stock Adjustment Modal */}
            {modalType === 'adjust' && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Stock Adjustment</h3>
                                <p className="text-xs font-semibold text-gray-400 mt-0.5">Manually override stock level for inventory tracking.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalType(null)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustSubmit} className="space-y-4">
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                                    {selectedItem.image ? (
                                        <img src={selectedItem.image.startsWith('http') ? selectedItem.image : `/storage/${selectedItem.image}`} className="h-full w-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedItem.name}</p>
                                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                                        {selectedItem.brand} <span className="mx-1">•</span> Size {selectedItem.size} <span className="mx-1">•</span> Color {selectedItem.color.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Current Stock</span>
                                    <span className="text-sm font-black text-gray-800">{selectedItem.stock} items</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">SKU</span>
                                    <span className="text-sm font-black text-gray-800">{selectedItem.sku}</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    New Inventory Quantity
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={inputAdjustStock}
                                    onChange={(e) => setInputAdjustStock(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 text-center"
                                />
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModalType(null)}
                                    className="flex-1 h-11 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 h-11 rounded-xl bg-black px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-900 transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
