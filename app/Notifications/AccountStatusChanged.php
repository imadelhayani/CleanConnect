<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AccountStatusChanged extends Notification
{
    use Queueable;

    public $status;
    public $message;

    public function __construct($status, $reason = null)
    {
        $this->status = $status;
        $this->message = $status === 'suspended'
            ? "Your account has been suspended. Reason: " . ($reason ?? 'Policy violation.')
            : "Your account has been activated again. You can now log in and use the platform.";
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'status' => $this->status,
            'type' => 'account_status',
            'created_at' => now(),
        ];
    }
}
