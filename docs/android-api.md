# Aksa Bali Android API

Base path: `/api/mobile/v1`

Semua response mobile memakai bentuk:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": "Pesan error"
}
```

Gunakan header ini untuk endpoint yang butuh login:

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

## Manifest

`GET /api/mobile/v1/manifest`

Mengembalikan versi API, nama aplikasi, format auth, dan daftar endpoint aktif.

## Auth

`POST /api/mobile/v1/auth/register`

```json
{
  "email": "siswa@example.com",
  "password": "password123",
  "displayName": "Made"
}
```

`POST /api/mobile/v1/auth/login`

```json
{
  "email": "siswa@example.com",
  "password": "password123"
}
```

Response login/register:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "siswa@example.com",
      "display_name": "Made",
      "role": "siswa",
      "tier": "free"
    },
    "token": "jwt",
    "tokenType": "Bearer",
    "expiresIn": 604800
  }
}
```

`GET /api/mobile/v1/auth/me`

`POST /api/mobile/v1/auth/logout`

## Dashboard

`GET /api/mobile/v1/dashboard`

Butuh bearer token. Mengembalikan ringkasan profil, progres, aktivitas terakhir, dan status premium.

## Katalog Aksara

`GET /api/mobile/v1/catalog/categories`

`GET /api/mobile/v1/catalog/aksara`

Query opsional:

- `category=wrehasta`
- `premium=false`
- `limit=200`

Item aksara mengirim `svg_url` untuk stroke recognition, `image_url` untuk kartu PNG Noto Sans Balinese, dan `target_stroke_count` dari panduan `balinese-goresan.md`.

## Kuis

`GET /api/mobile/v1/quiz/modes`

Mode tersedia:

- `nyurat`
- `kata`
- `huruf`
- `match`
- `maca`
- `acak`

`GET /api/mobile/v1/quiz/materials`

Mengembalikan bahan anacaraka, swara aiueo, angka, gabungan vokal, kata, dan bank kuis.

`GET /api/mobile/v1/quiz/questions?mode=acak&limit=10&seed=kelas-a`

Query:

- `mode`: salah satu mode di atas
- `limit`: jumlah soal
- `seed`: supaya urutan soal bisa stabil
- `includeAnswers=true`: hanya aktif kalau server menyalakan `QUIZ_DEBUG_ANSWERS=true`, jangan dipakai di client siswa

`POST /api/mobile/v1/quiz/attempts`

```json
{
  "mode": "huruf",
  "seed": "latihan-1",
  "limit": 10,
  "durationSeconds": 90,
  "answers": [
    { "questionId": "huruf-ha", "answer": "ha" }
  ]
}
```

`GET /api/mobile/v1/quiz/attempts?mode=huruf&limit=20`

## Latihan Nyurat

`GET /api/mobile/v1/strokes/attempts?aksaraId=gabungan-vokal-ki-1B13-1B36&limit=20`

`POST /api/mobile/v1/strokes/attempts`

```json
{
  "aksaraId": "gabungan-vokal-ki-1B13-1B36",
  "mode": "nyurat",
  "score": 91,
  "passed": true,
  "mistakes": 1,
  "durationSeconds": 32,
  "metrics": [],
  "rawStrokes": [],
  "normalizedStrokes": []
}
```

`GET /api/mobile/v1/strokes/templates?aksaraId=gabungan-vokal-ki-1B13-1B36`

Mengembalikan template stroke dari attempt user yang lulus dan contoh global terbaik.

`POST /api/mobile/v1/strokes/recognize`

Endpoint ini menjalankan stroke recognition di server untuk Android.

```json
{
  "aksaraId": "gabungan-vokal-ki-1B13-1B36",
  "strokeIndex": 0,
  "durationSeconds": 12,
  "save": true,
  "strokes": [
    [
      { "x": 18.5, "y": 56.2, "t": 0, "pressure": 0.5 },
      { "x": 20.1, "y": 54.8, "t": 16, "pressure": 0.52 }
    ]
  ]
}
```

Response berisi skor total, status lulus, metrics per stroke, feedback, `normalizedStrokes`, dan `attemptId` kalau `save=true`.

## Game Kelas

`POST /api/mobile/v1/game/sessions`

Butuh token host/guru.

```json
{
  "title": "Kuis Aksara Kelas 5",
  "mode": "acak",
  "questionCount": 12,
  "secondsPerQuestion": 20,
  "seed": "kelas-5-sesi-1"
}
```

Response berisi `session.pin`.

`GET /api/mobile/v1/game/sessions/{pin}`

Mengambil status sesi, pemain, dan pertanyaan aktif tanpa membocorkan jawaban.

`POST /api/mobile/v1/game/sessions/{pin}/join`

```json
{
  "displayName": "Komang"
}
```

`POST /api/mobile/v1/game/sessions/{pin}/control`

Butuh token host sesi.

```json
{ "action": "start" }
```

Action yang didukung: `start`, `next`, `previous`, `finish`.

Atau set manual:

```json
{
  "status": "live",
  "currentQuestionIndex": 2
}
```

`POST /api/mobile/v1/game/sessions/{pin}/answer`

```json
{
  "questionIndex": 0,
  "answer": "ha",
  "elapsedMs": 4200
}
```

Response:

```json
{
  "success": true,
  "data": {
    "duplicate": false,
    "correct": true,
    "scoreDelta": 895,
    "correctOption": "ha",
    "player": {},
    "leaderboard": []
  }
}
```

`GET /api/mobile/v1/game/sessions/{pin}/leaderboard`

## Payment

`GET /api/mobile/v1/payments/plans`

`POST /api/mobile/v1/payments/create`

```json
{
  "plan": "lifetime"
}
```

Response berisi `snapToken` dan `redirectUrl` Midtrans.

## Environment Production

Wajib disiapkan di server:

```env
APP_URL=https://domain-production
JWT_SECRET=isi_random_panjang_minimal_32_karakter
DATABASE_URL=mysql://user:password@host:3306/nama_database
MIDTRANS_SERVER_KEY=...
MIDTRANS_IS_PRODUCTION=true
DB_AUTO_CREATE=true
```

Migrasi MySQL:

```bash
npm run db:migrate
```

Script migrasi otomatis membuat database jika belum ada, selama user MySQL punya izin `CREATE DATABASE`.
