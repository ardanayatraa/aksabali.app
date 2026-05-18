<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $table = 'app_settings';
    protected $primaryKey = 'setting_key';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'setting_key',
        'setting_value',
        'updated_by',
    ];

    /**
     * Cache key untuk fetch cepat di middleware.
     */
    protected const CACHE_KEY = 'app_settings';
    protected const CACHE_TTL = 5; // detik — match Next.js version supaya toggle admin cepat propagated

    /**
     * Get all settings as key-value map with cache.
     *
     * @return array<string, string>
     */
    public static function all_cached(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return static::query()
                ->pluck('setting_value', 'setting_key')
                ->toArray();
        });
    }

    /**
     * Get one setting by key, with fallback default.
     */
    public static function value(string $key, ?string $default = null): ?string
    {
        return static::all_cached()[$key] ?? $default;
    }

    /**
     * Set a single setting + invalidate cache.
     */
    public static function set(string $key, string $value, ?int $userId = null): void
    {
        static::updateOrCreate(
            ['setting_key' => $key],
            ['setting_value' => $value, 'updated_by' => $userId]
        );
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Daftar site mode yang valid.
     */
    public const SITE_MODES = ['live', 'coming_soon', 'maintenance', 'development'];

    public static function siteMode(): string
    {
        $mode = static::value('site_mode', 'live');
        return in_array($mode, self::SITE_MODES, true) ? $mode : 'live';
    }

    public static function launchAt(): string
    {
        return static::value('launch_at', '2026-06-30T00:00:00Z');
    }
}
