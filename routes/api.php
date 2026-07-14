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