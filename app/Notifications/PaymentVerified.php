<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentVerified extends Notification
{
    use Queueable;

    public $payment;
    public $status; // 'approved' or 'rejected'
    public $message;

    public function __construct($payment, $status)
    {
        $this->payment = $payment;
        $this->status = $status;
        $this->message = $status === 'approved'
            ? "Your payment of {$payment->amount} points has been approved. Your balance has been updated."
            : "Your payment of {$payment->amount} points was rejected. Reason: {$payment->admin_notes}";
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'payment_id' => $this->payment->id,
            'status' => $this->status,
            'type' => 'payment_verification',
            'created_at' => now(),
        ];
    }
}
