import React from 'react';

export default function TableContainer({
    children,
    className = '',
    variant = 'contiguous',
    ...props
}) {
    return (
        <div className={`w-full overflow-hidden ${variant === 'separated' ? 'bg-transparent border border-[#E5E7EB] rounded-2xl p-4 shadow-sm' : 'bg-white border border-[#E5E7EB] rounded-2xl shadow-sm'} ${className}`}>
            <div className="overflow-x-auto">
                <table className={`w-full min-w-[800px] text-left align-middle ${variant === 'separated' ? 'border-separate border-spacing-x-0 border-spacing-y-4' : 'border-collapse'}`} {...props}>
                    {children}
                </table>
            </div>
        </div>
    );
}
