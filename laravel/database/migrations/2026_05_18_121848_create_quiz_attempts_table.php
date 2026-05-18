<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hasil sesi kuis — mode (nyurat/kata/huruf/match/maca/acak), skor, durasi.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('mode', ['nyurat', 'kata', 'huruf', 'match', 'maca', 'acak']);
            $table->string('category', 100)->default('semua');
            $table->integer('correct_count');
            $table->integer('total_count');
            $table->integer('score');
            $table->boolean('passed')->default(false);
            $table->integer('duration_seconds')->default(0);
            $table->json('answers')->nullable();      // detailed per-question answers
            $table->string('seed')->nullable();       // untuk replicable question order
            $table->timestamps();

            $table->index('user_id');
            $table->index('mode');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
