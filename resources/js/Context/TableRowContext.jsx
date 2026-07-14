import { createContext, useContext, useMemo, useState } from 'react';

const TableRowContext = createContext({
    rowDensity: 'comfortable',
    setRowDensity: () => {},
    classes: {
        row: 'group border-b border-black/5 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.04)] last:border-b-0',
        cellY: 'py-4',
        actionBase: 'inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-all',
        editAction: 'border-black/8 text-black/55 hover:border-black/15 hover:bg-black/5 hover:text-black',
        deleteAction: 'border-red-100 text-red-500/70 hover:border-red-200 hover:bg-red-50/80 hover:text-red-600',
    },
});

export function TableRowProvider({ children }) {
    const [rowDensity, setRowDensity] = useState('comfortable');

    const classes = useMemo(() => {
        const cellY = rowDensity === 'compact' ? 'py-3' : 'py-4';

        return {
            row: 'group border-b border-black/5 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.04)] last:border-b-0',
            cellY,
            actionBase: 'inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-all',
            editAction: 'border-black/8 text-black/55 hover:border-black/15 hover:bg-black/5 hover:text-black',
            deleteAction: 'border-red-100 text-red-500/70 hover:border-red-200 hover:bg-red-50/80 hover:text-red-600',
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
