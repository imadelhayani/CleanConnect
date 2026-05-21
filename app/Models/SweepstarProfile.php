<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class SweepstarProfile extends Model
{
    use HasFactory, SoftDeletes,Notifiable;

    protected $table = 'sweepstar_profiles';


protected $fillable = [
    'user_id',
    'bio',
    'id_number',
    'hourly_rate',
    'is_verified',
    'total_jobs_completed',
    'is_available',
    'points_balance',
];

protected $casts = [
    'is_verified' => 'boolean',
    'is_available' => 'boolean',
    'hourly_rate' => 'decimal:2',
    'total_jobs_completed' => 'integer',
    'points_balance' => 'decimal:2',
];

    // Link back to the User (Login account)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
