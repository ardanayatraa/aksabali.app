# Aksa Bali — Laravel

Platform belajar nyurat aksara Bali. Stack: **Laravel 12 + Inertia 2 + React 19 + Tailwind 4 + TypeScript 5.7 + MySQL 8 + Sanctum**.

Sister project (Next.js asli) ada di parent directory.

## Quickstart

```bash
# 1. Install deps
composer install
npm install

# 2. Config
cp .env.example .env
php artisan key:generate

# 3. DB
php artisan migrate
php artisan db:seed     # 32 aksara + categories

# 4. Build assets + dev
npm run build           # production assets
npm run dev             # Vite dev server (terminal terpisah)
php artisan serve       # Laravel app

# 5. Smoke test
php artisan app:check   # verify prod-ready
```

## Environment

Wajib:
- `APP_KEY` — `php artisan key:generate`
- `DB_*` — koneksi MySQL

Opsional (fitur akan disable kalau kosong):
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `GOOGLE_REDIRECT_URL` — login Google
- `MIDTRANS_SERVER_KEY` + `MIDTRANS_CLIENT_KEY` + `MIDTRANS_IS_PRODUCTION` — pembayaran online
- `SETUP_KEY` — admin registration setelah first user

## Arsitektur

### Backend (`app/`)
- **Controllers**: web + admin + mobile (`Mobile\*`) — semua return Inertia atau JSON envelope `{success, data|error}`
- **Middleware**:
  - `EnsureActive` — auto-logout user `status=suspended`
  - `EnsureAdmin` / `EnsureTeacher` / `EnsureStudent` — role guard
  - `EnforceSiteMode` — render coming-soon / maintenance page saat `site_mode != live` (admin bypass)
- **Services**:
  - `GameService` — sesi multiplayer (PIN unik, generate soal, scoring, idempotent answer)
  - `PaymentService` — Midtrans Snap (HTTP langsung, no SDK)
- **Models**: User (HasApiTokens Sanctum), Aksara, Category, AppSetting (cache 5s), GameSession + GamePlayer + GameQuestion + GameAnswer, StrokeAttempt, QuizAttempt, PaymentTransaction

### Frontend (`resources/js/`)
- **Lib**: `aksara-codepoints.ts` (Unicode CP registry — no hardcoded glyph), `stroke-recognition.ts` (DTW + Hausdorff + 5-metric scoring), `geometry.ts`, `svg-path-sampler.ts`
- **Layouts**: `student-layout` (top nav + theme toggle + avatar) / `admin-layout` (sidebar) / `auth-layout`
- **Pages**: welcome (landing), dashboard, latihan/*, quiz/*, game/*, admin/*, payment/*, site-mode/* (coming-soon/maintenance), only25k

### API

| Surface | Auth | Path |
|---------|------|------|
| Web (Inertia) | Session cookie + CSRF | `/`, `/dashboard`, `/latihan/*`, `/quiz/*`, `/game/*`, `/admin/*` |
| Mobile v1 | Sanctum bearer | `/api/mobile/v1/*` |
| Health | Public | `/api/health` |
| Webhook | Public (signed payload) | `/payment/midtrans-webhook` |

Mobile API endpoints lengkap: lihat `routes/api-mobile-v1.php`.

## Database

| Tabel | Fungsi |
|-------|--------|
| `users` | + `role` (siswa/pengajar/admin), `tier` (free/lite/premium), `status` (active/suspended), `google_id`, `avatar_url`, `display_name` |
| `categories` | Glyph category — anacaraka, swara, pangangge, angka, kata-aksara, gabungan-vokal |
| `aksara` | Catalog 32+ aksara dgn char/latin/svg_url/audio_url/target_stroke_count/is_premium |
| `app_settings` | Key-value site config (site_mode, launch_at) |
| `game_sessions` | + `game_players`, `game_questions`, `game_answers` — multiplayer |
| `stroke_attempts` | Hasil scoring kanvas user (metric JSON disimpan utuh) |
| `quiz_attempts` | Solo quiz history |
| `payment_transactions` | Midtrans order log |
| `personal_access_tokens` | Sanctum (mobile bearer) |

Edit `database/migrations/*.php` lalu `php artisan migrate`. Schema idempotent.

## Site mode

Toggle di `/admin/settings`:
- `live` — semua publik aktif
- `coming_soon` — landing page diganti countdown ke `launch_at`. Admin tetap bisa akses.
- `maintenance` — semua publik di-blok 503 dgn pesan. Admin tetap bisa.
- `development` — sama dgn live (mode internal)

Cache 5 detik, jadi efek toggle hampir-langsung.

## Stroke recognition

Pipeline (browser-only):
1. User gambar di canvas → poly polyline points (viewBox 200×200)
2. `StrokeRecognition.smooth()` → moving average noise
3. `StrokeRecognition.resample(48)` → uniform spacing
4. SVG referensi → polyline via `path.getPointAtLength()` (DOM)
5. DTW + Hausdorff vs ref → 5 metric: shape (42%), position (24%), direction (18%), length (11%), smoothness (5%)
6. Score 0–100 + feedback code → POST `/strokes/attempts`

Min 4 aksara dgn `svg_url` butuh ada di catalog supaya engine jalan.

## Deploy

```bash
# Pre-flight check
php artisan app:check

# Production build
npm run build
php artisan optimize       # config + route + view cache
php artisan migrate --force

# Permissions (Linux)
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Hostinger / Apache shared hosting: pastikan `.htaccess` di `public/` ada, dan document root mengarah ke `public/`.

## Test akun

Setelah seed, bisa register admin pertama via `SETUP_KEY` (set di `.env`). Atau insert manual:
```sql
UPDATE users SET role='admin' WHERE email='your@email.com';
```

## Komparasi vs Next.js asli

Branch `lara-main` = Laravel rewrite di sub-folder `laravel/`. Next.js asli tetap di parent (untuk reference/migration). Schema + route + UI sudah feature-parity (Phase 1–13).
