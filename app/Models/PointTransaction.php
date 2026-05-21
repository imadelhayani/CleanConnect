<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = [
        'sweepstar_id',
        'type',
        'amount',
        'description',
        'reference_type',
        'reference_id',
    ];

    public function sweepstar()
    {
        return $this->belongsTo(User::class, 'sweepstar_id');
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
