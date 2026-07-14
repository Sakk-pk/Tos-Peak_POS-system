import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Save, Send, Settings, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Toast from '@/Components/Toast';

export default function SystemSettingsPage({ settings, logs }) {
    const [toast, setToast] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        telegram_bot_token: settings.telegram_bot_token || '',
        telegram_chat_id: settings.telegram_chat_id || '',
        telegram_alerts_enabled: settings.telegram_alerts_enabled === 'true',
    });

    const { post: postTest, processing: testing } = useForm({
        telegram_bot_token: data.telegram_bot_token,
        telegram_chat_id: data.telegram_chat_id,
    });

    const handleSave = (e) => {
        e.preventDefault();
        post(route('system-settings.telegram.update'), {
            onSuccess: () => setToast({ type: 'success', message: 'Settings saved successfully.' }),
            onError: () => setToast({ type: 'error', message: 'Failed to save settings.' }),
        });
    };

    const handleTest = () => {
        postTest(route('system-settings.telegram.test'), {
            onSuccess: () => setToast({ type: 'success', message: 'Test message dispatched!' }),
            onError: () => setToast({ type: 'error', message: 'Failed to dispatch test message.' }),
        });
    };

    const StatusBadge = ({ status }) => {
        if (status === 'sent') return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-md"><CheckCircle2 size={12}/> Sent</span>;
        if (status === 'failed') return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-md"><XCircle size={12}/> Failed</span>;
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-md"><Clock size={12}/> Pending</span>;
    };

    return (
        <AdminLayout>
            <Head title="System Settings" />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black font-syne uppercase tracking-tight">System Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global application configurations and integrations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Nav for settings (if more are added later) */}
                    <div className="col-span-1">
                        <nav className="flex flex-col space-y-1">
                            <button className="flex items-center gap-3 px-3 py-2 bg-black text-white rounded-lg font-medium text-sm transition-colors">
                                <Settings size={18} />
                                Telegram Bot
                            </button>
                        </nav>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-6">
                        {/* Telegram Form */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                                <h2 className="text-lg font-bold">Telegram Bot Configuration</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure bot token and chat ID to receive real-time POS alerts and low stock notifications.</p>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Bot Token</label>
                                    <input
                                        type="text"
                                        value={data.telegram_bot_token}
                                        onChange={e => setData('telegram_bot_token', e.target.value)}
                                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                    />
                                    {errors.telegram_bot_token && <p className="text-sm text-red-500 mt-1">{errors.telegram_bot_token}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Chat ID</label>
                                    <input
                                        type="text"
                                        value={data.telegram_chat_id}
                                        onChange={e => setData('telegram_chat_id', e.target.value)}
                                        placeholder="-1001234567890"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                    />
                                    {errors.telegram_chat_id && <p className="text-sm text-red-500 mt-1">{errors.telegram_chat_id}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="telegram_alerts_enabled"
                                        checked={data.telegram_alerts_enabled}
                                        onChange={e => setData('telegram_alerts_enabled', e.target.checked)}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                    />
                                    <label htmlFor="telegram_alerts_enabled" className="text-sm font-medium text-gray-900">
                                        Enable all Telegram alerts globally
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleTest}
                                        disabled={testing || !data.telegram_bot_token || !data.telegram_chat_id}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Send size={16} />
                                        Test Connection
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        Save Configuration
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Logs */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 px-6">
                                <h3 className="font-bold">Recent Notification Logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Time</th>
                                            <th className="px-6 py-3 font-semibold">Type</th>
                                            <th className="px-6 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                    No recent logs.
                                                </td>
                                            </tr>
                                        ) : logs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-3 font-mono text-xs text-gray-500">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="font-medium">{log.type.replace('_', ' ')}</span>
                                                    {log.product && (
                                                        <span className="ml-2 text-xs text-gray-400">({log.product.name})</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <StatusBadge status={log.status} />
                                                    {log.retries > 0 && <span className="ml-2 text-xs text-gray-400">({log.retries} retries)</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
