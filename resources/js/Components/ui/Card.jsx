import React from 'react';

export default function Card({
    children,
    className = '',
    as: Component = 'div',
    padding = 'p-6',
    ...props
}) {
    return (
        <Component
            className={`bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden ${padding} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}
