<?php

namespace App\Repositories;

use App\Models\Order;

interface OrderRepositoryInterface
{
    public function find(int $id): ?Order;
    public function updateStatus(int $id, string $status): bool;
}
