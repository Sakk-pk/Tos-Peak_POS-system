<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

use Illuminate\Support\Facades\Schedule;
Schedule::command('telegram:low-stock-summary')->dailyAt('16:16')->timezone('Asia/Phnom_Penh');
Schedule::command('app:daily-stock-report')->dailyAt('08:00');
