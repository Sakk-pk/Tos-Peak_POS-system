<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TwoFactorSettingsController extends Controller
{
    /**
     * Prepare Two-Factor Authentication (Generate QR code and secret).
     */
    public function store(Request $request): JsonResponse
    {
        // Generate the secret
        $secret = $request->user()->createTwoFactorAuth();

        return response()->json([
            'qr_code' => $secret->toQr(), // SVG QR Code XML string
            'manual_key' => $secret->toString(), // Manual string key
        ]);
    }

    /**
     * Confirm and enable Two-Factor Authentication.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $confirmed = $request->user()->confirmTwoFactorAuth($request->code);

        if ($confirmed) {
            return response()->json([
                'status' => 'success',
                'message' => 'Two-factor authentication enabled successfully.',
                'recovery_codes' => $request->user()->getRecoveryCodes(),
            ]);
        }

        return response()->json([
            'message' => 'The provided code was invalid.',
            'errors' => [
                'code' => ['The provided code was invalid.']
            ]
        ], 422);
    }

    /**
     * Disable Two-Factor Authentication.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->user()->disableTwoFactorAuth();

        return response()->json([
            'status' => 'success',
            'message' => 'Two-factor authentication disabled successfully.'
        ]);
    }

    /**
     * Get Recovery Codes.
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        if (!$request->user()->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is not enabled.'
            ], 403);
        }

        return response()->json([
            'recovery_codes' => $request->user()->getRecoveryCodes()
        ]);
    }
}
