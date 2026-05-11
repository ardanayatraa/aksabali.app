# DESIGN.md

Catatan desain Aksa Bali. Tulis dulu sebelum bikin halaman baru biar nggak nyasar gaya. Kalau ragu, buka [components/AppShell.jsx](components/AppShell.jsx) — itu sumber kebenaran de facto karena dia yang dipakai di semua halaman pemain.

## Vibe

**Tridatu** — tiga warna suci dalam tradisi Bali: **merah** (Brahma, pencipta), **putih** (Wisnu, pemelihara), **hitam** (Siwa, pelebur). Palet pure dan tegas, persis kayak benang tridatu yang dipakai di pelinggih. Bukan flat material, bukan glassmorphism, bukan brutalist — minimalis kontras tinggi: hitam pekat di atas putih, merah cuma muncul untuk hal yang penting (CTA, brand, status).

Yang **bukan kita**: warna pastel manis, gradient pelangi, warna neon, ikon-ikon 3D, palet earth-tone (warm beige/saffron) seperti versi sebelumnya. Merah dipakai hemat — kalau semua merah, nggak ada yang menonjol.

Copy semua Bahasa Indonesia. `<html lang="id">`. Role: *siswa*, *pengajar*, *admin*. Tier: *free*, *lite*, *premium*. Jangan pernah balik ke English label.

## Font

Tiga peran, semua udah di-wire di [app/layout.jsx](app/layout.jsx):

- **Fraunces** untuk display & heading. Di Tailwind namanya `font-display`. CSS var-nya `--font-epilogue` (warisan nama lama — jangan dirombak, banyak yang udah refer). `h1`/`h2`/`h3` otomatis kena Fraunces + `letter-spacing: -0.02em` lewat [globals.css](app/globals.css). Jangan dioverride.
- **Outfit** untuk body & UI. Tailwind: `font-sans`. Var: `--font-lexend`. Default-nya `<body>`, jadi biasanya nggak perlu ditulis ulang.
- **Nirmala UI** / **Noto Sans Balinese** khusus karakter Bali (U+1B00–U+1B7F, lihat [balinese-goresan.md](balinese-goresan.md)). Pakai `font-bali` atau class `.bali-text`. Outfit/Fraunces nggak punya block ini — kalau lupa, glyph keluar sebagai kotak tofu.

Weight yang sering dipakai: `font-bold` (600) untuk nav & label, `font-black` (900) untuk angka/penekanan, `font-semibold` untuk teks sekunder. `font-medium` lenyap di atas background krem, skip aja.

Pola eyebrow yang udah konsisten di header & sidebar admin:

```jsx
className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8B1F18]"
```

Tracking 0.12–0.16em tergantung konteks. Kalau bikin label kategori, ikutin pola ini biar nggak ada label gaya ketiga muncul tanpa alasan.

## Warna

Tiga lapis. Pilih lapis yang paling cocok sama konteks:

**1. Token semantik** — paling fleksibel, ikut dark mode. `bg-background`, `text-foreground`, `bg-primary`, `bg-secondary`, `bg-accent`, `bg-muted`, `border-border`, `ring-ring`. Plus skala surface ala M3: `bg-surface`, `bg-surface-dim`, `bg-surface-low`, `bg-surface-container`, `bg-surface-high`, `bg-surface-highest`, `bg-surface-lowest`.

**2. Alias kultural** — alias murni dari token di atas. Nama-nama warisan (`brick`, `saffron`, `lontar`) sengaja dipertahankan supaya nggak rename ratusan utility call. Nilai sekarang udah mapping ke Tridatu:

| alias | sama dengan | nilai sekarang | kapan pakai |
|---|---|---|---|
| `bg-lontar` | background | `#FAFAFA` (putih) | halaman, hero |
| `text-ink` | foreground | `#1A1A1A` (hitam) | teks utama |
| `bg-brick` | primary | `#B91C1C` (merah Tridatu) | CTA, brand, active nav |
| `bg-saffron` / `bg-ocean` | tertiary | `#1A1A1A` (hitam) | aksen kedua, kalau merah udah dipakai |
| `bg-sand` | secondary | abu-abu sangat muda | panel pendamping |
| `bg-rice` | surface-lowest | `#FFFFFF` | kartu putih bersih |

Catatan: nama `brick` masih cocok (kebetulan masih merah). `saffron` udah nggak deskriptif — sekarang hitam, dipakai cuma kalau butuh aksen sekunder selain merah.

**3. Hex hardcoded di AppShell** — sengaja di-freeze biar shell-nya stabil:

| hex | peran |
|---|---|
| `#FAFAFA` | bg pemain (putih) |
| `#F5F5F5` | bg admin (off-white) |
| `#FFFFFF` / `#F0F0F0` | surface sidebar admin |
| `#B91C1C` | merah Tridatu — CTA, active nav, brand |
| `#1A1A1A` | hitam — teks utama |
| `#525252` | abu-abu — teks sekunder |

Aturan praktis: kalau lagi nyentuh chrome AppShell atau tabel admin, **pakai hex langsung** biar match. Di luar itu, **pakai token**.

Dark mode udah ada di `.dark` di [globals.css](app/globals.css) — semua token punya pasangan. Tapi toggle UI belum ada, jadi kalau bikin halaman baru, pastiin pakai token semantik (bukan hex) supaya nanti tinggal flip kelas.

## Bentuk & elevasi

Radius (lihat [tailwind.config.js](tailwind.config.js)):
- `rounded` default = 0.5rem — untuk tombol kotak, input, badge.
- `rounded-md` 0.75rem — kartu kecil, panel admin.
- `rounded-lg` 1rem — kartu konten utama, modal.
- `rounded-xl` 1.5rem — hero, drawer.
- `rounded-full` — semua pill nav & avatar.

Shadow ada tiga dan **semuanya bertinta**, bukan hitam:
- `shadow-soft` — elevation default kartu.
- `shadow-line` — pengganti border 1px kalau butuh hairline halus.
- `shadow-tactile` — hover/press, kerasa "ngangkat" dikit.

Untuk tombol primary, AppShell pakai glow merah bata inline:

```jsx
className="shadow-[0_10px_24px_rgba(139,31,24,0.16)]"
```

Reuse persis itu kalau bikin CTA primary baru. Jangan bikin shadow ke-empat.

## Gerakan

Cepat dan halus. Standar di [globals.css](app/globals.css):

- `.transition-within` — 180ms ease untuk border/bg/shadow. Pasang di kartu yang ada hover state.
- `.focus-ring` + `:focus-visible` — outline 2px pakai `--ring`. Wajib di custom button & link biar accessible.
- `@media (prefers-reduced-motion: reduce)` udah dihandle global — animasi murni dekoratif, **nggak boleh** jadi syarat fungsi.

Animasi canvas (`.correct-stroke`, `.wrong-stroke-fade`, `.hint-stroke`, `.animate-draw`, `.svg-tool-test-stroke`) khusus buat halaman latihan goresan. Jangan dipakai untuk dekorasi marketing — visual itu sudah punya makna "betul/salah" di sistem.

Keyframe yang tersedia: `stroke-fade`, `draw-stroke`, `svg-tool-draw`, `float`.

## Tekstur

Tiga utility yang kepake:
- `.texture` — gradient krem + serat lontar horizontal. Bagus buat hero atau section break.
- `.ornament` — strip vertikal tipis. Cocok jadi band di atas heading section.
- `.screen-grid` — grid 44px tinta brick. Dipakai di belakang area pemain via `<AnimatedGridBackground gridSize={44} />`. Kalau bikin layout hero baru, ikutin modul 44px supaya garis grid pas sama konten.

Buat SVG diagram, ada `.screen-grid-svg line` yang udah pre-styled.

## Pola komponen

Ini yang udah ada di kode. Pakai ulang, jangan bikin paralel:

**Pill nav (header)**
```
rounded-full px-4 py-2 text-sm font-bold
```
Aktif: brick + glow merah. Inactive: transparent → hover `bg-white/70 text-[#8B1F18]`.

**Sidebar item (admin)**
```
rounded px-3 min-h-10 text-sm font-bold
```
Pakai icon tile 28×28. Aktif: brick fill + tile `bg-white/15` putih.

**Eyebrow chip**
```
rounded-full border border-[#2A2520]/10 bg-white/70 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#8B1F18]
```
Selalu ada ikon `lucide-react` di depan (`Sparkles`, `ShieldCheck`, dst).

**Avatar**
```
grid place-items-center rounded-full bg-[#8B1F18] text-white font-black
```
40px di header, 28–32px inline. Inisial generate pakai helper `initials(name, email)` di AppShell — jangan reimplement.

**Kartu glassy (area pemain)**
```
bg-white/70 border border-[#2A2520]/10 shadow-[0_12px_28px_rgba(42,37,32,0.06)] backdrop-blur
```
Background krem + grid tembus dari belakang, itu efek yang kita mau.

**Container halaman**
```
mx-auto max-w-[1180px] px-4 sm:px-6
```
Untuk halaman admin, layout udah reserve `lg:pl-[17rem]` untuk sidebar fixed — bungkus konten di dalam itu.

## Ikon

`lucide-react` saja. Inline `h-4 w-4`, standalone `h-5 w-5`. Jangan campur Heroicons, Feather, atau emoji sebagai ikon UI — itu pelan-pelan bikin gaya pecah. Emoji boleh di copy editorial (mis. "🎉 Selamat datang"), bukan sebagai pengganti ikon fungsional.

## Aksara Bali itu konten, bukan ornamen

Setiap glyph Bali yang muncul harus dibungkus `font-bali`. Jangan render glyph statis sebagai gambar latar atau watermark dekoratif besar — bagi audiens utama kita (siswa Bali), aksara punya bobot. Salah render = salah ajar. Kalau butuh ornamen visual, pakai `.ornament` atau `.texture`, bukan karakter aksara acak.

## Kalau bingung

Buka [PRD.md](PRD.md) bagian persona. Mayoritas user kita anak SD–SMP pakai HP Android orangtua. Itu yang menentukan ukuran tap target (`min-h-10` minimum), kontras, dan kepadatan layout. Kalau desain kelihatan "elegan tapi sempit", biasanya gagal di tangan persona 1.
