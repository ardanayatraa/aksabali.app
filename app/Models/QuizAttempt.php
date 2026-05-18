<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    protected $table = 'quiz_attempts';

    protected $fillable = [
        'user_id',
        'mode',
        'category',
        'correct_count',
        'total_count',
        'score',
        'passed',
        'duration_seconds',
        'answers',
        'seed',
    ];

    protected $casts = [
        'correct_count' => 'integer',
        'total_count' => 'integer',
        'score' => 'integer',
        'passed' => 'boolean',
        'duration_seconds' => 'integer',
        'answers' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
