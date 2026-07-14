<?php

namespace App\Repositories;

use App\Models\Order;

class OrderRepository implements OrderRepositoryInterface
{
    public function find(int $id): ?Order
    {
        return Order::with(['items', 'payments'])->find($id);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $order = Order::find($id);
        if ($order) {
            $order->payment_status = $status;
            return $order->save();
        }
        return false;
    }
}
