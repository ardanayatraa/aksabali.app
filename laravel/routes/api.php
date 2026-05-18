<?php

// Mobile API surface — /api/mobile/v1/* untuk Android client.
// Treat as versioned public contract: breaking changes butuh v2.
// Auth pakai bearer token via Sanctum Personal Access Token.

use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('health', HealthController::class)->name('api.health');

// Endpoint mobile v1.
require __DIR__ . '/api-mobile-v1.php';
