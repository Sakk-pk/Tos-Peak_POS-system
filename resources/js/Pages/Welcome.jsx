import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, canLogin, canRegister }) {
    const canEnterSystem = canLogin || auth?.user;

    return (
        <>
            <Head title="TOS-PEAK Performance POS" />

            <div className="relative flex min-h-screen flex-col overflow-hidden bg-white text-gray-900">
                <div className="h-3 w-full bg-black" />

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,0,0,0.018)_1px,transparent_1px)] bg-[length:18px_18px] opacity-30" />

                <main className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                    <svg className="pointer-events-none absolute left-1/2 top-[46%] -z-10 h-[640px] w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-20" viewBox="0 0 900 520" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <defs>
                            <linearGradient id="g2" x1="0" x2="1">
                                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                                <stop offset="100%" stopColor="#000" stopOpacity="0.03" />
                            </linearGradient>
                        </defs>
                        <path d="M120 80 L760 30 L820 240 L420 480 L80 420 Z" fill="url(#g2)" />
                    </svg>

                    <div className="relative h-full w-full min-h-[calc(100vh-6rem)]">
                        <div className="absolute right-4 top-4 hidden md:block lg:right-8 lg:top-8">
                            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">ACTIVE PEAK-POWER</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="text-2xl font-extrabold text-red-600">98.4%</div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">⚡</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-4 hidden md:block lg:bottom-8 lg:left-8">
                            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow">📈</div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">SYSTEM STATUS</p>
                                        <div className="mt-1 text-lg font-black">OPTIMAL</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
                            <div className="relative z-10 mx-auto flex w-full max-w-[820px] flex-col items-center justify-center px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
                                <div className="inline-flex items-center justify-center rounded-lg bg-black px-8 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
                                    <span className="text-lg font-extrabold tracking-wide text-white">TOS-PEAK</span>
                                </div>

                                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.5em] text-gray-600">PERFORMANCE POS</p>

                                <h1 className="mt-7 text-[clamp(3.4rem,7vw,6.5rem)] font-black leading-[0.9] tracking-tight text-gray-900">
                                    <span className="block">MOVE WITHOUT</span>
                                    <span className="block text-red-600">LIMITS</span>
                                </h1>

                                <p className="mx-auto mt-7 max-w-3xl text-[clamp(1rem,1.6vw,1.35rem)] leading-[1.65] text-gray-600">
                                    Engineered for elite athletic retail environments. Precision control, real-time analytics, and uncompromising speed.
                                </p>

                                <div className="mt-10 flex justify-center">
                                    {canEnterSystem ? (
                                        <Link
                                            href={auth?.user ? (auth.user.redirect_url || '/pos') : route('login')}
                                            className="inline-flex items-center gap-4 rounded-xl bg-red-600 px-12 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(220,38,38,0.18)] transition hover:bg-red-700 hover:shadow-[0_22px_50px_rgba(220,38,38,0.28)]"
                                        >
                                            <span>Enter System</span>
                                            <span aria-hidden className="text-xl">→</span>
                                        </Link>
                                    ) : null}
                                </div>

                                <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full border border-gray-300" /> Secure Terminal</span>
                                    <span className="flex items-center gap-2"><span className="inline-block h-4 w-4 rounded border border-gray-300" /> High Frequency</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
