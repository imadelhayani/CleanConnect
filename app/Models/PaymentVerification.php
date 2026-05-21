<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentVerification extends Model
{
    protected $fillable = [
        'sweepstar_id',
        'code',
        'amount',
        'sender_account_number',
        'sender_account_name',
        'screenshot_path',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function sweepstar()
    {
        return $this->belongsTo(User::class, 'sweepstar_id');
    }
}
