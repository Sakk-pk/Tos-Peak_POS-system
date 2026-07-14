import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function AcceptInvitation({ email, token }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('invitations.accept.post'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Accept Team Invitation" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Set Up Your Team Account</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Enter your name and choose a secure password to complete your account setup.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Email (Disabled) */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="mt-1 block w-full bg-gray-100 cursor-not-allowed text-gray-500"
                        disabled
                    />
                </div>

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Your Full Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        Create Account & Join Team
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
