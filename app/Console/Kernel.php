<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
   protected $commands = [
    \App\Console\Commands\SendBookingReminders::class,
];
    protected function schedule(Schedule $schedule)
{
    $schedule->command('bookings:send-reminders')->dailyAt('09:00');
}

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
