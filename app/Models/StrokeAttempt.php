<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StrokeAttempt extends Model
{
    protected $table = 'stroke_attempts';

    protected $fillable = [
        'user_id',
        'aksara_id',
        'mode',
        'score',
        'passed',
        'mistakes',
        'duration_seconds',
        'metrics',
        'raw_strokes',
        'normalized_strokes',
    ];

    protected $casts = [
        'score' => 'integer',
        'passed' => 'boolean',
        'mistakes' => 'integer',
        'duration_seconds' => 'integer',
        'metrics' => 'array',
        'raw_strokes' => 'array',
        'normalized_strokes' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function aksara(): BelongsTo
    {
        return $this->belongsTo(Aksara::class, 'aksara_id', 'id');
    }
}
