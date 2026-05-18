<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Soal per sesi game — di-generate saat sesi dibuat dari kuis bank.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_questions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64);
            $table->integer('question_index');
            $table->text('prompt');
            $table->string('glyph')->nullable();
            $table->json('options')->nullable();
            $table->string('correct_answer')->nullable();
            $table->integer('time_limit_seconds')->default(20);
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->unique(['session_id', 'question_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_questions');
    }
};
