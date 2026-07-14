import React from 'react';
import { Link } from '@inertiajs/react';

export default function Button({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    as: Component = 'button',
    href,
    ...props
}) {
    const baseStyle = 'inline-flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none';

    const sizeClasses = {
        sm: 'h-8 px-3.5 text-[9px] rounded-lg',
        md: 'h-10 px-5 text-[11px] rounded-xl',
        lg: 'h-12 px-6 text-xs rounded-xl',
    }[size];

    const variantClasses = {
        primary: 'bg-black text-white hover:bg-neutral-900 shadow-sm',
        secondary: 'bg-gray-50 border border-black/10 text-gray-700 hover:bg-gray-100 hover:text-black',
        outline: 'border border-black/15 bg-transparent text-gray-750 hover:bg-neutral-50 hover:text-black',
        ghost: 'bg-transparent text-gray-500 hover:text-black hover:bg-neutral-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    }[variant];

    const isLink = Component === Link || href;
    const Tag = isLink ? Link : Component;

    return (
        <Tag
            href={href}
            className={`${baseStyle} ${sizeClasses} ${variantClasses} ${className}`}
            {...props}
        >
            {Icon && <Icon size={size === 'sm' ? 12 : 14} className="shrink-0 stroke-[2.5]" />}
            {children}
            {IconRight && <IconRight size={size === 'sm' ? 12 : 14} className="shrink-0 stroke-[2.5]" />}
        </Tag>
    );
}
