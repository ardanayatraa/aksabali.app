<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Konfigurasi global aplikasi — site_mode, launch_at, dll.
 * Key-value store sederhana. Updated_by referensi user (nullable).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->string('setting_key', 64)->primary();
            $table->text('setting_value');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Seed default site_mode + launch_at
        DB::table('app_settings')->insert([
            ['setting_key' => 'site_mode',  'setting_value' => 'live'],
            ['setting_key' => 'launch_at',  'setting_value' => '2026-06-30T00:00:00Z'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
