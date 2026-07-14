import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const codeInput = useRef();

    const { data, setData, post, processing, errors, reset } = useForm({
        '2fa_code': '',
    });

    const toggleRecovery = () => {
        setRecovery(!recovery);
        setData('2fa_code', '');
        reset('2fa_code');
        setTimeout(() => codeInput.current?.focus(), 100);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('2fa_code'),
            onError: () => codeInput.current?.focus(),
        });
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Confirmation" />

            <div className="mb-4 text-sm text-gray-600">
                {recovery
                    ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                    : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'}
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel 
                        htmlFor="2fa_code" 
                        value={recovery ? 'Recovery Code' : 'Code'} 
                    />

                    <TextInput
                        id="2fa_code"
                        type="text"
                        name="2fa_code"
                        ref={codeInput}
                        value={data['2fa_code']}
                        className="mt-1 block w-full text-center font-mono tracking-widest text-lg"
                        autoComplete="one-time-code"
                        autoFocus
                        placeholder={recovery ? 'xxxx-xxxx' : '000000'}
                        onChange={(e) => setData('2fa_code', e.target.value)}
                    />

                    <InputError message={errors['2fa_code']} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        className="text-sm text-gray-600 no-underline hover:text-gray-900 focus:outline-none"
                        onClick={toggleRecovery}
                    >
                        {recovery ? 'Use an authenticator code' : 'Use a recovery code'}
                    </button>

                    <PrimaryButton disabled={processing}>
                        Confirm
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
