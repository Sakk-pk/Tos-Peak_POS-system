import TableCardRow from '@/Components/Shared/TableCardRow';
import { useTableRowConfig } from '@/Context/TableRowContext';
import { Search } from 'lucide-react';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import TableContainer from '@/Components/ui/TableContainer';

export default function CatalogTable({
    activeTab,
    config,
    parentOptions,
    items,
    inputValue,
    parentValue,
    editing,
    onParentChange,
    onInputChange,
    onAdd,
    onEditValueChange,
    onEditParentChange = () => {},
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onOpenColorModal,
    colorSearchTerm = '',
    onColorSearchChange = () => {},
}) {
    const { classes } = useTableRowConfig();
    const usesColorModal = activeTab === 'Colors';

    return (
        <Card padding="p-5">
            {usesColorModal ? (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <Input
                            value={colorSearchTerm}
                            onChange={(event) => onColorSearchChange(event.target.value)}
                            placeholder="Search colors..."
                            icon={Search}
                        />
                    </div>
                    <Button
                        onClick={onOpenColorModal}
                    >
                        Add Color
                    </Button>
                </div>
            ) : (
                <form onSubmit={onAdd} className={`mb-4 grid gap-3 ${config.hasParentSelector ? 'md:grid-cols-[220px_minmax(0,1fr)_auto]' : 'md:grid-cols-[minmax(0,1fr)_auto]'}`}>
                    {config.hasParentSelector ? (
                        <div>
                            <label htmlFor={`${config.key}-parent-select`} className="sr-only">Parent</label>
                            <select
                                id={`${config.key}-parent-select`}
                                name="parent_name"
                                value={parentValue}
                                onChange={(event) => onParentChange(event.target.value)}
                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition duration-200 hover:border-black/20 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                            >
                                {activeTab === 'Sub-Categories' ? <option value="all">All categories</option> : null}
                                {(parentOptions ?? []).map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    <div>
                        <label htmlFor={`${config.key}-name-input`} className="sr-only">{config.title} name</label>
                        <Input
                            id={`${config.key}-name-input`}
                            name="name"
                            value={inputValue}
                            onChange={(event) => onInputChange(event.target.value)}
                            placeholder={config.placeholder}
                        />
                    </div>
                    <Button type="submit">Add</Button>
                </form>
            )}

            <TableContainer variant="contiguous">
                <thead>
                    <tr className="border-b border-black/[0.06] bg-gray-50/50 text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Name</th>
                        {config.hasParentSelector ? <th className="px-6 py-4">Parent</th> : null}
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={config.hasParentSelector ? 4 : 3} className="px-6 py-10 text-center text-sm text-black/45">
                                {activeTab === 'Colors' && colorSearchTerm
                                    ? `No colors match "${colorSearchTerm}"`
                                    : `No ${config.title.toLowerCase()} found. Add one above!`}
                            </td>
                        </tr>
                    ) : null}
                    {items.map((item, index) => {
                        const isEditing = editing.id === item.id;

                        return (
                            <TableCardRow
                                key={item.id}
                                onEdit={() => onStartEdit(item)}
                                onDelete={() => onDelete(item.id)}
                                editLabel={`Edit ${item.name}`}
                                deleteLabel={`Delete ${item.name}`}
                                actions={isEditing ? (
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onSaveEdit(item.id)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onCancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : null}
                            >
                                <td className={`px-6 font-mono text-xs text-black/45 ${classes.cellY}`}>
                                    {index + 1}
                                </td>
                                <td className={`px-6 ${classes.cellY}`}>
                                    <div className="flex items-center gap-3">
                                        {activeTab === 'Colors' ? (
                                            <span
                                                className="h-6 w-6 rounded-lg border border-black/10 shadow-sm shrink-0"
                                                style={{ backgroundColor: item.value }}
                                            />
                                        ) : null}
                                        {isEditing ? (
                                            <input
                                                id={`${config.key}-edit-${item.id}`}
                                                name={`edit_${config.key}`}
                                                aria-label={`Edit ${config.title} ${item.name}`}
                                                value={editing.value}
                                                onChange={(event) => onEditValueChange(event.target.value)}
                                                className="w-full max-w-xs rounded-xl border border-black/10 px-3 py-1.5 text-xs outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
                                                autoFocus
                                            />
                                          ) : (
                                            <div className="font-semibold text-black">{item.name}</div>
                                        )}
                                    </div>
                                </td>
                                {config.hasParentSelector ? (
                                    <td className={`px-6 font-medium text-black/65 ${classes.cellY}`}>
                                        {isEditing && activeTab === 'Sub-Categories' ? (
                                            <select
                                                id={`edit-parent-${item.id}`}
                                                aria-label="Edit Parent Category"
                                                value={editing.parentId}
                                                onChange={(event) => onEditParentChange(event.target.value)}
                                                className="rounded-xl border border-black/10 px-3 py-1.5 text-xs outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 bg-white"
                                            >
                                                {(parentOptions ?? []).map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            item.parent
                                        )}
                                    </td>
                                ) : null}
                            </TableCardRow>
                        );
                    })}
                </tbody>
            </TableContainer>
        </Card>
    );
}
