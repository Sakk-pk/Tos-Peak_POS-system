<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\PaymentRepositoryInterface;
use App\Services\KhqrService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class KhqrController extends Controller
{
    protected KhqrService $khqrService;
    protected PaymentService $paymentService;
    protected PaymentRepositoryInterface $paymentRepo;

    public function __construct(
        KhqrService $khqrService,
        PaymentService $paymentService,
        PaymentRepositoryInterface $paymentRepo,
    ) {
        $this->khqrService    = $khqrService;
        $this->paymentService = $paymentService;
        $this->paymentRepo    = $paymentRepo;
    }

    /**
     * Generate a dynamic KHQR string for the given amount.
     * POST /api/khqr/generate
     *
     * Note: This endpoint does NOT create an order — orders are managed by
     * OrderController::store in Tos-Peak. It only generates the QR and records
     * a pending payment row linked to the order after it is created.
     */
    public function generateQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount'      => 'required|numeric|min:0.01',
            'currency'    => 'sometimes|string|in:USD,KHR',
            'bill_number' => 'sometimes|string|max:25',
            'order_id'    => 'sometimes|integer|exists:orders,id',
        ]);

        $currency   = strtoupper($validated['currency'] ?? 'USD');
        $billNumber = $validated['bill_number'] ?? ('TP-' . now()->format('YmdHis'));
        $amount     = (float) $validated['amount'];
        $orderId    = $validated['order_id'] ?? null;

        try {
            $khqrData = $this->khqrService->generateDynamicKhqr($amount, $currency, $billNumber);

            // Record a pending payment row so status polling can find it
            $payment = $this->paymentRepo->create([
                'order_id'       => $orderId,
                'amount'         => $amount,
                'currency'       => $currency,
                'khqr_md5'       => $khqrData['md5'],
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'success'     => true,
                'qr_string'   => $khqrData['qr'],
                'md5'         => $khqrData['md5'],
                'payment_id'  => $payment->id,
                'expiry_time' => now()->addMinutes(10)->toIso8601String(),
            ]);
        } catch (Exception $e) {
            Log::error('KHQR generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Poll Bakong API for payment status by MD5 hash.
     * GET /api/khqr/check/{md5}
     */
    public function checkStatus(string $md5): JsonResponse
    {
        $status = $this->paymentService->checkPaymentStatus($md5);

        $order = null;
        $payment = $this->paymentRepo->findByMd5($md5);
        if ($payment && $payment->order_id) {
            $order = \App\Models\Order::with('items')->find($payment->order_id);
        }

        return response()->json([
            'success' => true,
            'status'  => $status,
            'order'   => $order,
        ]);
    }

    /**
     * Handle Bakong webhook push notification with HMAC verification.
     * POST /api/khqr/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::info('Bakong webhook payload received:', [
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
            'body' => $request->all(),
        ]);

        // 1. IP Whitelisting Validation
        $whitelistedIps = config('bakong.whitelisted_ips', []);
        if (!empty($whitelistedIps)) {
            $clientIp = $request->ip();
            if (!in_array($clientIp, $whitelistedIps, true)) {
                Log::warning('Bakong webhook blocked: IP not in whitelist: ' . $clientIp);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized sender IP.',
                ], 403);
            }
        }

        // 2. HMAC-SHA256 Signature Verification
        if (!$this->verifyWebhookSignature($request)) {
            Log::warning('Bakong webhook blocked: Invalid signature validation failed.');
            return response()->json([
                'success' => false,
                'message' => 'Invalid webhook signature verification failed.',
            ], 401);
        }

        // 3. Timestamp Validation (Replay Attack Prevention)
        $timestamp = $request->header('X-Bakong-Timestamp') ?? $request->input('timestamp');
        if ($timestamp) {
            $skew = abs(time() - (int) $timestamp);
            if ($skew > 300) { // 5 minutes maximum skew allowed
                Log::warning('Bakong webhook blocked: timestamp skew exceeded: ' . $skew . ' seconds.');
                return response()->json([
                    'success' => false,
                    'message' => 'Request timestamp expired.',
                ], 401);
            }
        }

        $md5           = $request->input('khqr_md5') ?? $request->input('khqrMd5') ?? $request->input('md5');
        $transactionId = $request->input('transaction_id') ?? $request->input('hash');
        $paidAt        = $request->input('paid_at') ?? $request->input('createdDate') ?? now()->toDateTimeString();

        if (empty($md5)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing payment MD5 hash identifier.',
            ], 400);
        }

        $payment = $this->paymentRepo->findByMd5($md5);
        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Associated payment not found.',
            ], 404);
        }

        if ($payment->payment_status === 'paid') {
            return response()->json([
                'success' => true,
                'message' => 'Payment already processed.',
            ]);
        }

        try {
            $txnId = $transactionId ?? 'WEBHOOK_' . uniqid();
            $fromAccount = $request->input('from_account_id') ?? $request->input('fromAccountId') ?? $request->input('sender_account') ?? $request->input('from') ?? $request->input('sender_account_id');
            $senderBank  = $request->input('sender_bank') ?? $request->input('bank_name') ?? $request->input('bank') ?? $request->input('sender_bank_name');
            $senderName  = $request->input('sender_name') ?? $request->input('from_name') ?? $request->input('sender') ?? $request->input('name') ?? $request->input('account_name') ?? $request->input('sender_account_name');
            $this->paymentService->confirmPayment($payment->id, $txnId, $paidAt, $fromAccount, $senderBank, $senderName);

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed.',
            ]);
        } catch (Exception $e) {
            Log::error('Webhook payment confirmation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error processing webhook.',
            ], 500);
        }
    }

    /**
     * Verify payment status directly with Bakong API (Admin/Manager manually triggered status verify).
     * POST /api/khqr/manual-confirm
     */
    public function manualConfirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'md5' => 'required|string|size:32',
            'supervisor_email' => 'nullable|email',
            'supervisor_password' => 'nullable|string',
        ]);

        $user = $request->user();

        // If supervisor credentials are provided, validate them and override auth check
        if ($request->filled('supervisor_email') && $request->filled('supervisor_password')) {
            $supervisor = \App\Models\User::where('email', $request->supervisor_email)->first();
            if ($supervisor && \Illuminate\Support\Facades\Hash::check($request->supervisor_password, $supervisor->password)) {
                if ($supervisor->hasAnyRole(['Admin', 'Manager']) && $supervisor->status !== 'Inactive') {
                    $user = $supervisor;
                }
            }
        }

        if (!$user || !$user->hasAnyRole(['Admin', 'Manager'])) {
            return response()->json([
                'success' => false,
                'requires_auth' => true,
                'message' => 'Unauthorized: Supervisor authorization required (Admin or Manager).'
            ], 403);
        }

        Log::info("Supervisor manual payment verification approved for User ID: {$user->id} for MD5: {$validated['md5']}");

        // Perform active verification check against Bakong OpenAPI
        $isPaid = $this->paymentService->verifyPayment($validated['md5']);

        if ($isPaid) {
            return response()->json([
                'success' => true,
                'message' => 'Payment successfully verified with Bakong API and marked paid.'
            ]);
        }

        // Fallback: If Bakong API verification did not succeed (offline, test, or local environment),
        // allow the authorized supervisor to force the payment status to 'paid' as a manual override.
        $payment = $this->paymentRepo->findByMd5($validated['md5']);
        if ($payment) {
            Log::info("Supervisor manual payment override force-confirming MD5: {$validated['md5']} by User ID: {$user->id}");
            $txnId = 'FORCE_CONFIRMED_' . strtoupper(uniqid());
            $this->paymentService->confirmPayment($payment->id, $txnId, now()->toDateTimeString(), null, 'Manual Override', $user->name);

            return response()->json([
                'success' => true,
                'message' => 'Payment force-confirmed manually by supervisor override.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'The transaction is still pending or not found on the Bakong system.'
        ], 400);
    }

    /**
     * Compute and verify HMAC-SHA256 signature for the webhook request payload.
     */
    private function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Bakong-Signature');
        if (empty($signature)) {
            return false;
        }

        $secret = config('bakong.webhook_secret');
        $payload = $request->getContent(); // Raw request body payload string

        $computed = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computed, $signature);
    }
}
