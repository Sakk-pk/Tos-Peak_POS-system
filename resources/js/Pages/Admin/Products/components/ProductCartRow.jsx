import React from 'react';
import TableCardRow from '@/Components/Shared/TableCardRow';
import { useTableRowConfig } from '@/Context/TableRowContext';
import { Tag, Layers, Package } from 'lucide-react';
import Badge from '@/Components/ui/Badge';

export default function ProductCartRow({ product, formatPrice, onEdit, onDelete, onView, variant = 'contiguous' }) {
    const { classes } = useTableRowConfig();
    
    const variants = product.variants || [];

    // Extract unique colors
    const uniqueColors = variants.length > 0
        ? Array.from(
            new Map(
                variants
                    .filter(v => v.color)
                    .map(v => [v.color.id || v.color.name, v.color])
            ).values()
        )
        : product.color ? [product.color] : [];

    // Extract sorted unique sizes
    const uniqueSizes = variants.length > 0
        ? Array.from(
            new Set(variants.map(v => v.size?.name).filter(Boolean))
        ).sort((a, b) => parseFloat(a) - parseFloat(b))
        : product.size ? [product.size.name] : [];

    let sizesDisplay = '';
    if (uniqueSizes.length === 0) {
        sizesDisplay = 'No sizes';
    } else if (uniqueSizes.length === 1) {
        sizesDisplay = `Size: ${uniqueSizes[0]}`;
    } else {
        sizesDisplay = `Sizes: ${uniqueSizes[0]} - ${uniqueSizes[uniqueSizes.length - 1]}`;
    }

    // Calculate total stock
    const totalStock = variants.length > 0
        ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : product.stock || 0;

    const brandName = product.brand?.name ?? product.brand_name ?? product.brand ?? '';
    const categoryName = product.category?.name ?? product.category_name ?? product.category ?? '';
    const subCategoryName = product.sub_category?.name ?? product.sub_category_name ?? product.sub_category ?? '';

    const isOutOfStock = totalStock === 0;
    const isLowStock = totalStock > 0 && totalStock <= (product.low_stock_threshold ?? 20);

    const imageSrc = product.image
        ? (product.image.startsWith('http') || product.image.startsWith('/'))
            ? product.image
            : `/storage/${product.image}`
        : '';

    const isSeparated = variant === 'separated';
    const cellDetailsClass = isSeparated ? classes.cellFirst : 'p-0 align-middle';
    const cellMiddleClass = isSeparated ? classes.cellMiddle : (classes?.cellY || 'py-5');

    return (
        <TableCardRow
            editLabel={`Edit ${product.name}`}
            deleteLabel={`Delete ${product.name}`}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            variant={variant}
        >
            {/* 1. Product details */}
            <td className={cellDetailsClass}>
                <div className="flex items-center h-28 gap-4">
                    {/* Thumbnail */}
                    <div 
                        onClick={onView}
                        className="w-28 h-28 shrink-0 bg-[#F6F6F6] flex items-center justify-center p-3 border-r border-[#E5E7EB] cursor-pointer hover:bg-[#F0F0F0] transition select-none"
                    >
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={product.name}
                                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="h-20 w-20 bg-gray-200/40 border border-black/5 flex flex-col items-center justify-center p-2 text-center text-[8px] font-mono tracking-tighter text-gray-400 uppercase select-none rounded">
                                <span className="font-extrabold block">TOS-PEAK</span>
                                <span className="mt-0.5 text-[6px]">No Product Image</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Brand and name */}
                    <div className="min-w-0 pr-2">
                        {brandName && (
                            <span className="text-[9px] font-black tracking-widest text-[#f97316] font-display uppercase block leading-none mb-1.5">
                                {brandName}
                            </span>
                        )}
                        <h4 
                            onClick={onView}
                            className="text-sm font-extrabold text-gray-900 leading-tight truncate hover:underline cursor-pointer"
                        >
                            {product.name}
                        </h4>
                        {product.description && (
                            <p className="max-w-[340px] text-xs font-semibold text-gray-400 truncate mt-1" title={product.description}>
                                {subCategoryName ? `${subCategoryName} • ` : ''}{product.description}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* 2. Category */}
            <td className={`px-6 align-middle ${cellMiddleClass}`}>
                <Badge variant="default">
                    {categoryName || 'Uncategorized'}
                </Badge>
            </td>

            {/* 3. Base Price */}
            <td className={`px-6 align-middle text-sm font-black text-gray-900 font-mono tracking-tight ${cellMiddleClass}`}>
                {formatPrice(product.price)}
            </td>

            {/* 4. Catalog Options (Colors, Sizes, Stock) */}
            <td className={`px-6 align-middle ${cellMiddleClass}`}>
                <div className="flex flex-col gap-2 justify-center">
                    {/* Colors */}
                    {uniqueColors.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1">
                                {uniqueColors.map((color, idx) => (
                                    <div
                                        key={color.id || idx}
                                        className="h-3 w-3 rounded-full border border-black/15 shadow-sm shrink-0"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold leading-none truncate max-w-[120px] uppercase">
                                {uniqueColors.map(c => c.name).join(', ')}
                            </span>
                        </div>
                    )}
 
                    {/* Sizes and Stock status row */}
                    <div className="flex items-center gap-2 select-none flex-wrap">
                        {/* Sizes Pill */}
                        {uniqueSizes.length > 0 && (
                            <Badge variant="default" size="sm" className="font-mono">
                                <Tag size={10} className="stroke-[2.5] mr-1" />
                                {sizesDisplay}
                            </Badge>
                        )}
 
                        {/* Stock Level with color indicator status chip */}
                        <Badge 
                            variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'} 
                            size="sm"
                            className={isLowStock ? 'animate-pulse' : ''}
                        >
                            <span className={`w-1 h-1 rounded-full mr-1.5 ${
                                isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            {isOutOfStock ? 'OUT' : `${totalStock} units`}
                        </Badge>
                    </div>
                </div>
            </td>
        </TableCardRow>
    );
}