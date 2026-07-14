import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/Components/Shared/PageHeader';
import CatalogTable from '@/Components/Catalog/CatalogTable';
import { useMemo, useState } from 'react';
import CategoriesList from './Components/CategoriesList';
import SubCategoriesList from './Components/SubCategoriesList';
import ColorsList from './Components/ColorsList';
import BrandsList from './Components/BrandsList';
import SizesList from './Components/SizesList';

const TABS = ['Categories', 'Sub-Categories', 'Colors', 'Brands', 'Sizes'];
const TAB_COMPONENTS = {
    Categories: CategoriesList,
    'Sub-Categories': SubCategoriesList,
    Colors: ColorsList,
    Brands: BrandsList,
    Sizes: SizesList,
};

export default function CatalogSettingsPage({ catalogData }) {
    const [activeTab, setActiveTab] = useState('Categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [editing, setEditing] = useState({ tab: null, id: null, value: '' });

    const { data, setData, post, processing } = useForm({
        tab: 'categories',
        name: '',
        parent_name: '',
    });

    const headWeb = 'Catalog Settings';
    const sortedTabs = useMemo(() => TABS, []);
    const activeTabComponent = TAB_COMPONENTS[activeTab];
    const activeConfig = activeTabComponent?.tab ?? TAB_COMPONENTS.Categories.tab;

    const categories = catalogData?.categories ?? [];
    const subCategories = catalogData?.subCategories ?? [];
    const colors = catalogData?.colors ?? [];
    const brands = catalogData?.brands ?? [];
    const sizes = catalogData?.sizes ?? [];

    const itemsByTab = {
        Categories: categories,
        'Sub-Categories': subCategories.filter((item) => {
            if (selectedCategoryId === 'all') {
                return true;
            }

            return String(item.category_id) === String(selectedCategoryId);
        }).map((item) => ({
            ...item,
            parent: item.category?.name ?? item.parent_name ?? '',
        })),
        Colors: colors,
        Brands: brands,
        Sizes: sizes,
    };

    const activeItems = itemsByTab[activeTab] ?? [];
    const parentOptions = categories.map((category) => ({
        value: String(category.id),
        label: category.name,
    }));

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setEditing({ tab: null, id: null, value: '' });
        setData('tab', TAB_COMPONENTS[tab].tab.backendTab);
        setData('name', '');
        if (tab === 'Sub-Categories') {
            setData('parent_name', parentOptions[0]?.value ?? '');
            setSelectedCategoryId('all');
        }
    };

    const handleAddItem = (event) => {
        event.preventDefault();

        if (!data.name.trim()) {
            return;
        }

        post(route('catalog-settings.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('name', '');
            },
        });
    };

    const handleDeleteItem = (id) => {
        router.delete(route('catalog-settings.destroy', [activeConfig.backendTab, id]), {
            preserveScroll: true,
        });
    };

    const startEdit = (item) => {
        setEditing({
            tab: activeTab,
            id: item.id,
            value: item.name,
        });
    };

    const cancelEdit = () => {
        setEditing({ tab: null, id: null, value: '' });
    };

    const saveEdit = (id) => {
        const nextName = editing.value.trim();

        if (!nextName) {
            return;
        }

        router.patch(
            route('catalog-settings.update', [activeConfig.backendTab, id]),
            { name: nextName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEdit();
                },
            }
        );
    };

    return (
        <AdminLayout>
            <Head title={headWeb} />
            <section className="min-h-full bg-gradient-to-br from-[#f8f8f5] via-[#f4f1ea] to-[#f7f7f7] text-[#111111]">
                <div className="px-6 py-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <PageHeader
                            className="mb-6"
                            eyebrow="Catalog tools"
                            eyebrowIcon={ArrowRight}
                            title="Catalog Settings"
                            description="Manage categories, sub-categories, colors, brands and sizes."
                        />

                        <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-black/8 bg-white/90 p-2 shadow-sm">
                            {sortedTabs.map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => handleTabChange(tab)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-black text-white shadow-md' : 'bg-transparent text-black/60 hover:bg-black/5 hover:text-black'}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-6">
                            <CatalogTable
                                activeTab={activeTab}
                                config={activeConfig}
                                parentOptions={parentOptions}
                                items={activeItems}
                                inputValue={data.name}
                                parentValue={activeTab === 'Sub-Categories' ? selectedCategoryId : (data.parent_name || parentOptions[0]?.value || '')}
                                editing={editing.tab === activeTab ? editing : { id: null, value: '' }}
                                onParentChange={(value) => {
                                    if (activeTab === 'Sub-Categories') {
                                        setSelectedCategoryId(value);
                                        if (value !== 'all') {
                                            setData('parent_name', value);
                                        }
                                        return;
                                    }

                                    setData('parent_name', value);
                                }}
                                onInputChange={(value) => setData('name', value)}
                                onAdd={handleAddItem}
                                onEditValueChange={(value) => setEditing((current) => ({ ...current, value }))}
                                onStartEdit={startEdit}
                                onSaveEdit={saveEdit}
                                onCancelEdit={cancelEdit}
                                onDelete={handleDeleteItem}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
