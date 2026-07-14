<?php

namespace App\Repositories;

use App\Models\Payment;
use Carbon\Carbon;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function find(int $id): ?Payment
    {
        return Payment::find($id);
    }

    public function findByMd5(string $md5): ?Payment
    {
        return Payment::where('khqr_md5', $md5)->first();
    }

    public function updateStatus(int $id, string $status, ?string $transactionId = null, ?string $paidAt = null, ?string $senderAccount = null, ?string $senderBank = null, ?string $senderName = null): bool
    {
        $payment = Payment::find($id);
        if ($payment) {
            $payment->payment_status = $status;
            if ($transactionId !== null) {
                $payment->transaction_id = $transactionId;
            }
            if ($paidAt !== null) {
                $payment->paid_at = Carbon::parse($paidAt);
            }
            if ($senderAccount !== null) {
                $payment->sender_account = $senderAccount;
            }
            if ($senderBank !== null) {
                $payment->sender_bank = $senderBank;
            }
            if ($senderName !== null) {
                $payment->sender_name = $senderName;
            }
            return $payment->save();
        }
        return false;
    }
}
