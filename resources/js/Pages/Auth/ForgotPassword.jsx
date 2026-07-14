import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                        Reset Password
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mt-1">
                        Find Your Account.
                    </h2>
                </div>

                <div className="text-xs leading-relaxed text-gray-500 font-medium">
                    Forgot your password? No problem. Enter your registered email address and we will email you a secure link to reset it.
                </div>

                {status && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="name@example.com"
                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-gray-400"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <PrimaryButton
                            className="flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Email Reset Link'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
