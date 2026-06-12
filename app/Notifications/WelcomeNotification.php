<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public $message;

    public function __construct($user)
    {
        $this->message = "Welcome to CleanConnect, {$user->name}! Start booking services today.";
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'type' => 'welcome',
            'created_at' => now(),
        ];
    }
}
