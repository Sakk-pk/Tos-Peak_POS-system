import { Mail } from 'lucide-react';
import TableCardRow from '@/Components/Shared/TableCardRow';
import { useTableRowConfig } from '@/Context/TableRowContext';
import Badge from '@/Components/ui/Badge';

export default function UserCardRow({ member, onEdit, onDelete }) {
    const { classes } = useTableRowConfig();

    return (
        <TableCardRow
            onEdit={() => onEdit(member)}
            onDelete={() => onDelete(member)}
            editLabel={`Edit ${member.name}`}
            deleteLabel={`Delete ${member.name}`}
        >
            <td className={`px-6 ${classes.cellY}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-black to-black/80 text-xs font-bold text-white shadow-sm ring-4 ring-black/5 transition-transform group-hover:scale-[1.03]">
                        {member.initials}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-black">{member.name}</div>
                        <div className="text-xs text-black/45">{member.role}</div>
                    </div>
                </div>
            </td>
            <td className={`px-6 ${classes.cellY}`}>
                <div className="flex items-center gap-2.5 text-sm text-black/65">
                    <Mail className="h-3.5 w-3.5 text-black/35" />
                    <span className="font-medium transition-colors group-hover:text-black">{member.email}</span>
                </div>
            </td>
            <td className={`px-6 ${classes.cellY}`}>
                <Badge variant={member.role === 'Admin' ? 'danger' : 'default'}>
                    {member.role}
                </Badge>
            </td>
        </TableCardRow>
    );
}
