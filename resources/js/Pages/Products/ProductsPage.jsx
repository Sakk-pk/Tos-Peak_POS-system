import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeDollarSign,
    Package,
    Plus,
    Search,
    SlidersHorizontal,
    Sparkles,
    Warehouse,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import PageHeader from '@/Components/Shared/PageHeader';
import MetricCard from '@/Components/Shared/MetricCard';
import ProductCartRow from '@/Components/Products/ProductCartRow';
import ProductFormModal from './ProductFormModal';

const CATEGORIES = ['All categories'];

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
    const [showAddModal, setShowAddModal] = useState(false);
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
        image: null,
    });

    const products = productsPage?.data ?? [];
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
    })), [colors]);
    const brandOptions = useMemo(() => brands.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [brands]);
    const sizeOptions = useMemo(() => sizes.map((item) => ({
        value: String(item.id),
        label: item.name,
    })), [sizes]);
    const categoryFilterOptions = useMemo(() => (
        ['All categories', ...categories.map((item) => item.name)]
    ), [categories]);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const productCategoryName = product.category?.name ?? product.category_name ?? '';
            const matchesCategory = category === 'All categories' || productCategoryName === category;
            const matchesSearch = !normalizedSearch
                || product.name.toLowerCase().includes(normalizedSearch)
                || product.description.toLowerCase().includes(normalizedSearch)
                || productCategoryName.toLowerCase().includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [category, products, searchTerm]);

    const totalProducts = products.length;
    const lowStock = products.filter((product) => product.stock <= 15).length;
    const totalCategories = new Set(products.map((product) => product.category?.name ?? product.category_name)).size;
    const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

    const openAddModal = () => {
        reset();
        setData('category_id', String(categories[0]?.id ?? ''));
        setData('sub_category_id', String(subCategories[0]?.id ?? ''));
        setData('color_id', String(colors[0]?.id ?? ''));
        setData('brand_id', String(brands[0]?.id ?? ''));
        setData('size_id', String(sizes[0]?.id ?? ''));
        setData('image', null);
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const handleCreateProduct = (event) => {
        event.preventDefault();

        post(route('products.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeAddModal();
                reset();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Products" />

            <section className="min-h-full bg-gradient-to-br from-[#f7f7f4] via-[#f4f2ee] to-[#f8f8f8] text-[#111111]">
                <div className="px-6 py-8">
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <PageHeader
                            eyebrow="Catalog management"
                            eyebrowIcon={ArrowRight}
                            title="Products"
                            description="Manage the product catalog, check stock levels, and keep pricing organized."
                            actions={(
                                    <button
                                        type="button"
                                        onClick={openAddModal}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-black to-black/90 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Product
                                    </button>
                            )}
                        />
                        <div className="rounded-[28px] border border-black/8 bg-white/90 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search by name..."
                                        className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-4 focus:ring-black/5"
                                    />
                                </div>

                                <div className="min-w-[220px]">
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                                    >
                                        {categoryFilterOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[28px] border border-black/8 bg-white/95 shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] border-collapse text-left">
                                    <thead className="bg-black/2">
                                        <tr className="text-xs font-semibold uppercase tracking-wide text-black/45">
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <ProductCartRow
                                                key={product.id}
                                                product={product}
                                                formatPrice={formatPrice}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredProducts.length === 0 ? (
                                <div className="border-t border-black/5 px-6 py-12 text-center text-sm text-black/55">
                                    No products match the current search and category filters.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>

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
            />
        </AdminLayout>
    );
}
