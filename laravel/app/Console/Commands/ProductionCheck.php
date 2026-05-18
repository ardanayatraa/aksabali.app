<?php

namespace App\Console\Commands;

use App\Models\AppSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Production readiness check — jalanin sebelum claim "siap deploy".
 *
 * Usage: php artisan app:check
 */
class ProductionCheck extends Command
{
    protected $signature = 'app:check';
    protected $description = 'Verify production config + DB + critical env vars';

    public function handle(): int
    {
        $this->info('🧪 Aksa Bali — Production Check');
        $this->line('');

        $errors = 0;

        // 1. APP_KEY.
        if (empty(config('app.key'))) {
            $this->error('  ❌ APP_KEY tidak diset. Jalankan: php artisan key:generate');
            $errors++;
        } else {
            $this->info('  ✓ APP_KEY ada');
        }

        // 2. APP_ENV.
        $env = config('app.env');
        if ($env === 'local') {
            $this->warn('  ⚠ APP_ENV=local — set ke "production" sebelum deploy');
        } else {
            $this->info("  ✓ APP_ENV={$env}");
        }

        // 3. APP_DEBUG.
        if (config('app.debug') === true && $env === 'production') {
            $this->error('  ❌ APP_DEBUG=true di production — set false');
            $errors++;
        } else {
            $this->info('  ✓ APP_DEBUG ' . (config('app.debug') ? 'on (non-prod)' : 'off'));
        }

        // 4. Database.
        try {
            DB::connection()->getPdo();
            $name = DB::connection()->getDatabaseName();
            $this->info("  ✓ Database connected ({$name})");
        } catch (Throwable $e) {
            $this->error('  ❌ Database tidak bisa connect: ' . $e->getMessage());
            $errors++;
        }

        // 5. Migration status — ada migration belum jalan?
        try {
            $pending = collect(\Illuminate\Support\Facades\Artisan::call('migrate:status'))->count();
            $output = trim(\Illuminate\Support\Facades\Artisan::output());
            if (str_contains($output, 'No migrations found') || str_contains($output, 'Pending')) {
                $this->warn('  ⚠ Ada migration pending — jalankan: php artisan migrate --force');
            } else {
                $this->info('  ✓ Migrations up-to-date');
            }
        } catch (Throwable) {
            $this->warn('  ⚠ Tidak bisa cek migration status');
        }

        // 6. Google OAuth.
        if (empty(config('services.google.client_id'))) {
            $this->warn('  ⚠ GOOGLE_CLIENT_ID kosong — login Google ga jalan');
        } else {
            $this->info('  ✓ Google OAuth keys terisi');
        }

        // 7. Midtrans.
        if (empty(config('services.midtrans.server_key'))) {
            $this->warn('  ⚠ MIDTRANS_SERVER_KEY kosong — pembayaran offline');
        } else {
            $isProd = config('services.midtrans.is_production', false) ? 'production' : 'sandbox';
            $this->info("  ✓ Midtrans keys terisi ({$isProd})");
        }

        // 8. Site mode.
        $mode = AppSetting::siteMode();
        if ($mode === 'maintenance') {
            $this->warn("  ⚠ Site mode = maintenance — publik diblok. Aktifkan di /admin/settings");
        } else {
            $this->info("  ✓ Site mode = {$mode}");
        }

        // 9. Catalog aksara — minimal 4 aksara non-premium buat game generation.
        $publicAksara = \App\Models\Aksara::where('is_premium', false)->whereNotNull('char')->count();
        if ($publicAksara < 4) {
            $this->error("  ❌ Catalog cuma {$publicAksara} aksara non-premium. Min 4 buat game. Jalankan: php artisan db:seed");
            $errors++;
        } else {
            $this->info("  ✓ Catalog: {$publicAksara} aksara non-premium siap");
        }

        // 10. Frontend build artifacts.
        $manifest = base_path('public/build/manifest.json');
        if (! file_exists($manifest)) {
            $this->error('  ❌ Vite manifest belum ada di public/build/. Jalankan: npm run build');
            $errors++;
        } else {
            $this->info('  ✓ Vite manifest ada');
        }

        $this->line('');
        if ($errors === 0) {
            $this->info("✅ All checks passed. Siap deploy.");
            return self::SUCCESS;
        }

        $this->error("❌ {$errors} check gagal. Fix dulu sebelum deploy.");
        return self::FAILURE;
    }
}
