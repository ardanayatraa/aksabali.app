<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    protected $table = 'game_sessions';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'pin',
        'host_id',
        'title',
        'status',
        'question_count',
        'seconds_per_question',
        'current_question_index',
        'mode',
        'categories',
    ];

    protected $casts = [
        'question_count' => 'integer',
        'seconds_per_question' => 'integer',
        'current_question_index' => 'integer',
        'categories' => 'array',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(GamePlayer::class, 'session_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(GameQuestion::class, 'session_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(GameAnswer::class, 'session_id');
    }

    /**
     * Tandai sesi lobby > 24 jam sebagai expired (lazy cleanup).
     */
    public static function expireStaleLobby(int $hours = 24): int
    {
        return static::query()
            ->where('status', 'lobby')
            ->where('created_at', '<', now()->subHours($hours))
            ->update(['status' => 'expired', 'updated_at' => now()]);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['lobby', 'live']);
    }
}
