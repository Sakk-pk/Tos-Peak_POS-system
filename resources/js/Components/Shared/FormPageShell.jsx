import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function FormPageShell({
    title,
    breadcrumbTitle,
    breadcrumbLinks,
    sectionClassName = 'content',
    children,
    layoutChildrenClassName = '',
}) {
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={breadcrumbTitle ?? title} links={breadcrumbLinks} />}>
            <Head title={title} />
            <section className={sectionClassName}>
                <div className={layoutChildrenClassName}>
                    {children}
                </div>
            </section>
        </AdminLayout>
    );
}