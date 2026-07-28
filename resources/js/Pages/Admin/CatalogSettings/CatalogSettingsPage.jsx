import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, router, useForm, useRemember } from '@inertiajs/react';
import CatalogTable from '@/Pages/Admin/CatalogSettings/components/CatalogTable';
import { useMemo, useState } from 'react';
import ColorFormModal from './components/ColorFormModal';
import ConfirmModal from '@/Components/ui/ConfirmModal';

const TABS = ['Categories', 'Sub-Categories', 'Colors', 'Brands', 'Sizes'];

const TAB_CONFIGS = {
    Categories: {
        key: 'categories',
        backendTab: 'categories',
        title: 'Categories',
        description: 'Manage top-level categories used by products.',
        placeholder: 'Category name...',
        hasParentSelector: false,
    },
    'Sub-Categories': {
        key: 'subCategories',
        backendTab: 'sub_categories',
        title: 'Sub-Categories',
        description: 'Pick a parent category, type a name, and add it to your catalog.',
        placeholder: 'Sub-category name...',
        hasParentSelector: true,
    },
    Colors: {
        key: 'colors',
        backendTab: 'colors',
        title: 'Colors',
        description: 'Manage color entries used in the catalog.',
        placeholder: 'Color name...',
        hasParentSelector: false,
    },
    Brands: {
        key: 'brands',
        backendTab: 'brands',
        title: 'Brands',
        description: 'Manage manufacturer / brand names.',
        placeholder: 'Brand name...',
        hasParentSelector: false,
    },
    Sizes: {
        key: 'sizes',
        backendTab: 'sizes',
        title: 'Sizes',
        description: 'Manage product size labels.',
        placeholder: 'Size name...',
        hasParentSelector: false,
    },
};

export default function CatalogSettingsPage({ catalogData }) {
    const [activeTab, setActiveTab] = useRemember('Categories', 'CatalogSettings.activeTab');
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [editing, setEditing] = useState({ tab: null, id: null, value: '', parentId: '' });
    const [showColorModal, setShowColorModal] = useState(false);
    const [colorModalMode, setColorModalMode] = useState('add');
    const [editingColorId, setEditingColorId] = useState(null);
    const [colorSearchTerm, setColorSearchTerm] = useState('');
    const [deleteModalState, setDeleteModalState] = useState({ show: false, itemId: null, itemName: '' });

    const { data, setData, post, patch, processing, errors } = useForm({
        tab: TAB_CONFIGS[activeTab]?.backendTab ?? 'categories',
        name: '',
        parent_name: '',
        value: '#111111',
    });

    const headWeb = 'Catalog Settings';
    const sortedTabs = useMemo(() => TABS, []);
    const activeConfig = TAB_CONFIGS[activeTab] ?? TAB_CONFIGS.Categories;

    const categories = catalogData?.categories ?? [];
    const subCategories = catalogData?.subCategories ?? [];
    const colors = catalogData?.colors ?? [];
    const brands = catalogData?.brands ?? [];
    const sizes = catalogData?.sizes ?? [];

    const filteredColors = useMemo(() => {
        const query = colorSearchTerm.trim().toLowerCase();
        if (!query) {
            return colors;
        }
        return colors.filter(
            (color) =>
                color.name.toLowerCase().includes(query) ||
                (color.value && color.value.toLowerCase().includes(query))
        );
    }, [colors, colorSearchTerm]);

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
        Colors: filteredColors,
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
        setColorSearchTerm('');
        setEditing({ tab: null, id: null, value: '' });
        setData('tab', TAB_CONFIGS[tab].backendTab);
        setData('name', '');
        setData('value', '#111111');
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
            preserveState: true,
            onSuccess: () => {
                setActiveTab(activeTab);
                setData('tab', activeConfig.backendTab);
                setData('name', '');
            },
        });
    };

    const openColorModal = () => {
        setColorModalMode('add');
        setEditingColorId(null);
        setData((prev) => ({
            ...prev,
            tab: 'colors',
            name: '',
            value: '#111111'
        }));
        setShowColorModal(true);
    };

    const handleEditColor = (item) => {
        setColorModalMode('edit');
        setEditingColorId(item.id);
        setData((prev) => ({
            ...prev,
            tab: 'colors',
            name: item.name,
            value: item.value || '#111111'
        }));
        setShowColorModal(true);
    };

    const closeColorModal = () => {
        setShowColorModal(false);
        setColorModalMode('add');
        setEditingColorId(null);
        setData((prev) => ({
            ...prev,
            name: '',
            value: '#111111'
        }));
    };

    const handleColorSubmit = (event) => {
        event.preventDefault();

        if (!data.name.trim()) {
            return;
        }

        if (colorModalMode === 'edit') {
            patch(route('catalog-settings.update', ['colors', editingColorId]), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    closeColorModal();
                },
            });
        } else {
            post(route('catalog-settings.store'), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    closeColorModal();
                },
            });
        }
    };

    const handleDeleteItem = (id, item) => {
        const name = typeof item === 'object' ? item?.name : '';
        setDeleteModalState({
            show: true,
            itemId: id,
            itemName: name,
        });
    };

    const confirmDeleteItem = () => {
        if (!deleteModalState.itemId) return;
        router.delete(route('catalog-settings.destroy', [activeConfig.backendTab, deleteModalState.itemId]), {
            preserveScroll: true,
            onSuccess: () => setDeleteModalState({ show: false, itemId: null, itemName: '' }),
        });
    };

    const startEdit = (item) => {
        if (activeTab === 'Colors') {
            handleEditColor(item);
            return;
        }
        setEditing({
            tab: activeTab,
            id: item.id,
            value: item.name,
            parentId: String(item.category_id || ''),
        });
    };

    const cancelEdit = () => {
        setEditing({ tab: null, id: null, value: '', parentId: '' });
    };

    const saveEdit = (id) => {
        const nextName = editing.value.trim();

        if (!nextName) {
            return;
        }

        const payload = { name: nextName };
        if (activeTab === 'Sub-Categories') {
            payload.parent_name = editing.parentId;
        }

        router.patch(
            route('catalog-settings.update', [activeConfig.backendTab, id]),
            payload,
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEdit();
                },
            }
        );
    };

    return (
        <AdminLayout navbarTitle={headWeb} contentClassName="px-4 pb-4 pt-2">
            <Head title={headWeb} />
            <section className="min-h-full text-[#111111]">
                <div>
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="mb-4 flex flex-wrap gap-1.5 rounded-2xl border border-black/[0.06] bg-white p-2 shadow-sm">
                            {sortedTabs.map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => handleTabChange(tab)}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isActive ? 'bg-black text-white shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-4">
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
                                onEditParentChange={(parentId) => setEditing((current) => ({ ...current, parentId }))}
                                onStartEdit={startEdit}
                                onSaveEdit={saveEdit}
                                onCancelEdit={cancelEdit}
                                onDelete={handleDeleteItem}
                                onOpenColorModal={openColorModal}
                                colorSearchTerm={colorSearchTerm}
                                onColorSearchChange={setColorSearchTerm}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <ColorFormModal
                show={showColorModal}
                onClose={closeColorModal}
                onSubmit={handleColorSubmit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                mode={colorModalMode}
            />
            <ConfirmModal
                show={deleteModalState.show}
                onClose={() => setDeleteModalState({ show: false, itemId: null, itemName: '' })}
                onConfirm={confirmDeleteItem}
                title="Delete Catalog Item"
                message={`Are you sure you want to delete ${deleteModalState.itemName ? `"${deleteModalState.itemName}"` : 'this catalog item'}? This action cannot be undone and will permanently remove it from your store catalog.`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}
