<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'display_name',
        'email',
        'password',
        'role',
        'tier',
        'status',
        'google_id',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // === Helpers ===

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'pengajar';
    }

    public function isStudent(): bool
    {
        return $this->role === 'siswa';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isPremium(): bool
    {
        return in_array($this->tier, ['lite', 'premium'], true);
    }

    public function getDisplayNameAttribute($value): ?string
    {
        return $value ?: ($this->name ?? null);
    }

    // === Relationships ===

    public function strokeAttempts(): HasMany
    {
        return $this->hasMany(StrokeAttempt::class);
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function hostedGameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class, 'host_id');
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
