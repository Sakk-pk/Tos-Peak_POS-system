<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KhqrController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([ 'middleware' => 'api', 'prefix' => 'auth' ], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('jwt')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
    });
});

// ── Bakong KHQR Payment Routes ────────────────────────────────────────────────
// Webhook route is public with rate-limiting throttle middleware
Route::post('/khqr/webhook',         [KhqrController::class, 'webhook'])
    ->name('khqr.webhook')
    ->middleware('throttle:60,1');

// Uses Sanctum stateful auth (session cookie) — works from the Inertia SPA
Route::middleware('auth:sanctum,web')->group(function () {
    Route::post('/khqr/generate',        [KhqrController::class, 'generateQr'])->name('khqr.generate');
    Route::get('/khqr/check/{md5}',      [KhqrController::class, 'checkStatus'])->name('khqr.check');
    Route::post('/khqr/manual-confirm',  [KhqrController::class, 'manualConfirm'])->name('khqr.manual-confirm');
});

// ── Telegram Bot API Test Route ────────────────────────────────────────────────
Route::post('/telegram/test', function (Request $request) {
    $validated = $request->validate([
        'telegram_bot_token' => 'required|string',
        'telegram_chat_id' => 'required|string',
    ]);

    \App\Models\Notification\Setting::updateOrCreate(['key' => 'telegram_bot_token'], ['value' => $validated['telegram_bot_token']]);
    \App\Models\Notification\Setting::updateOrCreate(['key' => 'telegram_chat_id'], ['value' => $validated['telegram_chat_id']]);

    $log = \App\Models\Notification\TelegramNotificationLog::create([
        'type' => 'test',
        'message' => "🧪 <b>TOS-PEAK Alert System Test</b>\nIf you are seeing this message, your Telegram Bot connection is successful!",
        'status' => 'pending'
    ]);

    \App\Jobs\SendTelegramNotification::dispatch($log, 'test');

    return response()->json([
        'success' => true,
        'message' => 'Telegram test notification dispatched successfully.',
        'data' => [
            'log_id' => $log->id,
            'chat_id' => $validated['telegram_chat_id'],
            'status' => 'dispatched'
        ]
    ]);
});