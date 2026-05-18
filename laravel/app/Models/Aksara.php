<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aksara extends Model
{
    protected $table = 'aksara';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'char',
        'latin',
        'category',
        'order',
        'is_premium',
        'svg_url',
        'image_url',
        'target_stroke_count',
        'audio_url',
        'notes',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_premium' => 'boolean',
        'target_stroke_count' => 'integer',
    ];

    public function categoryRelation(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category', 'id');
    }

    public function strokeAttempts(): HasMany
    {
        return $this->hasMany(StrokeAttempt::class, 'aksara_id', 'id');
    }
}
