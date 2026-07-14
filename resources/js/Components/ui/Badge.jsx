import React from 'react';

export default function Badge({
    children,
    className = '',
    variant = 'default',
    size = 'md',
    ...props
}) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
    }[size];

    const variantClasses = {
        default: 'bg-gray-50 text-gray-500 border border-black/[0.04]',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-orange-50 text-orange-700 border border-orange-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
        info: 'bg-blue-50 text-blue-700 border border-blue-100',
    }[variant];

    return (
        <span
            className={`inline-flex items-center rounded-full font-black uppercase tracking-wider ${sizeClasses} ${variantClasses} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
