import { Edit, Trash2, Eye } from 'lucide-react';
import { useTableRowConfig } from '@/Context/TableRowContext';

export default function TableCardRow({
    children,
    onEdit,
    onDelete,
    onView,
    editLabel = 'Edit row',
    deleteLabel = 'Delete row',
    viewLabel = 'View details',
    actions,
    variant = 'contiguous',
    customRowClass = '',
}) {
    const { classes } = useTableRowConfig();

    const baseRowClass = variant === 'separated' ? classes.row : classes.rowContiguous;
    const rowClass = customRowClass ? `${baseRowClass} ${customRowClass}` : baseRowClass;
    const actionsCellClass = variant === 'separated' ? classes.cellLast : classes.cellY;

    return (
        <tr className={rowClass}>
            {children}
            <td className={`px-6 text-right ${actionsCellClass}`}>
                {actions ? (
                    actions
                ) : (
                    <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                            <button
                                type="button"
                                onClick={onView}
                                className="h-9 w-9 rounded-xl border border-gray-200/80 bg-gray-50/80 text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all duration-200 shadow-sm flex items-center justify-center active:scale-95"
                                aria-label={viewLabel}
                                title={viewLabel}
                            >
                                <Eye className="h-4 w-4 stroke-[2.2]" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onEdit}
                            className="h-9 w-9 rounded-xl border border-orange-100 bg-orange-50/60 text-orange-600 hover:bg-[#f97316] hover:text-white hover:border-[#f97316] transition-all duration-200 shadow-sm flex items-center justify-center active:scale-95"
                            aria-label={editLabel}
                            title={editLabel}
                        >
                            <Edit className="h-4 w-4 stroke-[2.2]" />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="h-9 w-9 rounded-xl border border-red-100 bg-red-50/60 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm flex items-center justify-center active:scale-95"
                            aria-label={deleteLabel}
                            title={deleteLabel}
                        >
                            <Trash2 className="h-4 w-4 stroke-[2.2]" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}


