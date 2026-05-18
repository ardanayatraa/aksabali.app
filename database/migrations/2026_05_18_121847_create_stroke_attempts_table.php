<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hasil latihan stroke recognition — raw stroke + score + metrics.
 * Mode: practice (latihan biasa), test (kuis nyurat), nyurat (mode latihan).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('stroke_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('aksara_id', 64);
            $table->enum('mode', ['practice', 'test', 'nyurat'])->default('practice');
            $table->integer('score');
            $table->boolean('passed')->default(false);
            $table->integer('mistakes')->default(0);
            $table->integer('duration_seconds')->default(0);
            $table->json('metrics')->nullable();          // [{shapeScore, directionScore, ...}, ...]
            $table->json('raw_strokes')->nullable();      // raw input points
            $table->json('normalized_strokes')->nullable(); // post-processed
            $table->timestamps();

            $table->foreign('aksara_id')->references('id')->on('aksara')->cascadeOnDelete();
            $table->index('user_id');
            $table->index('aksara_id');
            $table->index('passed');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stroke_attempts');
    }
};
