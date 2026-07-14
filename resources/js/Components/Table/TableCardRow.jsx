import { Edit, Trash2 } from 'lucide-react';
import { useTableRowConfig } from '@/Context/TableRowContext';

export default function TableCardRow({
    children,
    onEdit,
    onDelete,
    editLabel = 'Edit row',
    deleteLabel = 'Delete row',
}) {
    const { classes } = useTableRowConfig();

    return (
        <tr className={classes.row}>
            {children}
            <td className={`px-6 text-right ${classes.cellY}`}>
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onEdit}
                        className={`${classes.actionBase} ${classes.editAction}`}
                        aria-label={editLabel}
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className={`${classes.actionBase} ${classes.deleteAction}`}
                        aria-label={deleteLabel}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
