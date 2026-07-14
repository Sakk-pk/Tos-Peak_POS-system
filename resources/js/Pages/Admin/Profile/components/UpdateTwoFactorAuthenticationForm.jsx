import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UpdateTwoFactorAuthenticationForm({ twoFactorEnabled, className = '' }) {
    const [enabled, setEnabled] = useState(twoFactorEnabled);
    const [confirming, setConfirming] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [manualKey, setManualKey] = useState(null);
    const [code, setCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);

    useEffect(() => {
        setEnabled(twoFactorEnabled);
    }, [twoFactorEnabled]);

    const enableTwoFactor = () => {
        setProcessing(true);
        setErrors({});

        axios.post(route('two-factor.enable'))
            .then(response => {
                setQrCode(response.data.qr_code);
                setManualKey(response.data.manual_key);
                setConfirming(true);
                setProcessing(false);
            })
            .catch(error => {
                setProcessing(false);
                if (error.response && error.response.data) {
                    setErrors({ enable: error.response.data.message || 'Failed to prepare two-factor authentication.' });
                }
            });
    };

    const confirmTwoFactor = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        axios.post(route('two-factor.confirm'), { code })
            .then(response => {
                setEnabled(true);
                setConfirming(false);
                setQrCode(null);
                setManualKey(null);
                setCode('');
                setRecoveryCodes(response.data.recovery_codes || []);
                setShowRecoveryCodesModal(true);
                setProcessing(false);
            })
            .catch(error => {
                setProcessing(false);
                if (error.response && error.response.data) {
                    setErrors(error.response.data.errors || { code: [error.response.data.message] });
                }
            });
    };

    const disableTwoFactor = () => {
        setProcessing(true);
        setErrors({});

        axios.delete(route('two-factor.disable'))
            .then(() => {
                setEnabled(false);
                setConfirming(false);
                setQrCode(null);
                setManualKey(null);
                setCode('');
                setRecoveryCodes([]);
                setProcessing(false);
            })
            .catch(error => {
                setProcessing(false);
                if (error.response && error.response.data) {
                    setErrors({ disable: error.response.data.message || 'Failed to disable two-factor authentication.' });
                }
            });
    };

    const fetchRecoveryCodes = () => {
        setProcessing(true);
        setErrors({});

        axios.get(route('two-factor.recovery-codes'))
            .then(response => {
                setRecoveryCodes(response.data.recovery_codes || []);
                setShowRecoveryCodesModal(true);
                setProcessing(false);
            })
            .catch(error => {
                setProcessing(false);
                if (error.response && error.response.data) {
                    setErrors({ recovery: error.response.data.message || 'Failed to fetch recovery codes.' });
                }
            });
    };

    const cancelConfirmation = () => {
        setConfirming(false);
        setQrCode(null);
        setManualKey(null);
        setCode('');
        setErrors({});
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two-factor authentication.
                </p>
            </header>

            <div className="mt-6 space-y-6">
                {enabled ? (
                    <div>
                        <h3 className="text-md font-medium text-green-600">
                            Two-factor authentication is enabled.
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator, Microsoft Authenticator, or Authy application.
                        </p>
                    </div>
                ) : confirming ? (
                    <div>
                        <h3 className="text-md font-medium text-gray-900">
                            Finish enabling two-factor authentication.
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            To finish enabling two-factor authentication, scan the QR code using a compatible authenticator app or enter the setup key manually, then enter the generated 6-digit confirmation code below.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-md font-medium text-gray-900">
                            You have not enabled two-factor authentication.
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's authenticator application.
                        </p>
                    </div>
                )}

                {/* QR Code and Key section for confirmation */}
                {confirming && qrCode && (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                        <div className="space-y-4">
                            <div className="text-sm font-semibold text-gray-700">
                                Setup Key: <span className="rounded bg-gray-100 px-2 py-1 font-mono text-red-600">{manualKey}</span>
                            </div>

                            <form onSubmit={confirmTwoFactor} className="max-w-md space-y-4">
                                <div>
                                    <InputLabel htmlFor="code" value="Verification Code" />

                                    <TextInput
                                        id="code"
                                        type="text"
                                        name="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="mt-1 block w-full font-mono text-center tracking-widest text-lg"
                                        placeholder="000000"
                                        maxLength="6"
                                        required
                                        autoFocus
                                        autoComplete="one-time-code"
                                    />

                                    <InputError message={errors.code?.[0]} className="mt-2" />
                                </div>

                                <div className="flex gap-4">
                                    <PrimaryButton type="submit" disabled={processing}>
                                        Confirm
                                    </PrimaryButton>
                                    <SecondaryButton type="button" onClick={cancelConfirmation} disabled={processing}>
                                        Cancel
                                    </SecondaryButton>
                                </div>
                            </form>
                        </div>

                        <div className="mx-auto w-full max-w-[280px] rounded-lg border border-gray-200 bg-white p-4">
                            <div
                                className="overflow-hidden rounded-md [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                                dangerouslySetInnerHTML={{ __html: qrCode }}
                            />
                        </div>
                    </div>
                )}

                {errors.enable && (
                    <InputError message={errors.enable} className="mt-2" />
                )}
                {errors.disable && (
                    <InputError message={errors.disable} className="mt-2" />
                )}

                {!confirming && (
                    <div className="flex gap-4">
                        {!enabled ? (
                            <PrimaryButton type="button" onClick={enableTwoFactor} disabled={processing}>
                                Enable
                            </PrimaryButton>
                        ) : (
                            <>
                                <SecondaryButton type="button" onClick={fetchRecoveryCodes} disabled={processing}>
                                    Show Recovery Codes
                                </SecondaryButton>
                                <DangerButton type="button" onClick={disableTwoFactor} disabled={processing}>
                                    Disable
                                </DangerButton>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Recovery Codes Modal */}
            <Modal show={showRecoveryCodesModal} onClose={() => setShowRecoveryCodesModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Two-Factor Recovery Codes
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 p-4 font-mono bg-gray-50 rounded-lg text-sm text-center tracking-wider text-gray-800">
                        {recoveryCodes.map((code, index) => (
                            <div key={index} className="py-1">
                                {typeof code === 'string' ? code : code.code}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowRecoveryCodesModal(false)}>
                            Close
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
