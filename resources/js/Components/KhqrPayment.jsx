import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle2, RefreshCw, Clock, Loader2, AlertCircle, ShieldAlert, Lock } from 'lucide-react';

const POLL_INTERVAL_MS = 3000;   // poll every 3 seconds
const EXPIRY_MINUTES   = 10;     // QR expires in 10 minutes

/**
 * KhqrPayment — Generates and displays a real Bakong KHQR code,
 * then polls the server every 3 s until the payment is confirmed.
 */
export default function KhqrPayment({ 
    grandTotal, 
    amount, 
    cartItems, 
    orderItems, 
    customerEmail, 
    onSuccess, 
    onCancel 
}) {
    const finalAmount = grandTotal !== undefined ? grandTotal : amount;
    const finalItems = cartItems !== undefined ? cartItems : orderItems;

    const [phase, setPhase]             = useState('loading');  // loading | qr | success | error | supervisor_auth
    const [qrString, setQrString]       = useState('');
    const [md5, setMd5]                 = useState('');
    const [errorMsg, setErrorMsg]       = useState('');
    const [secondsLeft, setSecondsLeft] = useState(EXPIRY_MINUTES * 60);

    // Supervisor override auth states
    const [supervisorEmail, setSupervisorEmail] = useState('');
    const [supervisorPassword, setSupervisorPassword] = useState('');
    const [supervisorError, setSupervisorError] = useState('');
    const [supervisorVerifying, setSupervisorVerifying] = useState(false);

    const pollRef    = useRef(null);
    const timerRef   = useRef(null);
    const orderId    = useRef(null);

    // ── Generate QR on mount ─────────────────────────────────────────────────
    useEffect(() => {
        generateQr();
        return () => clearIntervals();
    }, []);

    // ── Countdown timer ──────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'qr') return;
        timerRef.current = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    clearIntervals();
                    handleExpiry();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase]);

    function clearIntervals() {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
    }

    async function handleExpiry() {
        setPhase('error');
        setErrorMsg('QR code expired. The order has been cancelled and stock released.');
        if (orderId.current) {
            try {
                await axios.post(`/orders/${orderId.current}/cancel`);
            } catch (err) {
                console.error('Failed to cancel expired order:', err);
            }
        }
    }

    async function generateQr() {
        setPhase('loading');
        setErrorMsg('');
        setSecondsLeft(EXPIRY_MINUTES * 60);

        try {
            // First create the Pending Order (reservations are secured via database pessimistic locking)
            const { data } = await axios.post('/orders', {
                customer_name: 'Walk-in Customer',
                customer_email: customerEmail || null,
                customer_phone: null,
                payment_method: 'qr',
                cash_received: parseFloat(finalAmount.toFixed(2)),
                items: (finalItems || []).map(item => ({ id: item.id, quantity: item.quantity }))
            }, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!data.success) throw new Error(data.message || 'Failed to initialize order.');

            // Store order ID for reconnection / release handling
            orderId.current = data.order.id;

            setQrString(data.qr_string);
            setMd5(data.khqr_md5);
            setPhase('qr');

            // Start polling for payment status
            pollRef.current = setInterval(() => pollStatus(data.khqr_md5), POLL_INTERVAL_MS);
        } catch (err) {
            setPhase('error');
            setErrorMsg(err.response?.data?.message || err.message || 'Could not initialize QR code checkout.');
        }
    }

    async function pollStatus(khqrMd5) {
        try {
            const { data } = await axios.get(`/api/khqr/check/${khqrMd5}`);

            if (data.status === 'paid') {
                clearIntervals();
                setPhase('success');

                const sessionOrder = data.order;
                const receiptOrderId = sessionOrder?.order_number
                    || (sessionOrder?.id ? `#${String(sessionOrder.id).padStart(4, '0')}` : `TP-${Math.floor(100000 + Math.random() * 900000)}`);
                const date = sessionOrder?.created_at
                    ? new Date(sessionOrder.created_at).toLocaleString()
                    : new Date().toLocaleString();

                // Order is already updated to Paid on the server
                onSuccess({
                    orderId: receiptOrderId,
                    date,
                    paymentMethod: 'qr',
                });
            }
        } catch (_) {
            // Network hiccup — keep polling
        }
    }

    async function handleManualConfirmSubmit(e) {
        e.preventDefault();
        setSupervisorError('');
        setSupervisorVerifying(true);

        try {
            const { data } = await axios.post('/api/khqr/manual-confirm', {
                md5: md5,
                supervisor_email: supervisorEmail,
                supervisor_password: supervisorPassword
            });

            if (data.success) {
                clearIntervals();
                setPhase('success');
                
                // Fetch the updated order details
                const checkRes = await axios.get(`/api/khqr/check/${md5}`);
                const sessionOrder = checkRes.data.order;
                
                const receiptOrderId = sessionOrder?.order_number
                    || (sessionOrder?.id ? `#${String(sessionOrder.id).padStart(4, '0')}` : `TP-${Math.floor(100000 + Math.random() * 900000)}`);
                const date = sessionOrder?.created_at
                    ? new Date(sessionOrder.created_at).toLocaleString()
                    : new Date().toLocaleString();

                onSuccess({
                    orderId: receiptOrderId,
                    date,
                    paymentMethod: 'qr',
                });
            }
        } catch (err) {
            setSupervisorError(err.response?.data?.message || 'Verification failed. Invalid credentials or payment is still pending.');
        } finally {
            setSupervisorVerifying(false);
        }
    }

    async function triggerManualConfirm() {
        // First try to check without supervisor credentials (if current cashier has Admin/Manager roles)
        setSupervisorError('');
        try {
            const { data } = await axios.post('/api/khqr/manual-confirm', { md5: md5 });
            if (data.success) {
                clearIntervals();
                setPhase('success');

                const checkRes = await axios.get(`/api/khqr/check/${md5}`);
                const sessionOrder = checkRes.data.order;

                const receiptOrderId = sessionOrder?.order_number
                    || (sessionOrder?.id ? `#${String(sessionOrder.id).padStart(4, '0')}` : `TP-${Math.floor(100000 + Math.random() * 900000)}`);
                const date = sessionOrder?.created_at
                    ? new Date(sessionOrder.created_at).toLocaleString()
                    : new Date().toLocaleString();

                onSuccess({
                    orderId: receiptOrderId,
                    date,
                    paymentMethod: 'qr',
                });
            }
        } catch (err) {
            if (err.response?.data?.requires_auth) {
                // Switch phase to input supervisor credentials
                setPhase('supervisor_auth');
            } else {
                setErrorMsg(err.response?.data?.message || 'Payment status verification failed. Please try again.');
                setPhase('error');
            }
        }
    }

    async function handleCancel() {
        clearIntervals();
        if (orderId.current) {
            try {
                // Release reserved stock and mark order as Cancelled on the server
                await axios.post(`/orders/${orderId.current}/cancel`);
            } catch (err) {
                console.error('Failed to cancel order:', err);
            }
        }
        onCancel();
    }

    function formatTime(secs) {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (phase === 'loading') {
        return (
            <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Initializing secure order checkout...</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (phase === 'error') {
        return (
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-red-600 text-center max-w-[280px]">{errorMsg}</p>
                <div className="flex gap-2.5 mt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={generateQr}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry QR
                    </button>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (phase === 'success') {
        return (
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-100/50 animate-bounce-once">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-center">
                    <p className="text-base font-black text-gray-900">Payment Verified!</p>
                    <p className="text-xs text-gray-400 mt-0.5">Finalizing transaction receipt...</p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        );
    }

    // ── Supervisor Authentication Override Modal View ────────────────────────
    if (phase === 'supervisor_auth') {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm w-full space-y-4">
                <div className="flex items-center gap-2.5 text-amber-600 bg-amber-50 px-3.5 py-2.5 rounded-xl border border-amber-100">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold leading-tight">Supervisor Authorization Required</p>
                        <p className="text-[10px] text-amber-600/85 mt-0.5">Admin or Manager credentials required to manual verify.</p>
                    </div>
                </div>

                <form onSubmit={handleManualConfirmSubmit} className="space-y-3 text-left">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Supervisor Email</label>
                        <input
                            type="email"
                            required
                            value={supervisorEmail}
                            onChange={e => setSupervisorEmail(e.target.value)}
                            placeholder="supervisor@tospeak.com"
                            className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-red-600 transition"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Supervisor Password</label>
                        <input
                            type="password"
                            required
                            value={supervisorPassword}
                            onChange={e => setSupervisorPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-red-600 transition"
                        />
                    </div>

                    {supervisorError && (
                        <p className="text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg">{supervisorError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setPhase('qr');
                                setSupervisorEmail('');
                                setSupervisorPassword('');
                                setSupervisorError('');
                                pollRef.current = setInterval(() => pollStatus(md5), POLL_INTERVAL_MS);
                            }}
                            className="flex-1 h-9 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                        >
                            Back to QR
                        </button>
                        <button
                            type="submit"
                            disabled={supervisorVerifying}
                            className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                            {supervisorVerifying ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Lock className="h-3.5 w-3.5" />
                            )}
                            Verify & Approve
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // ── QR Code Display ──────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Bakong-style QR card */}
            <div className="relative flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-5 shadow-lg w-full max-w-[340px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 w-full border-b border-neutral-100 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 shadow-sm shadow-red-600/20">
                        <span className="text-white font-black text-xs">B</span>
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black text-neutral-950 uppercase tracking-wider leading-none">Bakong KHQR</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Scan to Pay</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100/50 rounded-lg px-2.5 py-1 select-none">
                        <Clock className="h-3 w-3" />
                        {formatTime(secondsLeft)}
                    </div>
                </div>

                {/* QR Code */}
                <div className="p-4 rounded-2xl border border-neutral-150 bg-white shadow-sm">
                    <QRCodeSVG
                        value={qrString}
                        size={170}
                        level="M"
                        includeMargin={false}
                        bgColor="transparent"
                        fgColor="#111111"
                    />
                </div>

                {/* Amount */}
                <div className="mt-4 text-center">
                    <p className="text-[9.5px] text-neutral-400 font-black uppercase tracking-widest">Amount to Pay</p>
                    <p className="text-2xl font-extrabold text-neutral-950 tracking-tight mt-1">
                        ${(finalAmount || 0).toFixed(2)} <span className="text-xs font-extrabold text-neutral-400 uppercase">USD</span>
                    </p>
                </div>

                {/* Polling indicator */}
                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Waiting for payment…
                </div>

                {/* Manual Confirm Button */}
                <button
                    type="button"
                    onClick={triggerManualConfirm}
                    className="mt-4 w-full flex h-11 items-center justify-center bg-black hover:bg-neutral-900 active:scale-[0.98] text-white text-xs font-black uppercase tracking-widest rounded-none transition duration-150 shadow-sm"
                >
                    Confirm Payment Manually
                </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-6 mt-1">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition underline decoration-1"
                >
                    Cancel Order
                </button>
                <button
                    type="button"
                    onClick={generateQr}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh QR
                </button>
            </div>
        </div>
    );
}
