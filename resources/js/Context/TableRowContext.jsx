import { createContext, useContext, useMemo, useState } from 'react';

const TableRowContext = createContext({
    rowDensity: 'comfortable',
    setRowDensity: () => {},
    classes: {
        row: 'group transition-colors duration-200',
        rowContiguous: 'group border-b border-[#E5E7EB] hover:bg-gray-50/30 transition-colors duration-200 last:border-b-0',
        cellY: 'py-3',
        actionBase: 'inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-sm transition-all duration-200 text-gray-400',
        editAction: 'hover:bg-neutral-50 hover:text-neutral-950',
        deleteAction: 'border-red-100 hover:bg-red-50 hover:text-red-650',
        cellFirst: 'bg-white border-y border-l border-black/[0.05] rounded-l-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:border-black/10 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] group-hover:-translate-y-[2px]',
        cellMiddle: 'bg-white border-y border-black/[0.05] transition-all duration-300 group-hover:border-black/10 group-hover:-translate-y-[2px]',
        cellLast: 'bg-white border-y border-r border-black/[0.05] rounded-r-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:border-black/10 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] group-hover:-translate-y-[2px]',
    },
});

export function TableRowProvider({ children }) {
    const [rowDensity, setRowDensity] = useState('comfortable');

    const classes = useMemo(() => {
        const cellY = rowDensity === 'compact' ? 'py-2' : 'py-3';

        return {
            row: 'group transition-colors duration-200',
            rowContiguous: 'group border-b border-[#E5E7EB] hover:bg-gray-50/30 transition-colors duration-200 last:border-b-0',
            cellY,
            actionBase: 'inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-sm transition-all duration-200 text-gray-400',
            editAction: 'hover:bg-neutral-50 hover:text-neutral-950',
            deleteAction: 'border-red-100 hover:bg-red-50 hover:text-red-650',
            cellFirst: 'bg-white border-y border-l border-black/[0.05] rounded-l-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:border-black/10 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] group-hover:-translate-y-[2px]',
            cellMiddle: 'bg-white border-y border-black/[0.05] transition-all duration-300 group-hover:border-black/10 group-hover:-translate-y-[2px]',
            cellLast: 'bg-white border-y border-r border-black/[0.05] rounded-r-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:border-black/10 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] group-hover:-translate-y-[2px]',
        };
    }, [rowDensity]);

    return (
        <TableRowContext.Provider value={{ rowDensity, setRowDensity, classes }}>
            {children}
        </TableRowContext.Provider>
    );
}

export function useTableRowConfig() {
    return useContext(TableRowContext);
}
