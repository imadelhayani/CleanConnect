<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable,SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'phone',
        'role',
        'status',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    protected $appends = ['avatar_url', 'points_balance'];

    public function getAvatarUrlAttribute()
{
    if ($this->avatar) {
        return asset('storage/' . $this->avatar);
    }

    // Return a professional placeholder based on their name (UI Avatars service)
    return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
}
    public function sweepstarProfile()
    {
        return $this->hasOne(SweepstarProfile::class);
    }
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
    // Bookings made by this user (as client)
public function clientBookings()
{
    return $this->hasMany(Booking::class, 'user_id');
}

// Jobs accepted by this user (as Sweepstar)
public function sweepstarBookings()
{
    return $this->hasMany(Booking::class, 'sweepstar_id');
}
// Reviews written by this user
public function reviewsWritten()
{
    return $this->hasMany(Review::class, 'reviewer_id');
}

// Reviews about this user
public function reviewsReceived()
{
    return $this->hasMany(Review::class, 'target_id');
}
    // Check if user is sweepstar
    public function isSweepstar()
    {
        return $this->role === 'sweepstar';
    }

    // Check if user is admin
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function getPointsBalanceAttribute()
    {
        return $this->sweepstarProfile ? $this->sweepstarProfile->points_balance : 0;
    }

}
