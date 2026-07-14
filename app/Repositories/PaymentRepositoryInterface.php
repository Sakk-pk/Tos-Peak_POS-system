<?php

namespace App\Repositories;

use App\Models\Payment;

interface PaymentRepositoryInterface
{
    public function create(array $data): Payment;
    public function find(int $id): ?Payment;
    public function findByMd5(string $md5): ?Payment;
    public function updateStatus(int $id, string $status, ?string $transactionId = null, ?string $paidAt = null, ?string $senderAccount = null, ?string $senderBank = null, ?string $senderName = null): bool;
}
