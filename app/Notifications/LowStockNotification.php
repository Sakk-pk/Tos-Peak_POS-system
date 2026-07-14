<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $product;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isOutOfStock = $this->product->stock === 0;
        return [
            'title' => $isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert',
            'message' => $isOutOfStock 
                ? "{$this->product->name} is completely out of stock." 
                : "{$this->product->name} is low on stock ({$this->product->stock} left).",
            'product_id' => $this->product->id,
            'type' => $isOutOfStock ? 'danger' : 'warning'
        ];
    }
}
