export default function PageHeader({
    eyebrow,
    eyebrowIcon: Icon,
    title,
    description,
    actions,
    className = '',
}) {
    return (
        <div className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${className}`}>
            <div>
                {eyebrow ? (
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/55 shadow-sm">
                        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                        {eyebrow}
                    </p>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">{title}</h1>
                {description ? <p className="mt-2 max-w-2xl text-sm font-medium text-black/55">{description}</p> : null}
            </div>

            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
    );
}