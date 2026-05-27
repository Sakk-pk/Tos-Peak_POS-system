import TableCardRow from '@/Components/Table/TableCardRow';
import { useTableRowConfig } from '@/Context/TableRowContext';

export default function ProductCartRow({ product, formatPrice }) {
    const stockIsLow = product.stock <= 15;
    const { classes } = useTableRowConfig();
    const categoryName = product.category?.name ?? product.category_name ?? product.category ?? '';
    const imageSrc = product.image
        ? (product.image.startsWith('http') || product.image.startsWith('/'))
            ? product.image
            : `/storage/${product.image}`
        : '';

    return (
        <TableCardRow
            editLabel={`Edit ${product.name}`}
            deleteLabel={`Delete ${product.name}`}
        >
            <td className={`px-6 ${classes.cellY}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black/5 ring-1 ring-black/5">
                        <img
                            src={imageSrc}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-black">{product.name}</div>
                        <div className="max-w-[360px] text-xs font-medium leading-5 text-black/50">
                            {product.description}
                        </div>
                    </div>
                </div>
            </td>
            <td className={`px-6 ${classes.cellY}`}>
                <span className="inline-flex rounded-full bg-black/6 px-3 py-1.5 text-sm font-semibold text-black/70">
                    {categoryName}
                </span>
            </td>
            <td className={`px-6 text-sm font-semibold text-black ${classes.cellY}`}>{formatPrice(product.price)}</td>
            <td className={`px-6 ${classes.cellY}`}>
                <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${stockIsLow ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                    {product.stock}
                </span>
            </td>
        </TableCardRow>
    );
}