<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\TelegramNotificationLog;
use App\Services\TelegramService;
use App\Jobs\SendTelegramNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        $logs = TelegramNotificationLog::with('product')
                    ->orderBy('created_at', 'desc')
                    ->take(20)
                    ->get();

        return Inertia::render('Admin/Settings/SystemSettingsPage', [
            'settings' => $settings,
            'logs' => $logs
        ]);
    }

    public function updateTelegramSettings(Request $request)
    {
        $validated = $request->validate([
            'telegram_bot_token' => 'nullable|string',
            'telegram_chat_id' => 'nullable|string',
            'telegram_alerts_enabled' => 'nullable|boolean',
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'telegram_alerts_enabled') {
                $value = $value ? 'true' : 'false';
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Telegram settings updated successfully.');
    }

    public function testTelegramConnection(Request $request)
    {
        $validated = $request->validate([
            'telegram_bot_token' => 'required|string',
            'telegram_chat_id' => 'required|string',
        ]);

        // Temporarily save to settings to allow the service to pick it up, or just instantiate a direct one
        // Wait, TelegramService checks Setting:: first. We'll update settings first.
        Setting::updateOrCreate(['key' => 'telegram_bot_token'], ['value' => $validated['telegram_bot_token']]);
        Setting::updateOrCreate(['key' => 'telegram_chat_id'], ['value' => $validated['telegram_chat_id']]);

        $log = TelegramNotificationLog::create([
            'type' => 'test',
            'message' => '🧪 <b>TOS-PEAK Alert System Test</b>' . "\n" . 'If you are seeing this message, your Telegram Bot connection is successful!',
            'status' => 'pending'
        ]);

        SendTelegramNotification::dispatch($log, 'test');

        return redirect()->back()->with('success', 'Test notification dispatched. Please check your Telegram.');
    }
}
