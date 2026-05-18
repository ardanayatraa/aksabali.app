<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom domain-specific Aksa Bali ke users table default Laravel.
 *
 *  - display_name → label yang ditampilkan (mirror `name` tapi diperluas)
 *  - role         → siswa | pengajar | admin
 *  - tier         → free | lite | premium
 *  - status       → active | suspended
 *  - google_id    → ID akun Google untuk Socialite (nullable)
 *  - avatar_url   → URL foto profil dari Google atau upload manual
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->enum('role', ['siswa', 'pengajar', 'admin'])->default('siswa')->after('display_name');
            $table->enum('tier', ['free', 'lite', 'premium'])->default('free')->after('role');
            $table->enum('status', ['active', 'suspended'])->default('active')->after('tier');
            $table->string('google_id')->nullable()->unique()->after('status');
            $table->string('avatar_url')->nullable()->after('google_id');

            $table->index('role');
            $table->index('tier');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['tier']);
            $table->dropIndex(['status']);
            $table->dropColumn(['display_name', 'role', 'tier', 'status', 'google_id', 'avatar_url']);
        });
    }
};
