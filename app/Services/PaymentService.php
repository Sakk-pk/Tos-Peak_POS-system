<?php

namespace App\Services;

use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\OrderRepositoryInterface;
use KHQR\BakongKHQR;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class PaymentService
{
    protected PaymentRepositoryInterface $paymentRepo;
    protected OrderRepositoryInterface $orderRepo;
    protected string $apiToken;
    protected bool $isTest;

    public function __construct(
        PaymentRepositoryInterface $paymentRepo,
        OrderRepositoryInterface $orderRepo,
    ) {
        $this->paymentRepo = $paymentRepo;
        $this->orderRepo   = $orderRepo;
        $this->apiToken    = config('bakong.api_token', '');
        $this->isTest      = config('bakong.is_test', true);
    }

    /**
     * Verify payment status using Bakong OpenAPI.
     *
     * @param string $md5 The MD5 hash of the generated KHQR
     * @return bool True if paid, false otherwise
     */
    public function verifyPayment(string $md5): bool
    {
        $payment = $this->paymentRepo->findByMd5($md5);
        if (!$payment) {
            Log::warning("Payment not found for MD5: {$md5}");
            return false;
        }

        if ($payment->payment_status === 'paid') {
            return true;
        }

        try {
            if (empty($this->apiToken)) {
                Log::warning('Bakong API Token is empty. Skipping real API payment status check.');
                return false;
            }

            $bakong   = new BakongKHQR($this->apiToken);
            $response = $bakong->checkTransactionByMD5($md5, $this->isTest);

            Log::info("Bakong API check response for MD5 {$md5}:", (array) $response);

            // NBC OpenAPI responseCode = 0 indicates a successfully completed transaction
            if (isset($response['responseCode']) && (int) $response['responseCode'] === 0) {
                $transactionId = $response['data']['hash'] ?? $response['data']['transactionId'] ?? 'TXN_' . uniqid();
                $paidAt        = $response['data']['createdDate'] ?? Carbon::now()->toDateTimeString();
                $fromAccount   = $response['data']['fromAccountId'] ?? null;

                // Try to look up the sender's real name dynamically from their account ID
                $senderName = null;
                if ($fromAccount) {
                    $senderName = $this->lookupAccountName($fromAccount);
                }

                $this->confirmPayment($payment->id, $transactionId, $paidAt, $fromAccount, null, $senderName);
                return true;
            }
        } catch (Exception $e) {
            Log::error("Error verifying payment for MD5 {$md5}: " . $e->getMessage());
        }

        return false;
    }

    public function confirmPayment(int $paymentId, string $transactionId, string $paidAt, ?string $senderAccount = null, ?string $senderBank = null, ?string $senderName = null): void
    {
        DB::transaction(function () use ($paymentId, $transactionId, $paidAt, $senderAccount, $senderBank, $senderName) {
            $payment = $this->paymentRepo->find($paymentId);
            if (!$payment || $payment->payment_status === 'paid') {
                return;
            }

            // Extract bank name from account ID if bank name is not provided
            if (empty($senderBank)) {
                $senderBank = $this->getBankNameFromAccountId($senderAccount);
            }

            // Mark payment as paid
            $this->paymentRepo->updateStatus($paymentId, 'paid', $transactionId, $paidAt, $senderAccount, $senderBank, $senderName);

            // Update order payment_status to Paid if the order is already linked
            if ($payment->order_id) {
                $order = $this->orderRepo->find($payment->order_id);
                if ($order && $order->payment_status !== 'Paid') {
                    $this->orderRepo->updateStatus($order->id, 'Paid');
                    // Note: Stock was already reserved (decremented) at order creation time
                    // for all payment methods (cash, card, qr). No need to decrement again here.
                }
            }
        });
    }

    /**
     * Helper to map Bakong's sender account suffix to human-readable bank name.
     */
    private function getBankNameFromAccountId(?string $accountId): ?string
    {
        if (empty($accountId)) {
            return null;
        }

        $parts = explode('@', $accountId);
        if (count($parts) < 2) {
            return 'Bakong / Partner Bank';
        }

        $suffix = strtolower($parts[1]);
        $map = [
            'abaa' => 'ABA Bank',
            'acld' => 'ACLEDA Bank',
            'bkrt' => 'Bakong',
            'canc' => 'Canadia Bank',
            'sbcb' => 'SBC Bank',
            'tbbb' => 'TrueMoney',
            'cpbb' => 'CPBank',
            'ppcb' => 'PPCB Bank',
            'ftbb' => 'FTB Bank',
            'jtrb' => 'J Trust Royal Bank',
            'wbbb' => 'Wing Bank',
            'wood' => 'Woori Bank',
            'clip' => 'Clik',
            'amrb' => 'Amret',
            'sath' => 'Sathapana Bank',
            'bkid' => 'BIDC Bank',
        ];

        return $map[$suffix] ?? strtoupper($suffix) . ' Bank';
    }

    /**
     * Look up the real account name / holder name of a Bakong account ID dynamically.
     */
    public function lookupAccountName(string $accountId): ?string
    {
        if (empty($this->apiToken) || empty($accountId)) {
            return null;
        }

        try {
            $baseUrl = $this->isTest
                ? 'https://sit-api-bakong.nbc.gov.kh'
                : 'https://api-bakong.nbc.gov.kh';

            $response = \Illuminate\Support\Facades\Http::withToken($this->apiToken)
                ->post("{$baseUrl}/v1/check_bakong_account", [
                    'accountId' => $accountId,
                ]);

            if ($response->successful()) {
                $body = $response->json();
                Log::info("Bakong account lookup response for {$accountId}:", (array) $body);
                if (isset($body['responseCode']) && (int) $body['responseCode'] === 0) {
                    return $body['data']['name'] ?? $body['data']['accountName'] ?? null;
                }
            } else {
                Log::warning("Bakong account lookup failed for {$accountId} with status: " . $response->status() . " - Body: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error looking up Bakong account name for {$accountId}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Check payment status by MD5 hash (used for frontend polling).
     *
     * @param string $md5
     * @return string  'pending' | 'paid' | 'failed'
     */
    public function checkPaymentStatus(string $md5): string
    {
        $payment = $this->paymentRepo->findByMd5($md5);

        if (!$payment) {
            return 'failed';
        }

        if ($payment->payment_status === 'paid') {
            return 'paid';
        }

        // Poll / verify via Bakong OpenAPI
        $this->verifyPayment($md5);

        // Re-read the fresh status
        $refreshed = $this->paymentRepo->findByMd5($md5);
        return $refreshed ? $refreshed->payment_status : 'pending';
    }
}
