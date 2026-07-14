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
                    <div className="flex items-center justify-end gap-2">
                        {onView && (
                            <button
                                type="button"
                                onClick={onView}
                                className={`${classes.actionBase} text-gray-400 hover:text-neutral-900 hover:bg-neutral-50`}
                                aria-label={viewLabel}
                            >
                                <Eye className="h-4.5 w-4.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onEdit}
                            className={`${classes.actionBase} ${classes.editAction}`}
                            aria-label={editLabel}
                        >
                            <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className={`${classes.actionBase} ${classes.deleteAction}`}
                            aria-label={deleteLabel}
                        >
                            <Trash2 className="h-4.5 w-4.5" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}


