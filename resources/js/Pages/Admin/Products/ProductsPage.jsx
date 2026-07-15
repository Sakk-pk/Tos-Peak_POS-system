import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Search, Tag, Eye, Edit, Trash2, ChevronRight } from 'lucide-react';
import ProductCartRow from '@/Pages/Admin/Products/components/ProductCartRow';
import ProductFormModal from './components/ProductFormModal';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import TableContainer from '@/Components/ui/TableContainer';


function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function ProductsPage({
    products: productsPage,
    categories = [],
    subCategories = [],
    colors = [],
    brands = [],
    sizes = [],
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All categories');
    const [subCategory, setSubCategory] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All brands');
    const [sortBy, setSortBy] = useState('name-asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    
    const { data, setData, post, reset, processing, errors } = useForm({
        name: '',
        description: '',
        category_id: String(categories[0]?.id ?? ''),
        sub_category_id: String(subCategories[0]?.id ?? ''),
        color_id: String(colors[0]?.id ?? ''),
        brand_id: String(brands[0]?.id ?? ''),
        size_id: String(sizes[0]?.id ?? ''),
        price: '',
        stock: '',
        low_stock_threshold: 5,
        low_stock_alert_enabled: true,
        image: null,
    });

    const products = Array.isArray(productsPage) ? productsPage : (productsPage?.data ?? []);
    
    const categoryFilterOptions = useMemo(() => [
        'All categories',
        ...categories.map((c) => c.name),
    ], [categories]);

    const brandFilterOptions = useMemo(() => [
        'All brands',
        ...brands.map((b) => b.name),
    ], [brands]);

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

    const activeCategoryObj = useMemo(() => {
        return categories.find(cat => cat.name === category);
    }, [categories, category]);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const productCategoryName = product.category?.name ?? product.category_name ?? product.category ?? '';
            const productSubCategoryName = product.sub_category?.name ?? product.sub_category_name ?? product.sub_category ?? '';
            const productBrandName = product.brand?.name ?? product.brand_name ?? product.brand ?? '';

            const matchesCategory = category === 'All categories' || productCategoryName === category;
            const matchesSubCategory = subCategory === 'All' || productSubCategoryName === subCategory;
            const matchesBrand = brandFilter === 'All brands' || productBrandName === brandFilter;
            const matchesSearch = !normalizedSearch
                || product.name.toLowerCase().includes(normalizedSearch)
                || (product.description && product.description.toLowerCase().includes(normalizedSearch))
                || productCategoryName.toLowerCase().includes(normalizedSearch);

            return matchesCategory && matchesSubCategory && matchesBrand && matchesSearch;
        });
    }, [category, subCategory, brandFilter, products, searchTerm]);


    const sortedGroupedProducts = useMemo(() => {
        const groups = {};
        filteredProducts.forEach(p => {
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
        
        const list = Object.values(groups);
        
        if (sortBy === 'name-asc') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name-desc') {
            list.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'price-asc') {
            list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'price-desc') {
            list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        
        return list;
    }, [filteredProducts, sortBy]);



    const openAddModal = () => {
        setIsEditing(false);
        setEditingProductId(null);
        reset();
        setData('category_id', String(categories[0]?.id ?? ''));
        setData('sub_category_id', String(subCategories[0]?.id ?? ''));
        setData('color_id', String(colors[0]?.id ?? ''));
        setData('brand_id', String(brands[0]?.id ?? ''));
        setData('size_id', String(sizes[0]?.id ?? ''));
        setData('image', null);
        setShowAddModal(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true);
        setEditingProductId(product.id);
        
        setData({
            name: product.name,
            description: product.description || '',
            category_id: String(product.category?.id || product.category_id || ''),
            sub_category_id: String(product.sub_category_id || product.sub_category?.id || ''),
            color_id: String(product.color_id || product.color?.id || ''),
            brand_id: String(product.brand_id || product.brand?.id || ''),
            size_id: String(product.size_id || product.size?.id || ''),
            price: product.price,
            stock: product.stock,
            low_stock_threshold: product.low_stock_threshold ?? 5,
            low_stock_alert_enabled: product.low_stock_alert_enabled !== false,
            image: product.image,
        });
        
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const handleCreateProduct = (event) => {
        event.preventDefault();
        if (isEditing) {
            put(route('products.update', data.id), {
                preserveScroll: true,
                onSuccess: () => {
                    closeAddModal();
                    reset();
                },
            });
        } else {
            post(route('products.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeAddModal();
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout navbarTitle="Products" contentClassName="px-8 py-6 space-y-6">
            <Head title="Products" />



            {/* ── Search & Filter Panel ────────────────────────────────── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left Side: Search + Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 flex-1 max-w-3xl">
                        <div className="relative w-full max-w-xs sm:w-64">
                            <Input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search catalog items..."
                                icon={Search}
                            />
                        </div>
                        <select
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            className="h-10 rounded-xl border border-black/10 bg-white px-3.5 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 cursor-pointer"
                        >
                            {brandFilterOptions.map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-10 rounded-xl border border-black/10 bg-white px-3.5 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 cursor-pointer"
                        >
                            <option value="name-asc">Sort: A-Z</option>
                            <option value="name-desc">Sort: Z-A</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Right Side: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            onClick={openAddModal}
                            icon={Plus}
                        >
                            Add Product
                        </Button>
                    </div>
                </div>

                {/* Inline Category Pills Filter */}
                <div className="border-t border-black/[0.06] pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[9px] font-black font-display text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mr-2 shrink-0 select-none">
                        <Tag size={10} className="stroke-[2.5]" /> Categories
                    </span>
                    {categoryFilterOptions.map((opt) => {
                        const isSelected = category === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => setCategory(opt)}
                                className={`h-7 px-3.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 border select-none ${
                                    isSelected
                                        ? 'bg-black border-black text-white shadow-sm'
                                        : 'bg-white border-black/10 text-gray-500 hover:text-black hover:border-black/25'
                                }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* ── Table Card ───────────────────────────────────────────── */}
            <TableContainer variant="separated">
                <thead>
                    <tr className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                        <th className="px-6 pb-2">Product details</th>
                        <th className="px-6 pb-2">Category</th>
                        <th className="px-6 pb-2">Base Price</th>
                        <th className="px-6 pb-2">Catalog Options</th>
                        <th className="px-6 pb-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedGroupedProducts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-xs font-mono tracking-widest text-foreground/45 bg-white border border-[#E5E7EB] rounded-2xl">
                                NO SNEAKERS MATCH FILTERS
                            </td>
                        </tr>
                    ) : (
                        sortedGroupedProducts.map((group) => {
                            const representativeProduct = group.variants[0] || group;

                            return (
                                <ProductCartRow
                                    key={group.name}
                                    product={group}
                                    formatPrice={formatPrice}
                                    onEdit={() => openEditModal(representativeProduct)}
                                    onDelete={() => handleDeleteProduct(representativeProduct)}
                                    onView={() => router.visit(route('products.show', representativeProduct.id))}
                                    variant="separated"
                                />
                            );
                        })
                    )}
                </tbody>
            </TableContainer>

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
            />


        </AdminLayout>
    );
}
