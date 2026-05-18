<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Health endpoint untuk uptime monitor + smoke test deploy.
 * Endpoint `/up` (Laravel default) sudah ada, ini versi detail-nya di `/api/health`.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'app' => true,
            'db' => $this->checkDatabase(),
            'config' => $this->checkConfig(),
        ];

        $allOk = ! in_array(false, $checks, true);

        return response()->json([
            'ok' => $allOk,
            'service' => 'aksa-bali',
            'version' => '1.0.0',
            'timestamp' => now()->toIso8601String(),
            'mode' => AppSetting::siteMode(),
            'checks' => $checks,
            'php' => PHP_VERSION,
            'laravel' => app()->version(),
        ], $allOk ? 200 : 503);
    }

    private function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function checkConfig(): bool
    {
        // Required env utama.
        return ! empty(config('app.key'))
            && ! empty(config('database.connections.mysql.database'));
    }
}
