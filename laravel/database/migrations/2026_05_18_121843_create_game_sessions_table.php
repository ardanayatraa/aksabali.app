<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sesi game kelas (multiplayer) — host bikin room, siswa join via PIN.
 * Status flow: lobby → live → finished | expired (auto setelah 24 jam idle).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('pin', 12)->unique();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->enum('status', ['lobby', 'live', 'finished', 'expired'])->default('lobby');
            $table->integer('question_count')->default(0);
            $table->integer('seconds_per_question')->default(20);
            $table->integer('current_question_index')->default(0);
            $table->string('mode', 32)->default('acak'); // acak | huruf | kata
            $table->json('categories')->nullable(); // ['anacaraka', 'swara', dll]
            $table->timestamps();

            $table->index('pin');
            $table->index('host_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
