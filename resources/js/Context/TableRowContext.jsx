import { createContext, useContext, useMemo, useState } from 'react';

const TableRowContext = createContext({
    rowDensity: 'comfortable',
    setRowDensity: () => {},
    classes: {
        row: 'group transition-colors duration-200',
        rowContiguous: 'group border-b border-[#E5E7EB] hover:bg-gray-50/30 transition-colors duration-200 last:border-b-0',
        cellY: 'py-3',
        actionBase: 'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 bg-transparent',
        editAction: 'text-gray-400 hover:text-neutral-900 hover:bg-neutral-50',
        deleteAction: 'text-gray-400 hover:text-red-650 hover:text-red-600 hover:bg-red-50',
        cellFirst: 'bg-white border-y border-l border-[#E5E7EB] rounded-l-xl overflow-hidden',
        cellMiddle: 'bg-white border-y border-[#E5E7EB]',
        cellLast: 'bg-white border-y border-r border-[#E5E7EB] rounded-r-xl',
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
            actionBase: 'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 bg-transparent',
            editAction: 'text-gray-400 hover:text-neutral-900 hover:bg-neutral-50',
            deleteAction: 'text-gray-400 hover:text-red-650 hover:text-red-600 hover:bg-red-50',
            cellFirst: 'bg-white border-y border-l border-[#E5E7EB] rounded-l-xl overflow-hidden',
            cellMiddle: 'bg-white border-y border-[#E5E7EB]',
            cellLast: 'bg-white border-y border-r border-[#E5E7EB] rounded-r-xl',
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
