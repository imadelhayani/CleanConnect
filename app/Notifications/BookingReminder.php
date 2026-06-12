<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingReminder extends Notification
{
    use Queueable;

    public $booking;
    public $message;

    public function __construct($booking)
    {
        $this->booking = $booking;
        $this->message = "Reminder: Your cleaning is scheduled for " . $booking->scheduled_at->format('M d, Y H:i');
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'booking_id' => $this->booking->id,
            'type' => 'booking_reminder',
            'created_at' => now(),
        ];
    }
}
