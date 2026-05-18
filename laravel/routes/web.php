<?php

use App\Http\Controllers\PracticeController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Latihan — mode tetap + single character drill.
    // {mode} dibatasi pakai whereIn supaya `/latihan/{aksaraId}` ga ke-overlap.
    Route::get('latihan', [PracticeController::class, 'index'])->name('latihan.index');
    Route::get('latihan/{mode}', [PracticeController::class, 'mode'])
        ->whereIn('mode', ['nyurat', 'huruf', 'swara', 'angka', 'kata', 'membaca'])
        ->name('latihan.mode');
    Route::get('latihan/{aksaraId}', [PracticeController::class, 'drill'])
        ->where('aksaraId', '[A-Za-z0-9-]+')
        ->name('latihan.drill');

    // Kuis — hub + per mode.
    Route::get('quiz', [QuizController::class, 'index'])->name('quiz.index');
    Route::get('quiz/{mode}', [QuizController::class, 'mode'])
        ->whereIn('mode', ['acak', 'nyurat', 'kata', 'huruf', 'match', 'maca'])
        ->name('quiz.mode');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
