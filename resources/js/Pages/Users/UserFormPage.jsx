import InputError from '@/Components/InputError';
import FormPageShell from '@/Components/Shared/FormPageShell';
import { useForm } from '@inertiajs/react';

export default function UserFormPage({ user = {}, roles = [] }) {
    const { data, setData, post, patch, errors, reset, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            password: '',
            roles: (user.roles?.map(role => role.name) || []),
        });
    
    const submit = (e) => {
        e.preventDefault();
        if (!user.id) {
            post(route('users.store'), {
                preserveState: true,
                onFinish: () => {
                    reset();
                },
            });
        } else {
            patch(route('users.update', user.id), {
                preserveState: true,
                onFinish: () => {
                    reset();
                },
            });
        }
    };

    const headWeb = 'User Create';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <FormPageShell
            title={headWeb}
            breadcrumbTitle={headWeb}
            breadcrumbLinks={linksBreadcrumb}
            sectionClassName="content"
            layoutChildrenClassName="row"
        >
            <div className="col-md-12">
                <div className="card card-outline card-info">
                    <div className="card-header">
                        <h3 className="card-title">Register Data Management</h3>
                    </div>
                    <form onSubmit={submit}>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="text-uppercase" htmlFor="name">
                                    <span className="text-danger">*</span> Name
                                </label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    type="text"
                                    name="name"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="form-group">
                                <label className="text-uppercase" htmlFor="email">
                                    <span className="text-danger">*</span> Email
                                </label>
                                <input
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    type="email"
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="form-group">
                                <label className="text-uppercase" htmlFor="password">
                                    <span className="text-danger">*</span> Password
                                </label>
                                <input
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    name="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                />
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            <div className="form-group">
                                <label className="text-uppercase" htmlFor="roles">
                                    <span className="text-danger">*</span> Roles
                                </label>
                                    <select
                                        id="roles"
                                        name="roles"
                                        value={data.roles[0] || ''}
                                        onChange={(e) => setData('roles', [e.target.value])}
                                        className="w-full rounded border border-gray-300 p-2"
                                    >
                                        <option value="">-- Select role --</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>

                                <InputError className="mt-2" message={errors.roles} />
                            </div>
                        </div>

                        <div className="card-footer clearfix">
                            <button disabled={processing} type="submit" className="btn btn-primary">
                                {processing ? (user?.id ? 'Updating...' : 'Saving...') : (user?.id ? 'Update' : 'Save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </FormPageShell>
    );
}