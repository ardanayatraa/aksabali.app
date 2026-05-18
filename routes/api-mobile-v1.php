<?php

// Mobile API v1 — versioned public contract untuk Android client.
// Auth: bearer token via Sanctum (`auth:sanctum`).
// Response envelope: { success, data | error } — match Next.js docs/android-api.md.

use App\Http\Controllers\Mobile\AuthController;
use App\Http\Controllers\Mobile\CatalogController;
use App\Http\Controllers\Mobile\DashboardController;
use App\Http\Controllers\Mobile\GameController;
use App\Http\Controllers\Mobile\PaymentController;
use App\Http\Controllers\Mobile\StrokeController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile/v1')->name('mobile.v1.')->group(function () {
    // Public — Google sign-in.
    Route::post('auth/google', [AuthController::class, 'googleExchange'])->name('auth.google');

    // Catalog publik (premium content tetap masuk, mobile client yang lock UI).
    Route::get('catalog', [CatalogController::class, 'index'])->name('catalog');
    Route::get('catalog/{aksaraId}', [CatalogController::class, 'show'])->name('catalog.show');

    // Authenticated (Sanctum bearer).
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Stroke attempts.
        Route::get('strokes', [StrokeController::class, 'index'])->name('strokes.index');
        Route::post('strokes', [StrokeController::class, 'store'])->name('strokes.store');

        // Game multiplayer.
        Route::post('game/sessions', [GameController::class, 'createSession'])->name('game.sessions.store');
        Route::post('game/join', [GameController::class, 'join'])->name('game.join');
        Route::get('game/{session}', [GameController::class, 'poll'])->name('game.poll');
        Route::get('game/{session}/host', [GameController::class, 'hostPoll'])->name('game.host.poll');
        Route::post('game/{session}/start', [GameController::class, 'start'])->name('game.start');
        Route::post('game/{session}/advance', [GameController::class, 'advance'])->name('game.advance');
        Route::post('game/{session}/answer', [GameController::class, 'answer'])->name('game.answer');
        Route::get('game/{session}/podium', [GameController::class, 'podium'])->name('game.podium');

        // Pembayaran.
        Route::get('payments/plans', [PaymentController::class, 'plans'])->name('payments.plans');
        Route::post('payments/checkout', [PaymentController::class, 'checkout'])->name('payments.checkout');
        Route::get('payments/{transaction}/status', [PaymentController::class, 'status'])->name('payments.status');
    });
});
