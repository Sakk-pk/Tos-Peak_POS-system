import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign in" />

            <div className="space-y-8">
                <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                        Sign in
                    </p>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                            Welcome back.
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Use your email and password, or continue with Google.
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Email address" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span>Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-gray-600 no-underline transition hover:text-gray-900"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton
                        className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </PrimaryButton>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-[0.24em] text-gray-400">
                        <span className="bg-white px-3">or continue with</span>
                    </div>
                </div>

                <a
                    href={route('google.redirect')}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                >
                    <span className="flex size-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                        G
                    </span>
                    Continue with Google
                </a>
            </div>
        </GuestLayout>
    );
}
