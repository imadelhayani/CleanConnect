<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\BookingReminder;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';
    protected $description = 'Send reminders for bookings scheduled in the next 24 hours';

    public function handle()
    {
        $start = Carbon::now();
        $end = Carbon::now()->addDay();

        $bookings = Booking::where('status', 'confirmed')
            ->whereBetween('scheduled_at', [$start, $end])
            ->get();

        foreach ($bookings as $booking) {
            $booking->user->notify(new BookingReminder($booking));
            if ($booking->sweepstar) {
                $booking->sweepstar->notify(new BookingReminder($booking));
            }
        }

        $this->info("Sent reminders for {$bookings->count()} bookings.");
    }
}
