<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Katalog konten aksara — entitas utama yang dipakai latihan stroke + kuis + game.
 * Table name: aksara (override default plural 'aksaras' yang Laravel generate).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('aksara', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name');
            $table->string('char', 20);  // glyph aksara (string, bisa multi-codepoint)
            $table->string('latin')->nullable();
            $table->string('category', 100);
            $table->integer('order')->default(0);
            $table->boolean('is_premium')->default(false);
            $table->text('svg_url')->nullable();
            $table->text('image_url')->nullable();
            $table->integer('target_stroke_count')->default(0);
            $table->text('audio_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('category')->references('id')->on('categories')->onDelete('cascade');
            $table->index('category');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aksara');
    }
};
