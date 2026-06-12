<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PointsLowWarning extends Notification
{
    use Queueable;

    public $balance;
    public $message;

    public function __construct($balance)
    {
        $this->balance = $balance;
        $this->message = "Your points balance is low ({$balance} points). Top up to continue accepting missions.";
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'balance' => $this->balance,
            'type' => 'points_low',
            'created_at' => now(),
        ];
    }
}
