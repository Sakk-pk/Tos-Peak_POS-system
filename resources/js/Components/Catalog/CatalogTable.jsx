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
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
}) {
    return (
        <div className="rounded-3xl border border-black/8 bg-white/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-black/8 pb-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {config.title}
                    </div>
                    {config.description ? (
                        <p className="mt-3 max-w-2xl text-sm text-black/60">{config.description}</p>
                    ) : null}
                </div>
                <div className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white">
                    {items.length} items
                </div>
            </div>

            <form onSubmit={onAdd} className={`mb-4 grid gap-3 ${config.hasParentSelector ? 'md:grid-cols-[220px_minmax(0,1fr)_auto]' : 'md:grid-cols-[minmax(0,1fr)_auto]'}`}>
                {config.hasParentSelector ? (
                    <div>
                        <label htmlFor={`${config.key}-parent-select`} className="sr-only">Parent</label>
                        <select
                            id={`${config.key}-parent-select`}
                            name="parent_name"
                            value={parentValue}
                            onChange={(event) => onParentChange(event.target.value)}
                            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none"
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
                    <input
                        id={`${config.key}-name-input`}
                        name="name"
                        value={inputValue}
                        onChange={(event) => onInputChange(event.target.value)}
                        placeholder={config.placeholder}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none"
                    />
                </div>
                <button type="submit" className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white">Add</button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-gray-500">
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Name</th>
                            {config.hasParentSelector ? <th className="px-3 py-2">Parent</th> : null}
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const isEditing = editing.id === item.id;

                            return (
                                <tr key={item.id} className="border-t">
                                    <td className="px-3 py-2 font-mono text-sm text-gray-700">{index + 1}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            {activeTab === 'Colors' ? (
                                                <span className="h-6 w-6 rounded-md border" style={{ backgroundColor: item.value }} />
                                            ) : null}
                                            {isEditing ? (
                                                <input
                                                    id={`${config.key}-edit-${item.id}`}
                                                    name={`edit_${config.key}`}
                                                    aria-label={`Edit ${config.title} ${item.name}`}
                                                    value={editing.value}
                                                    onChange={(event) => onEditValueChange(event.target.value)}
                                                    className="w-full rounded-md border px-2 py-1"
                                                />
                                            ) : (
                                                <div className="font-medium">{item.name}</div>
                                            )}
                                        </div>
                                    </td>
                                    {config.hasParentSelector ? <td className="px-3 py-2">{item.parent}</td> : null}
                                    <td className="px-3 py-2 text-right">
                                        {isEditing ? (
                                            <div className="inline-flex gap-2">
                                                <button type="button" onClick={() => onSaveEdit(item.id)} className="rounded-md bg-green-600 px-3 py-1 text-sm text-white">Save</button>
                                                <button type="button" onClick={onCancelEdit} className="rounded-md bg-gray-100 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="inline-flex gap-2">
                                                <button type="button" onClick={() => onStartEdit(item)} className="rounded-md bg-black px-3 py-1 text-sm text-white">Edit</button>
                                                <button type="button" onClick={() => onDelete(item.id)} className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-700">Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}