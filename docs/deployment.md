# Deployment & Auto-Migration

Aksa Bali jalanin **migrasi DB otomatis** saat server start production. Tidak perlu
manual `npm run db:migrate` setiap deploy.

## Cara kerja

`package.json` punya `prestart` hook:

```json
{
  "scripts": {
    "prestart": "node scripts/migrate.cjs",
    "start": "next start"
  }
}
```

npm convention: setiap `npm start` otomatis jalanin `prestart` dulu. Jadi flow-nya:

```
deploy → npm install → npm start
                         ↓
                       prestart → scripts/migrate.cjs (migrasi)
                                    ↓
                                  next start (server hidup)
```

### Yang dilakukan migrate.cjs

1. **Cek env DB** — kalau `DATABASE_URL` / `DB_HOST` kosong, skip dengan WARN (tidak fail build).
2. **Acquire MySQL advisory lock** `aksabali_schema_migrate` — cegah multi-instance migrate bersamaan saat horizontal scaling.
3. **Execute DDL idempotent** — `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE MODIFY` (aman re-run).
4. **`ensureColumn()`** untuk kolom baru — cek `SHOW COLUMNS`, hanya ADD kalau belum ada.
5. **Re-seed data konstanta** — kategori + aksara dasar (idempotent ON DUPLICATE KEY).
6. **Release lock**.

Migrasi tipikal selesai dalam **< 1 detik** kalau tidak ada perubahan schema.

## Environment variables

Wajib di production:

```ini
DATABASE_URL=mysql://user:password@host:3306/aksabali
# atau:
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=3306         # default
DB_AUTO_CREATE=true  # auto bikin database kalau belum ada

JWT_SECRET=<random-32-byte-string>
```

Optional:

```ini
SKIP_DB_MIGRATE=true   # skip migrasi (untuk debugging / build env)
DEBUG=true             # verbose error stack saat migrasi gagal
```

---

## Platform-specific setup

### 🟢 Railway / Render / Fly.io / Self-hosted

Tidak perlu konfigurasi tambahan — `npm start` adalah default command. `prestart`
otomatis jalan.

**Railway/Render**: setting → environment → set DB env vars → deploy.

**Fly.io**: `fly.toml`:
```toml
[processes]
  app = "npm start"  # akan jalanin prestart → next start
```

### 🟡 Vercel

Vercel pakai serverless — **tidak ada `npm start`**. Solusi:

**Opsi 1: Run migration di build step**

Tambah ke `vercel.json`:
```json
{
  "buildCommand": "node scripts/migrate.cjs && next build"
}
```

Set DB env vars di Vercel dashboard → Settings → Environment Variables → tick
"Production", "Preview", **dan "Build"** (penting — build env butuh akses DB).

**Caveat**: build env Vercel temporary, tidak shared dengan runtime. Migrasi
tetap pakai DB production yang sama (kalau env var-nya sama).

**Opsi 2: Vercel Cron Job**

Buat `/api/admin/migrate` endpoint (sudah dilindungi admin auth), lalu di `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/admin/migrate", "schedule": "0 */6 * * *" }
  ]
}
```

Jalanin manual `curl` setelah deploy juga bisa.

**Opsi 3: Migration script di Vercel Build Output**

Lebih kompleks, lihat docs Vercel Build Output API.

### 🟡 Netlify

Sama dengan Vercel — serverless. Setting `build` command:
```
node scripts/migrate.cjs && next build
```

DB env vars harus accessible di build step.

### 🟢 Docker

Multi-stage build, dengan migration di entrypoint:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
# prestart akan auto jalan saat npm start
CMD ["npm", "start"]
```

`docker-compose.yml`:
```yaml
services:
  app:
    build: .
    environment:
      DATABASE_URL: mysql://...
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
  db:
    image: mysql:8
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 5s
```

---

## Bootstrap pertama kali (Hostinger / shared hosting)

Kalau hosting **tidak pakai `npm start`** sebagai entry point (mis. Hostinger,
cPanel + Phusion Passenger, dll), `prestart` hook tidak akan trigger. Tabel
tidak akan dibuat otomatis pas first deploy.

**Gejala**: error `Table 'xxx.profiles' doesn't exist` pas login.

### Solusi: trigger via `/api/setup/migrate` endpoint

1. **Set env var di hosting dashboard**:
   ```
   SETUP_KEY=<generate random 32-byte string>
   ```
   Contoh generate: `openssl rand -hex 32`

2. **Deploy ulang** supaya env var ke-load.

3. **Curl endpoint** dari laptop kamu:
   ```bash
   curl -X POST https://aksabali.app/api/setup/migrate \
     -H "X-Setup-Key: <SETUP_KEY>"
   ```

4. **Response**:
   ```json
   {
     "success": true,
     "data": {
       "ok": true,
       "via": "setup-key",
       "elapsed_seconds": 0.94,
       "stdout": [
         "[migrate ...] Memulai migrasi skema database…",
         "Database ready: aksabali",
         "[migrate ...] Menjalankan DDL schema.sql…",
         "[migrate ...] ✓ Migrasi selesai dalam 0.94s."
       ],
       "stderr": []
     }
   }
   ```

5. Tabel sudah ada. Login bisa.

6. **Setelah login admin pertama kali**, endpoint juga bisa dipanggil tanpa
   `X-Setup-Key` (pakai admin session). Cocok kalau ada perubahan schema lain
   nanti.

7. **Optional**: pas semua sudah stabil, kamu boleh hapus env var `SETUP_KEY`
   dari hosting biar endpoint cuma bisa via admin session (lebih aman).

### Alternatif: SSH ke server

Kalau hosting kasih SSH access:
```bash
ssh user@host
cd public_html  # atau direktori app
npm run db:migrate
```

## Manual override

Kalau perlu skip auto-migrate (mis. troubleshooting):

```bash
SKIP_DB_MIGRATE=true npm start
```

Atau migrate manual:

```bash
npm run db:migrate
```

Lalu start tanpa hook:

```bash
SKIP_DB_MIGRATE=true npm start
```

## Bonus: full deploy seed

`npm run deploy:migrate` jalanin migrate + seed pangangge sekaligus. Aman
re-run karena semua idempotent.

```bash
npm run deploy:migrate
```

---

## Troubleshooting

**Migrasi gagal saat deploy?**
- Cek log: `[migrate ...] ✗ Migrasi gagal: ...`
- Set `DEBUG=true` untuk lihat stack trace lengkap
- Kalau MySQL belum ready (cold start), retry akan otomatis jalan saat scale up

**Multiple instance scaling — race condition?**
- Sudah di-handle pakai MySQL `GET_LOCK('aksabali_schema_migrate', 60)`
- Instance kedua akan tunggu sampai 60 detik, baru fail

**Schema drift antara dev dan prod?**
- `database/schema.sql` adalah single source of truth
- `ensureColumn()` calls di `scripts/migrate.cjs` handle kolom yang ditambah belakangan
- Re-run `npm run db:migrate` selalu aman (idempotent)
