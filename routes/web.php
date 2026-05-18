<?php

use App\Http\Controllers\GameHostController;
use App\Http\Controllers\GamePlayController;
use App\Http\Controllers\PracticeController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Game lobby (join via PIN) — boleh diakses tanpa login, supaya tamu bisa main juga.
Route::get('game/lobby', [GamePlayController::class, 'lobby'])->name('game.lobby');
Route::post('game/join', [GamePlayController::class, 'join'])->name('game.join');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Latihan
    Route::get('latihan', [PracticeController::class, 'index'])->name('latihan.index');
    Route::get('latihan/{mode}', [PracticeController::class, 'mode'])
        ->whereIn('mode', ['nyurat', 'huruf', 'swara', 'angka', 'kata', 'membaca'])
        ->name('latihan.mode');
    Route::get('latihan/{aksaraId}', [PracticeController::class, 'drill'])
        ->where('aksaraId', '[A-Za-z0-9-]+')
        ->name('latihan.drill');

    // Kuis
    Route::get('quiz', [QuizController::class, 'index'])->name('quiz.index');
    Route::get('quiz/{mode}', [QuizController::class, 'mode'])
        ->whereIn('mode', ['acak', 'nyurat', 'kata', 'huruf', 'match', 'maca'])
        ->name('quiz.mode');

    // Game — host (guru) bikin sesi, monitor, advance.
    Route::middleware('teacher')->group(function () {
        Route::get('game/host', [GameHostController::class, 'create'])->name('game.host');
        Route::post('game/host', [GameHostController::class, 'store'])->name('game.host.store');
        Route::get('game/host/{session}', [GameHostController::class, 'console'])->name('game.host.console');
        Route::get('game/host/{session}/poll', [GameHostController::class, 'poll'])->name('game.host.poll');
        Route::post('game/host/{session}/start', [GameHostController::class, 'start'])->name('game.host.start');
        Route::post('game/host/{session}/advance', [GameHostController::class, 'advance'])->name('game.host.advance');
    });

    // Game — player (siswa/guru juga boleh).
    Route::get('game/{session}/live', [GamePlayController::class, 'live'])->name('game.live');
    Route::get('game/{session}/poll', [GamePlayController::class, 'poll'])->name('game.poll');
    Route::post('game/{session}/answer', [GamePlayController::class, 'answer'])->name('game.answer');
    Route::get('game/{session}/podium', [GamePlayController::class, 'podium'])->name('game.podium');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
