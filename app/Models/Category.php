<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'name', 'description', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    public function aksara(): HasMany
    {
        return $this->hasMany(Aksara::class, 'category', 'id');
    }
}
