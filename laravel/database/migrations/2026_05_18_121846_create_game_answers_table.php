<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Jawaban per pemain per soal — untuk leaderboard & verifikasi.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_answers', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64);
            $table->foreignId('question_id')->constrained('game_questions')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('player_id')->constrained('game_players')->cascadeOnDelete();
            $table->string('answer');
            $table->boolean('is_correct')->default(false);
            $table->timestamp('answered_at')->useCurrent();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->index('session_id');
            $table->unique(['question_id', 'player_id'], 'game_answers_question_player_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_answers');
    }
};
