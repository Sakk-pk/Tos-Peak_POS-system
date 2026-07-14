import React from 'react';

export default function TableContainer({
    children,
    className = '',
    variant = 'contiguous',
    ...props
}) {
    if (variant === 'separated') {
        return (
            <div className={`w-full space-y-3 ${className}`}>
                <table className={`w-full text-left align-middle`} {...props}>
                    {children}
                </table>
            </div>
        );
    }

    return (
        <div className={`w-full overflow-hidden bg-white border border-[#E5E7EB] rounded-2xl shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <table className={`w-full min-w-[800px] text-left align-middle border-collapse`} {...props}>
                    {children}
                </table>
            </div>
        </div>
    );
}
