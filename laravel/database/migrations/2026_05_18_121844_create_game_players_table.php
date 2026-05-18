<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pemain di sesi game — siswa yang join via PIN.
 * user_id nullable supaya guest/anonymous bisa main juga (kalau nanti diizinkan).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('display_name');
            $table->integer('score')->default(0);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->index('session_id');
            $table->unique(['session_id', 'user_id'], 'game_players_session_user_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_players');
    }
};
