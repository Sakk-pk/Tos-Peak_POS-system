import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head } from '@inertiajs/react';

export default function FormPageShell({
    title,
    breadcrumbTitle,
    breadcrumbLinks,
    sectionClassName = 'content',
    children,
    layoutChildrenClassName = '',
    navbarTitle,
    contentClassName,
    showBreadcrumb = true,
}) {
    return (
        <AdminLayout
            breadcrumb={showBreadcrumb ? <Breadcrumb header={breadcrumbTitle ?? title} links={breadcrumbLinks} /> : null}
            navbarTitle={navbarTitle ?? breadcrumbTitle ?? title}
            contentClassName={contentClassName}
        >
            <Head title={title} />
            <section className={sectionClassName}>
                <div className={layoutChildrenClassName}>
                    {children}
                </div>
            </section>
        </AdminLayout>
    );
}
