<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameQuestion extends Model
{
    protected $table = 'game_questions';

    protected $fillable = [
        'session_id',
        'question_index',
        'prompt',
        'glyph',
        'options',
        'correct_answer',
        'time_limit_seconds',
    ];

    protected $casts = [
        'question_index' => 'integer',
        'options' => 'array',
        'time_limit_seconds' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(GameAnswer::class, 'question_id');
    }
}
