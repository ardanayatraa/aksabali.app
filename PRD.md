# PRD — Aksara Bali Learning Platform

**Versi dokumen:** 1.0
**Tanggal:** Mei 2026
**Status:** Draft untuk MVP Build Phase
**Target launch:** Agustus 2026 (V1) → puncak BBB IX Februari 2027

---

## 1. Executive Summary

**Aksara Bali Learning Platform** adalah produk edukasi digital yang membantu siswa Bali (SD/SMP/SMA), mahasiswa, dan pelestari budaya untuk mempelajari, berlatih menulis, dan menguasai Aksara Bali secara interaktif. Produk hadir dalam dua mode utama: **Solo Practice** (latihan menulis dengan feedback stroke order, mirip Kakimashou & Write It! Japanese) dan **Game Mode Kahoot-style** (kuis multiplayer real-time untuk kelas dan persiapan lomba).

Positioning utama: **tools persiapan Lomba Nyurat Aksara Bali Bulan Bahasa Bali (BBB)** yang diadakan setiap Februari oleh Provinsi Bali.

Pricing: **Rp 49.000 lifetime per orang** (single tier, premium unlock semua fitur). Free tier untuk player game dan akses 5 aksara dasar.

---

## 2. Product Vision

> Membuat Aksara Bali **mudah dipelajari, menyenangkan dipraktikkan, dan kompetitif untuk dilombakan** — sehingga generasi muda Bali bangga dan kompeten dalam warisan tulisan leluhur mereka.

### Goals
- **Short-term (Year 1)**: 1.000+ paying users, jadi tools rujukan persiapan Lomba BBB IX 2027.
- **Mid-term (Year 2-3)**: Jadi standar de facto pembelajaran Aksara Bali digital di sekolah-sekolah Bali.
- **Long-term**: Ekspansi ke aksara nusantara lain (Aksara Jawa, Sunda, Batak, Lontara) dengan engine yang sama.

---

## 3. Problem & Opportunity

### Problem
- Aksara Bali adalah mata pelajaran muatan lokal wajib di sekolah Bali, tapi tools belajarnya **sangat terbatas dan jadul**.
- Tools yang ada (Nulis Aksara Bali, ToAksara, dll.) fokus ke **transliterasi**, bukan ke **pembelajaran menulis dengan feedback**.
- ChatGPT tidak bisa render Aksara Bali dengan benar dan tidak bisa kasih feedback stroke order.
- Lomba Nyurat Aksara Bali (Bulan Bahasa Bali) butuh persiapan intensif — tapi tidak ada platform digital untuk simulasinya.

### Opportunity
- **Captive market**: Ribuan SD/SMP/SMA di Bali, ratusan ribu siswa, semua belajar Aksara Bali.
- **Annual demand cycle**: Bulan Bahasa Bali (Februari) menciptakan demand spike tahunan yang predictable.
- **Cultural preservation**: Pemerintah Provinsi Bali aktif mendukung pelestarian Aksara via Dinas Pemajuan Masyarakat Adat.
- **Niche tanpa kompetitor**: Untuk learning + writing practice + game-based — belum ada produk dominan.

---

## 4. Target Users & Personas

### Persona 1 — Siswa SD/SMP (primary, B2C)
- **Profil**: Anak 9–15 tahun, di Bali, belajar Aksara Bali sebagai muatan lokal.
- **Device**: HP Android (orangtua atau pinjaman).
- **Pain**: Sulit hafal aksara, tugas nyurat lama, takut salah, butuh feedback langsung.
- **Motivasi**: Nilai bagus, ikut lomba BBB, menang piala.
- **Pricing willingness**: Rp 49k via voucher dari guru/orangtua.

### Persona 2 — Siswa SMA / Mahasiswa (primary, B2C)
- **Profil**: 16–22 tahun, beberapa tertarik mendalami sastra/budaya Bali.
- **Device**: HP Android pribadi + laptop.
- **Pain**: Ingin baca lontar, tertarik baligrafi, kurang akses materi advanced.
- **Motivasi**: Skill, prestige akademik, persiapan lomba debat/baca lontar.
- **Pricing willingness**: Rp 49k via QRIS/e-wallet sendiri.

### Persona 3 — Guru Pembina Lomba (secondary, distribution channel)
- **Profil**: Guru Bahasa Bali / Penyuluh Bahasa Bali, 30–55 tahun.
- **Pain**: Capek koreksi tulisan siswa manual, sulit pantau progress kandidat lomba.
- **Motivasi**: Siswa menang lomba = nama sekolah harum, prestige guru.
- **Role**: Host game di kelas, advocate produk, calon early adopter.

### Persona 4 — Hobbyist / Expat / Turis (tertiary, B2C)
- **Profil**: Pendatang yang ingin belajar budaya Bali, pencinta linguistik.
- **Device**: Laptop + HP.
- **Pricing willingness**: Rp 49k = sangat murah dalam USD ($3).

---

## 5. Product Scope & MVP Definition

### Tier 1 (MVP — V1) — Launch Agustus 2026
**Konten**: ~61 karakter (dasar harian, sesuai kurikulum SD/SMP)
- Aksara wianjana (wreastra): **18**
- Aksara suara: **14**
- Pangangge suara: **~10**
- Pangangge tengenan: **4**
- Angka Bali: **10**
- Tanda baca dasar: **~5**

**Fitur**:
- Solo practice mode (canvas drawing + stroke comparison feedback)
- Game mode basic (2 modes: Tebak Aksara, Baca Aksara)
- Auth + payment + voucher redemption
- Free tier vs paid tier
- Web (host + landing) + Android (player + solo practice)

### Tier 2 (V2) — Bulan 3–6 setelah V1
**Konten tambahan**: ~28 karakter
- Gantungan: **18**
- Gempelan: **~5**
- Pangangge ardhasuara: **5**

**Fitur tambahan**:
- ML handwriting recognition (custom model, dilatih dari data user V1)
- Audio pronunciation untuk semua aksara
- 3 game mode tambahan: Susun Pasang, Sambungin Pangangge, Ngwacen Cepat
- Sertifikat digital (milestone-based)
- Dictionary terintegrasi

### Tier 3 (V3) — Bulan 6+ setelah V1
**Konten tambahan**: ~41 karakter (swalalita lengkap + lontar)
- Aksara wianjana Kawi/Sanskerta: **~15**
- Aksara suara dirgha: **~8**
- Gantungan swalalita: **~15**
- Tanda baca lengkap: **~3**

**Fitur tambahan**:
- Lontar reading mode (untuk Lomba Ngwacen Lontar SMA/SMK)
- Baligrafi mode (kaligrafi Aksara Bali)
- Mode lomba (timer + simulasi soal lomba historis)
- Native iOS app (porting React Native ke iOS)

### Tier 4 (Future, optional) — V4
- Aksara Modre (untuk mantra/spiritual, perlu konsultasi etis)
- Ekspansi ke Aksara Jawa, Sunda (engine yang sama)

---

## 6. Features & Functionality

### 6.1 Solo Practice Mode (Web + Android)

**Core flow:**
1. User pilih aksara/lesson → tutorial stroke order animation
2. Canvas drawing → user trace sesuai template
3. Real-time feedback: ✓ benar, ✗ arah salah, ✗ urutan salah
4. Setelah correct: lanjut ke aksara berikutnya / quiz
5. Progress tracking: streak, XP, level, completion %

**Detail fitur:**
- Canvas drawing dengan touch/mouse input
- Stroke order animation (SVG path animation)
- Stroke comparison feedback (V1) → ML handwriting recognition (V2)
- Audio pronunciation (V2)
- Multiple curricula: SD level, SMP level, SMA level, untuk turis
- Per-aksara cultural context (sejarah, penggunaan dalam lontar)

### 6.2 Game Mode (Kahoot-style)

**Core flow:**
1. Host (paid user) buka web → pilih game mode + quiz set
2. Server generate PIN 6-digit → tampilkan di layar
3. Players (free or paid) buka Android app → input PIN
4. Players masuk ke lobby, ketik nickname
5. Host start game → real-time round (5–10 questions)
6. Per question: tampil pertanyaan + 4 pilihan, timer 15-30 detik
7. Server collect jawaban, hitung skor (cepat + benar = poin tinggi)
8. Live leaderboard tiap question
9. Final leaderboard + winner announcement
10. Share result ke TikTok/IG (viral hook)

**Game modes V1 (MVP):**
1. **Tebak Aksara** — text Latin → 4 pilihan visual aksara
2. **Baca Aksara** — visual aksara → 4 pilihan teks Latin

**Game modes V2:**
3. **Susun Pasang** — kata Latin → 4 kombinasi aksara + pasang yang benar
4. **Sambungin Pangangge** — aksara dasar + pangangge → 4 hasil bunyi
5. **Ngwacen Cepat** — 5 aksara muncul cepat, ketik bunyi

**Limit per session:**
- Max 50 player per session (V1) / 100 player (V2)
- Max 20 question per game

### 6.3 Authentication & Account

**Login methods:**
- Email + password
- Phone number + OTP (untuk anak yang nggak punya email)
- Google OAuth (sekunder)

**Account roles:**
- `free` — bisa join game, akses 5 aksara dasar
- `premium` — bisa host game, akses semua fitur (lifetime)
- `admin` — internal, untuk content management & support

**Multi-device:**
- 1 account bisa login di max 3 device (web + Android + 1 lagi)
- Login di device ke-4 → otomatis logout salah satu

### 6.4 Payment & Voucher System

**Method 1: Web Payment (online)**

Flow:
1. User daftar dengan email/HP
2. Pilih channel pembayaran via Midtrans
3. Bayar → callback ke backend → `is_premium = true`
4. Login di Android → otomatis premium aktif

Channels:
- QRIS (universal)
- E-wallet: GoPay, Dana, OVO, ShopeePay
- Virtual Account: BCA, Mandiri, BNI, BRI
- **Indomaret/Alfamart** (anak SD/SMP tanpa rekening)
- Kartu kredit (turis/expat)

**Method 2: Voucher Code**

Format: `BALI-XXXX-XXXX` (12 char total + 2 dashes)
- `BALI` = brand prefix
- `XXXX` (batch ID) = 4 char
- `XXXX` (random + checksum HMAC) = 4 char

Aturan security:
- Generated server-side dengan HMAC signature
- Sekali redeem, mark `redeemed_at` + `device_id`
- Bind ke account pertama yang redeem
- Rate limiting: max 5 attempt per IP per menit

Voucher distribution:
- Voucher di-generate oleh admin via internal dashboard
- Bisa dijual langsung oleh tim ke sekolah/komunitas (B2B direct)
- Bisa dipakai untuk promo/giveaway

### 6.5 Free Tier vs Premium

| Fitur | Free | Premium (Rp 49k lifetime) |
|-------|------|-------|
| Join game (sebagai player) | ✅ | ✅ |
| Akses 5 aksara dasar (sample) | ✅ | ✅ |
| Akses semua aksara (61–130) | ❌ | ✅ |
| Host game | ❌ | ✅ |
| Custom quiz set | ❌ | ✅ |
| Sertifikat digital | ❌ | ✅ |
| Mode lomba (timer kompetisi) | ❌ | ✅ |
| Audio pronunciation (V2) | ❌ | ✅ |
| ML handwriting feedback (V2) | ❌ | ✅ |
| Lontar reading mode (V3) | ❌ | ✅ |

---

## 7. Content Library

### Total scope: ~130 karakter learning units (V3 lengkap)

| Kategori | V1 | V2 | V3 |
|----------|----|----|----|
| Aksara wianjana wreastra | 18 | 18 | 18 |
| Aksara suara | 14 | 14 | 14 |
| Pangangge suara | 10 | 10 | 10 |
| Pangangge tengenan | 4 | 4 | 4 |
| Angka Bali | 10 | 10 | 10 |
| Tanda baca | 5 | 5 | 5+3 |
| Gantungan | — | 18 | 18 |
| Gempelan | — | 5 | 5 |
| Pangangge ardhasuara | — | 5 | 5 |
| Aksara wianjana swalalita | — | — | 15 |
| Aksara suara dirgha | — | — | 8 |
| Gantungan swalalita | — | — | 15 |
| **Total** | **~61** | **~89** | **~130** |

### Per aksara harus tersedia:
- Stroke order data (urutan & arah goresan)
- SVG path untuk animation
- Audio pronunciation (V2+)
- Cultural context (sejarah, penggunaan)
- Contoh kata yang menggunakan aksara tersebut
- Common mistakes yang harus dihindari

### Content sources:
- Buku "Pasang Aksara Bali" (Simpen 1973, Suwija & Manda 2012)
- Tabel aksara dari Dinas Kebudayaan Provinsi Bali
- Kolaborasi dengan ahli/penekun lontar (advisor)
- Soal-soal Lomba Nyurat Aksara Bali historis (BBB I–VIII)

---

## 8. User Flows

### Flow 1: User Journey (B2C funnel)
```
Discover (TikTok/SEO/sekolah) → Coba gratis (no signup) → Lesson 1 →
Daftar (email/HP) → Daily practice loop → Hit free limit / butuh fitur →
Bayar Rp 49k (QRIS/Indomaret/voucher) → Premium aktif → Power user
```

### Flow 2: Voucher Redemption
```
Siswa beli voucher dari guru → Buka app → Input code → 
Server validate (HMAC + DB + rate limit) → 
[Sukses] Lock to device + issue JWT → Premium aktif
[Gagal] Reject + log abuse attempt
```

### Flow 3: Game Session (Kahoot-style)
```
Host buat game di web → Server generate PIN → Tampilkan PIN di layar →
Players input PIN di Android → Players masuk lobby → 
Host start round → Real-time Q&A → Live leaderboard →
Final winner → Share to social media
```

### Flow 4: Web Payment
```
User daftar → Pilih channel bayar → Midtrans redirect → 
Bayar → Webhook → Backend update is_premium = true →
Email confirmation → Login di Android → Premium aktif
```

---

## 9. Technical Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                          │
├──────────────────────────┬──────────────────────────────┤
│  Web (Next.js)           │  Mobile (React Native+Expo)  │
│  - Host game             │  - Player join game          │
│  - Solo practice         │  - Solo practice             │
│  - Payment & redemption  │  - Voucher redemption        │
│  - Admin dashboard       │                              │
└──────────────────────────┴──────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API LAYER                             │
│  Supabase Edge Functions (TypeScript)                   │
│  - Auth + JWT issuance                                  │
│  - Voucher validation (HMAC)                            │
│  - Payment webhook (Midtrans)                           │
│  - Game session management                              │
│  - Anti-abuse + rate limiting                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│  Supabase Postgres + RLS + Realtime                     │
│  - Users, vouchers, lessons, sessions, progress         │
│  - Row-level security: premium content gated by RLS     │
│  - Realtime channel per game session (WebSocket)        │
│  - Storage: aksara assets (SVG, audio)                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                      │
│  - Midtrans (payment gateway)                           │
│  - Cloudflare Turnstile (anti-bot)                      │
│  - Sentry (error tracking)                              │
│  - PostHog (product analytics)                          │
└─────────────────────────────────────────────────────────┘
```

### Real-time game architecture

```
Host Web ── publish ──→ Supabase Realtime Channel ──→ Players Android
            (round, question, timer)                  (subscribe)

Players Android ── publish answer ──→ Channel ──→ Host Web (collect)
                                              ──→ Server (score calc)

Server ── publish leaderboard ──→ Channel ──→ All clients
```

---

## 10. Tech Stack

| Layer | Tech | Justifikasi |
|-------|------|------------|
| Web frontend | **Next.js 14** + Tailwind | SEO, SSR, fast dev |
| Mobile | **React Native + Expo** | 1 codebase, fast iteration, native API access |
| Canvas | **HTML5 Canvas** + custom stroke comparison | Lightweight, kontrol penuh |
| Animation | **SVG path animation** + Framer Motion | Stroke order yang smooth |
| Backend / DB / Auth | **Supabase** (Postgres + Auth + Realtime + Storage + Edge Functions) | All-in-one, RLS bawaan, hemat infrastruktur |
| Realtime | **Supabase Realtime** | Built-in WebSocket, scales otomatis |
| Payment | **Midtrans** | Coverage Indonesia paling lengkap (QRIS, e-wallet, Indomaret) |
| Anti-bot | **Cloudflare Turnstile** atau **hCaptcha** | Free tier, simpel |
| Error tracking | **Sentry** | Standar industri |
| Analytics | **PostHog** | Self-hosted option, privacy-friendly |
| Email | **Resend** | Reliable transactional email |
| OTP / SMS | **Vonage** atau **Twilio** | Untuk login HP |
| Mobile distribution | **Google Play Store** + APK direct download | Coverage + flexibility |

---

## 11. Security Requirements

### Filosofi: Server-side adalah king
**Semua premium content disimpan di server, bukan di APK.** Cracker bypass APK → tetap nggak dapet konten karena nggak punya valid token.

### Defense layers

**Layer 1: Authentication & JWT**
- Login → server issue JWT (expires 1 hour) + refresh token (30 days)
- JWT cryptographically signed
- Tiap API request bawa token di header

**Layer 2: Row-level security (Supabase RLS)**
```sql
-- Hanya paid user bisa akses lesson > sample
CREATE POLICY "Premium content for paid users only"
ON aksara_lessons FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM users WHERE is_premium = true
  ) OR aksara_id IN (1,2,3,4,5)
);
```

**Layer 3: Device binding**
- JWT tied ke device_id (Android ID + hardware fingerprint)
- Max 3 device per account
- Detect emulator / device clone → flag akun

**Layer 4: SSL pinning**
- Pin server certificate di mobile app
- Mencegah MITM via Frida/Charles Proxy

**Layer 5: Play Integrity API**
- Verify APK genuine dan unmodified
- Server check integrity attestation untuk request critical

**Layer 6: Code obfuscation (R8/ProGuard)**
- Rename class/method/variable
- Strip debug strings dan logs
- Reverse engineering 10x lebih lambat

**Layer 7: Server-side anomaly detection**
- Monitor pattern abusive (terlalu cepat complete, multiple device per detik)
- Auto-flag → temporary suspend
- Manual review

### Voucher code security
- HMAC-signed (server-only secret)
- Single-use (locked after first redemption)
- Rate limited (max 5 attempts/IP/minute)
- Tracked metadata (device_id, IP, timestamp)

### Data privacy
- GDPR-compliant export & deletion (Indonesia juga punya UU PDP 2022)
- Minimal data collection (email/HP, progress, payment)
- Data anak < 13 tahun: butuh consent orangtua
- Tidak tracking lokasi precise (cukup region untuk analytics)

---

## 12. Pricing & Monetization

### Pricing tier (Final)

| Tier | Harga | Target |
|------|-------|--------|
| **Free** | Rp 0 | Anyone — bisa join game, 5 aksara sample |
| **Premium Lifetime** | **Rp 49.000** | Semua user — unlock semua fitur permanen |

### Channel akuisisi premium
1. **Web payment** (Midtrans, semua channel Indonesia)
2. **Voucher code** (dijual langsung oleh tim ke sekolah/komunitas, atau untuk promo)

### Revenue projection (Year 1)
- Base case: 800 paying users × Rp 49k = **Rp 39,2 juta**
- Optimistic (BBB IX boost): 2.000 paying users × Rp 49k = **Rp 98 juta**
- Year 2 dengan testimoni & retention: 3-5x growth = **Rp 150-500 juta**

### Future revenue stream (Year 2+)
- Premium Plus (Rp 19k/bulan): Advanced features (ML AI, lontar reading)
- Sponsor & grant (cultural preservation, education)
- Aksara Jawa/Sunda expansion (license model)

---

## 13. Distribution & Marketing Strategy

### Pre-launch (Mei–Juli 2026)
- Build in public di Twitter/X + Threads + LinkedIn
- Approach 1-2 ahli aksara Bali sebagai advisor
- Riset 5-10 sekolah unggulan, kumpulin soal lomba historis
- Landing page placeholder + waitlist

### Soft launch (Agustus 2026)
- Launch ke komunitas: Discord/Telegram developer Bali, grup mahasiswa IT/Sastra
- TikTok demo: "Belajar nulis aksara Bali dalam 60 detik"
- Hubungi 2-3 dosen Sastra Bali UNUD/Undiksha
- Free tier wide release

### Pre-season (September–Oktober 2026)
- B2B outreach: 50–100 sekolah yang aktif di BBB
- Konten marketing intensif: TikTok, YouTube tutorial
- Approach Penyuluh Bahasa Bali (network resmi pemerintah)
- Sertifikat partner: 2-3 sekolah pilot dapet license demo

### Peak prep (November 2026 – Januari 2027)
- Push hard sales B2B (sekolah finalize budget tahun ajaran)
- "Paket Persiapan Lomba BBB IX" promo
- Direct outreach ke 10–20 sekolah unggulan
- Beta test di sekolah pilot

### BBB IX Peak (Februari 2027)
- Hadir liput BBB IX di sekolah-sekolah pengguna
- Capture testimoni siswa pemenang
- Document case study: "Sekolah X pakai produk kami → siswa menang lomba"
- PR campaign + social media flooding

### Post-event (Maret 2027+)
- Iterate berdasarkan feedback BBB IX
- Build V2 features (ML handwriting, audio, sertifikat)
- Plan untuk BBB X (siklus tahunan)

---

## 14. Bulan Bahasa Bali Integration

### Konteks
**Bulan Bahasa Bali (BBB)** adalah event tahunan Provinsi Bali setiap Februari, sudah edisi VIII (2026). Diorganisir Dinas Pemajuan Masyarakat Adat Provinsi Bali. Tiered: sekolah → kecamatan → kabupaten → provinsi.

### Lomba yang relevan dengan produk
| Lomba | Tingkat | Mapping ke produk |
|-------|---------|-------------------|
| Nyurat Aksara Bali | SD | Solo practice mode + game mode |
| Nyurat Lontar | SMP | Lontar mode (V3) |
| Ngwacen Lontar | SMA/SMK | Reading mode (V3) |
| Baligrafi | SMA/SMK | Baligrafi mode (V3) |

### Stakeholder ekosistem BBB
- **Dinas Pemajuan Masyarakat Adat Provinsi Bali** (organizer)
- **Dinas Kebudayaan kabupaten** (Buleleng, Gianyar, Denpasar, dll.)
- **Penyuluh Bahasa Bali** (educator resmi)
- **Sekolah unggulan** (yang sering menang)
- **Komite & Ortu** (funding via BOS, dana komite)

### Timing strategi
- **Februari**: Event peak — capture testimoni
- **Mar–Mei**: Post-event analysis, iterate
- **Jun–Agt**: Build & ship features
- **Sep–Okt**: Pre-season marketing
- **Nov–Jan**: Peak prep — sales spike
- **(loop)**

---

## 15. Success Metrics & KPIs

### Year 1 targets (Aug 2026 – Aug 2027)

| Metric | Target | Stretch |
|--------|--------|---------|
| Paying users | 1.000 | 3.000 |
| Revenue | Rp 49 juta | Rp 147 juta |
| Free users | 5.000 | 20.000 |
| Daily active users (DAU) | 200 | 1.000 |
| Sekolah pilot | 5 | 20 |
| Game sessions/bulan | 500 | 5.000 |

### Engagement metrics
- D1 retention: > 40%
- D7 retention: > 20%
- D30 retention: > 10%
- Avg session duration: 8–15 menit
- Lessons completed/user/week: ≥ 5

### BBB-specific metrics (Februari 2027)
- Sekolah peserta BBB IX yang pakai produk kami: ≥ 10
- Siswa juara yang aktif di app: ≥ 3 (testimoni emas)

### Health metrics (technical)
- API uptime: > 99.5%
- Game session latency: < 200ms p95
- Crash-free rate (Android): > 99.5%

---

## 16. Roadmap & Timeline

### Phase 1: Build (Mei–Agustus 2026) — 16 minggu

**Minggu 1–2: Foundation**
- Setup Supabase project + RLS schema
- Auth flow (email + HP OTP)
- Web Next.js boilerplate + design system
- React Native + Expo setup

**Minggu 3–6: Solo practice (V1 core)**
- Canvas drawing component
- 18 wianjana wreastra + 14 suara (32 aksara)
- Stroke comparison feedback engine
- Stroke order SVG animations
- Progress tracking

**Minggu 7–8: Konten lengkap V1**
- 10 pangangge suara + 4 tengenan
- 10 angka + 5 tanda baca dasar
- Curriculum progression logic
- XP, streak, level system

**Minggu 9–10: Payment & voucher**
- Midtrans integration (QRIS, e-wallet, VA, Indomaret)
- Voucher code generation + HMAC validation
- Admin dashboard MVP (untuk generate voucher batch internal)

**Minggu 11–13: Game mode (Kahoot basic)**
- Supabase Realtime channel architecture
- Host UI (web)
- Player UI (Android)
- Tebak Aksara + Baca Aksara modes
- PIN system + lobby + leaderboard

**Minggu 14: Security hardening**
- JWT + device binding
- Play Integrity API integration
- R8/ProGuard obfuscation
- SSL pinning
- Anti-abuse rate limiting

**Minggu 15: QA & polish**
- Beta testing (10–20 user dari komunitas)
- Bug fixing
- UX polish
- Onboarding flow

**Minggu 16: Soft launch**
- Landing page final
- Marketing material (TikTok demo, screenshots)
- Public release: web + Play Store
- Wait for first paying users

### Phase 2: Pre-season (September–Oktober 2026)
- B2B outreach (sekolah, Dinas)
- Konten marketing harian
- Komunitas mahasiswa & guru Bahasa Bali engagement
- Iterate based on early user feedback

### Phase 3: Peak prep (November 2026 – Januari 2027)
- Hard sales push
- "Paket Persiapan Lomba" campaign
- Sekolah pilot beta
- V1.5: minor improvements, bug fixes

### Phase 4: BBB IX (Februari 2027)
- Event coverage
- Testimoni capture
- PR & case studies

### Phase 5: V2 Build (Maret–Juli 2027)
- ML handwriting recognition (custom model)
- Audio pronunciation (record dengan ahli)
- 3 game mode tambahan
- Pasang/gantungan/gempelan
- Sertifikat digital

### Phase 6: V3 (Agustus 2027+)
- Lontar reading mode
- Baligrafi mode
- Native iOS app
- Aksara swalalita lengkap
- Ekspansi awal ke Aksara Jawa/Sunda (eksperimental)

---

## 17. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **APK di-crack & modded APK tersebar** | High | Medium | Server-side content + Play Integrity + multiple security layers |
| **Adopsi sekolah lambat (sales cycle panjang)** | Medium | High | Fokus B2C dulu via TikTok, sekolah jadi nice-to-have |
| **ChatGPT/AI lain ngeluarin tools serupa** | Medium | Low | Niche ini terlalu kecil + butuh custom data, AI generic susah masuk |
| **Realtime multiplayer susah implement** | High | Medium | Pakai Supabase Realtime (battle-tested), bukan bikin sendiri |
| **Konten tidak akurat / kena kritik budayawan** | High | Medium | Kolaborasi dengan ahli sebagai advisor, validasi konten ke Dinas Kebudayaan |
| **Pricing terlalu rendah, revenue tidak cukup** | Medium | Medium | Tetap Rp 49k tapi tambah upsell (V2 premium subscription, sponsor) |
| **Bulan Bahasa Bali tidak ramai 2027** | Low | Low | Backup positioning: tools belajar aksara general, bukan sole focus lomba |
| **Solo dev burnout / scope creep** | High | High | Strict V1 scope, jangan tambah fitur sampe V1 launch |
| **Dependency Supabase down / pricing naik** | Medium | Low | Self-host option backup (Postgres + custom realtime) |

---

## 18. Open Decisions / TBD

Beberapa keputusan masih harus difinalisasi:

1. **Konfirmasi Supabase Realtime cukup untuk 50–100 player concurrent** — perlu PoC test sebelum commit.
2. **Branding & nama produk final** — masih working title "Aksara Bali Learning Platform"; perlu nama yang catchy + culturally appropriate.
3. **Logo & visual identity** — siapa designer-nya? Self-design atau hire?
4. **Free tier scope final** — 5 aksara sample atau lebih banyak? Tradeoff antara hook strength dan conversion.
5. **App distribution iOS** — V1 Android only, V3 baru iOS. Konfirmasi prioritas.
6. **Domain & hosting** — beli domain `.id` atau `.com`? Hosting di Indonesia (untuk latency) atau global?
7. **Legal entity** — perlu PT untuk receive payment business? Atau personal account dulu?
8. **Tax compliance** — kapan threshold PKP (PPN 11%) tercapai? Konsultasi akuntan.
9. **Modre support** — kapan & bagaimana? Etis dan kontroversial. Skip dulu V1–V3.
10. **Aksara expansion roadmap** — Jawa, Sunda, Lontara — berapa serius? Year 3+ saja.

---

## 19. Appendix

### A. Database Schema (high-level)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  is_premium BOOLEAN DEFAULT false,
  premium_at TIMESTAMP,
  device_ids TEXT[],
  role TEXT DEFAULT 'user',  -- user | admin
  created_at TIMESTAMP DEFAULT now()
);

-- Vouchers
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  code_hash TEXT NOT NULL,  -- HMAC signature
  batch_id TEXT,
  created_by UUID REFERENCES users(id),  -- admin yang generate
  redeemed_by UUID REFERENCES users(id),
  redeemed_at TIMESTAMP,
  redeemed_device TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Aksara content
CREATE TABLE aksara_lessons (
  id UUID PRIMARY KEY,
  aksara_id INTEGER UNIQUE,  -- 1, 2, 3, ...
  category TEXT,  -- wianjana | suara | pangangge | angka | etc.
  unicode_char TEXT,
  latin_name TEXT,
  stroke_data JSONB,  -- SVG paths + order
  audio_url TEXT,
  context_text TEXT,
  tier INTEGER,  -- 1 (V1), 2 (V2), 3 (V3)
  is_sample BOOLEAN DEFAULT false  -- true untuk free tier
);

-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  host_id UUID REFERENCES users(id),
  pin TEXT UNIQUE,
  mode TEXT,  -- tebak_aksara | baca_aksara | etc.
  status TEXT,  -- waiting | active | finished
  questions JSONB,
  created_at TIMESTAMP,
  finished_at TIMESTAMP
);

CREATE TABLE session_players (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id),
  user_id UUID REFERENCES users(id),
  nickname TEXT,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP
);

-- Progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  aksara_id INTEGER,
  best_score INTEGER,
  attempts INTEGER,
  completed_at TIMESTAMP
);
```

### B. Voucher code generation algorithm

```typescript
import crypto from 'crypto';

const SECRET = process.env.VOUCHER_HMAC_SECRET; // server-only

function generateVoucherCode(batchId: string): string {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
  const payload = `BALI-${batchId}-${random}`;
  const checksum = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  return `BALI-${batchId}-${random}${checksum}`;
}

function validateVoucherCode(code: string): boolean {
  const parts = code.split('-');
  if (parts.length !== 3 || parts[0] !== 'BALI') return false;
  const [_, batchId, randomChecksum] = parts;
  if (randomChecksum.length !== 8) return false;
  const random = randomChecksum.substring(0, 4);
  const checksum = randomChecksum.substring(4);
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`BALI-${batchId}-${random}`)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  return checksum === expected;
}
```

### C. Referensi & Resources

- Kakimashou — https://www.kakimashou.com (referensi UX writing practice)
- Write It! Japanese — https://apps.apple.com/us/app/write-it-japanese (referensi mobile design)
- Bulan Bahasa Bali — https://dpma.baliprov.go.id
- Pasang Aksara Bali — https://disbud.bulelengkab.go.id/informasi/detail/artikel/24-pasang-aksara-bali
- Buku referensi: "Pasang Aksara Bali" (Simpen, 1973), "Pasang Aksara Bali" (Suwija & Manda, 2012)
- Unicode Aksara Bali: https://www.unicode.org/charts/PDF/U1B00.pdf

### D. Glosarium

- **Aksara wianjana** — huruf konsonan
- **Aksara suara** — huruf vokal
- **Wreastra** — bentuk dasar/sehari-hari (modern Balinese)
- **Swalalita** — bentuk lengkap untuk Sanskerta/Kawi
- **Modre** — bentuk untuk mantra/spiritual
- **Pangangge** — modifier (vokal, tengenan, ardhasuara)
- **Pasang** — aturan kombinasi/penulisan
- **Gantungan** — konsonan di bawah
- **Gempelan** — konsonan di samping
- **Lontar** — naskah daun palem tradisional
- **Baligrafi** — kaligrafi Aksara Bali
- **BBB** — Bulan Bahasa Bali (event Provinsi Bali setiap Februari)
- **Penyuluh Bahasa Bali** — educator resmi pemerintah daerah

---

**End of PRD v1.0**
