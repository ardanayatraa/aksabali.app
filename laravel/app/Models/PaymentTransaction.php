<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $table = 'payment_transactions';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'plan',
        'amount',
        'currency',
        'status',
        'promo_code',
        'payment_type',
        'midtrans_transaction_id',
        'midtrans_response',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'midtrans_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
