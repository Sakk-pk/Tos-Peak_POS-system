import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                        Join Us
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mt-1">
                        Create Account.
                    </h2>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel htmlFor="email" value="Email address" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <Link
                            href={route('login')}
                            className="text-sm font-semibold text-gray-500 no-underline transition hover:text-gray-900"
                        >
                            Already registered?
                        </Link>

                        <PrimaryButton
                            className="flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={processing}
                        >
                            {processing ? 'Registering...' : 'Register'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
