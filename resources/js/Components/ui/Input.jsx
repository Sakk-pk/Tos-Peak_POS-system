import React from 'react';

export default function Input({
    className = '',
    icon: Icon,
    ...props
}) {
    return (
        <div className="relative w-full">
            {Icon && (
                <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            )}
            <input
                type="text"
                className={`h-[38px] w-full rounded-xl border border-black/10 bg-white pr-4 text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 ${
                    Icon ? 'pl-10' : 'pl-4'
                } ${className}`}
                {...props}
            />
        </div>
    );
}
