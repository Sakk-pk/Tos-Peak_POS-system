<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\TelegramNotificationLog;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];

    protected $logId;
    protected $type;
    protected $product;

    /**
     * Create a new job instance.
     */
    public function __construct(TelegramNotificationLog $log, string $type, ?Product $product = null)
    {
        $this->logId = $log->id;
        $this->type = $type;
        $this->product = $product;
    }

    /**
     * Execute the job.
     */
    public function handle(TelegramService $telegramService): void
    {
        $log = TelegramNotificationLog::find($this->logId);
        
        if (!$log || $log->status === 'sent') {
            return;
        }

        try {
            if ($this->type === 'low_stock' && $this->product) {
                $telegramService->sendLowStockAlert($this->product);
            } else if ($this->type === 'out_of_stock' && $this->product) {
                $telegramService->sendOutOfStockAlert($this->product);
            } else if ($this->type === 'test') {
                $telegramService->sendMessage($log->message);
            } else if ($this->type === 'daily_summary' && $this->product === null) {
                 // Assuming message holds the entire pre-compiled HTML summary for the daily run
                 $telegramService->sendMessage($log->message, 'Daily summary sent', $telegramService->getLowStockBotToken());
            }

            $log->update([
                'status' => 'sent',
                'retries' => $this->attempts(),
                'error_message' => null
            ]);
        } catch (\Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'retries' => $this->attempts()
            ]);
            throw $e; // Re-throw for queue retry
        }
    }
}
