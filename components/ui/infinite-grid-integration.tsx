"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Mail, X } from "lucide-react";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";

const aksaraTiles = [
  "ᬳ",
  "ᬦ",
  "ᬘ",
  "ᬭ",
  "ᬓ",
  "ᬤ",
  "ᬢ",
  "ᬲ",
  "ᬯ",
  "ᬮ",
  "ᬫ",
  "ᬕ",
  "ᬩ",
  "ᬗ",
  "ᬧ",
  "ᬚ"
];

const freeFeatures = [
  ["5 aksara dasar buat latihan", true],
  ["Main bareng teman sebagai pemain", true],
  ["Progres dasar tersimpan", true],
  ["Akses 32 aksara lengkap", false],
  ["Bikin room game sendiri", false],
  ["Statistik latihan harian", false]
] as const;

const premiumFeatures = [
  "Semua 32 aksara dasar, lengkap",
  "Bikin room game sendiri tanpa batas",
  "Statistik latihan harian",
  "Update fitur baru gratis selamanya",
  "Sertifikat selesai per level",
  "Support langsung dari tim"
];

const landingNavItems = [
  { href: "#kenapa", label: "Kenapa", id: "kenapa" },
  { href: "#aplikasi", label: "Aplikasi", id: "aplikasi" },
  { href: "#harga", label: "Harga", id: "harga" },
  { href: "#tentang", label: "Tentang", id: "tentang" }
] as const;

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3 text-brick">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brick font-display text-sm font-black text-primary-foreground">
        ᬅ
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[1.4rem] font-semibold tracking-[-0.02em]">
          Aksa Bali
        </span>
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brick/80">
          Aksabali App
        </span>
      </span>
    </Link>
  );
}

function StoreButton({
  type,
  label
}: {
  type: "play" | "apple";
  label: string;
}) {
  return (
    <button
      type="button"
      className="relative inline-flex min-h-16 items-center gap-3 overflow-hidden rounded-xl bg-ink px-5 py-3 text-left text-primary-foreground shadow-[0_8px_20px_hsl(var(--foreground)/0.15)] transition hover:-translate-y-0.5 hover:bg-muted-foreground"
    >
      <span className="grid h-7 w-7 place-items-center">
        {type === "play" ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635Zm3.198-3.198 2.486 1.44a1 1 0 0 1 0 1.732l-2.486 1.44L15.069 12l2.628-2.491ZM5.864 2.658 16.802 8.99l-2.302 2.302-8.636-8.634Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
          </svg>
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.7rem] opacity-80">Download di</span>
        <span className="font-display text-base font-semibold">{label}</span>
      </span>
    </button>
  );
}

function SignupModal({
  open,
  submitted,
  onClose,
  onSubmit
}: {
  open: boolean;
  submitted: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-lontar p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-ink transition hover:bg-ink/14"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#4A7C59] text-primary-foreground">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-ink">
              Akun siap dibuat.
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Lanjutkan pendaftaran untuk menyimpan progres latihanmu.
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-ink">
              Buat akun
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Isi data singkat, lalu lanjut ke halaman daftar Aksa Bali.
            </p>
            <form onSubmit={onSubmit} className="mt-6 grid gap-3">
              <input
                name="name"
                required
                placeholder="Nama kamu"
                className="h-12 rounded-[10px] border border-ink/15 bg-white px-4 text-sm outline-none transition focus:border-brick"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="email@kamu.com"
                className="h-12 rounded-[10px] border border-ink/15 bg-white px-4 text-sm outline-none transition focus:border-brick"
              />
              <button
                type="submit"
                className="mt-1 h-12 rounded-[10px] bg-brick text-sm font-bold text-white transition hover:bg-brick/90"
              >
                Lanjut daftar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Component() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof landingNavItems)[number]["id"]>("kenapa");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };

    document.body.style.overflow = modalOpen ? "hidden" : "";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      setIsScrolled(window.scrollY > 16);

      for (const item of landingNavItems) {
        const section = document.getElementById(item.id);
        if (!section) continue;

        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < bottom) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  function openModal() {
    setSubmitted(false);
    setModalOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entry = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("aksabali-signup-intent", JSON.stringify(entry));
    const params = new URLSearchParams({ email: entry.email, name: entry.name });
    window.location.href = `/register?${params.toString()}`;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-lontar text-ink">
      <AnimatedGridBackground className="fixed z-0 opacity-90" gridSize={44} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--tertiary)/0.06),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.06),transparent_42%)]" />

      <nav
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-500 ease-out ${
          isScrolled
            ? "border-ink/[0.08] bg-lontar/75 shadow-[0_12px_35px_hsl(var(--foreground)/0.08)] backdrop-blur-2xl"
            : "border-ink/[0.06] bg-lontar/90 backdrop-blur-md"
        }`}
      >
        <div className={`mx-auto flex max-w-[1180px] items-center justify-between px-6 transition-all duration-500 ${isScrolled ? "py-3.5" : "py-6"}`}>
          <BrandMark />
          <div className="hidden items-center gap-8 md:flex">
            {landingNavItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`text-sm font-medium transition ${
                  activeSection === item.id ? "text-brick" : "text-muted-foreground hover:text-brick"
                }`}
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={openModal}
              className="rounded-lg bg-brick px-[18px] py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-brick/90"
            >
              Mulai
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        <section className="mx-auto w-screen max-w-[1180px] overflow-hidden px-6 py-14 sm:py-20 lg:py-24">
          <div className="grid min-w-0 items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div className="min-w-0 w-full max-w-[342px] sm:max-w-[560px] lg:w-auto lg:max-w-none">
              <p className="mb-8 inline-block border-b border-brick/20 pb-2 text-[13px] font-medium tracking-[0.05em] text-brick">
                Aksa Bali App
              </p>
              <h1 className="font-display text-[clamp(44px,6.5vw,80px)] font-normal leading-[0.98] tracking-[-0.025em] text-ink">
                Belajar nyurat <br />
                <em className="font-medium italic text-brick">aksara Bali.</em>
              </h1>
              <p className="mt-7 max-w-[460px] text-lg leading-[1.65] text-muted-foreground">
                Banyak anak muda Bali sekarang sudah jarang nyurat aksara. Aksa Bali
                jadi tempat latihan bareng: sambil main, sambil belajar.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-brick px-6 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brick/90 hover:shadow-[0_6px_16px_hsl(var(--primary)/0.25)]"
                >
                  Mulai belajar
                </button>
                <a
                  href="#aplikasi"
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-ink/12 bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition hover:border-brick hover:text-brick"
                >
                  Lihat aplikasinya
                </a>
              </div>
            </div>

            <div className="relative order-first min-w-0 w-full max-w-[342px] sm:max-w-[480px] lg:w-auto lg:order-none">
              <div className="relative mx-auto flex aspect-square w-full max-w-[342px] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--secondary)))] shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_24px_60px_hsl(var(--primary)/0.10),inset_0_1px_0_hsl(0_0%_100%/0.5)] sm:max-w-[480px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_75%_75%,hsl(var(--tertiary)/0.08),transparent_55%)]" />
                <span className="absolute left-7 top-6 font-display text-[13px] tracking-[0.1em] text-muted-foreground/50">
                  Bali
                </span>
                <span className="bali-text relative z-10 animate-[float_6s_ease-in-out_infinite] text-[clamp(160px,28vw,290px)] leading-none text-brick drop-shadow">
                  ᬩ
                </span>
                <span className="absolute bottom-6 right-7 font-display text-[13px] tracking-[0.1em] text-muted-foreground/50">
                  Aksara
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="kenapa" className="relative mx-auto w-screen max-w-[1180px] overflow-hidden px-6 py-20 lg:py-24">
          <div className="absolute left-1/2 top-0 h-px w-16 -translate-x-1/2 bg-saffron/50" />
          <div className="mx-auto w-full max-w-[342px] sm:max-w-[680px]">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
              Kenapa
            </p>
            <h2 className="text-center font-display text-[clamp(30px,4.5vw,46px)] font-normal leading-tight tracking-[-0.02em]">
              Aksara Bali itu <em className="italic text-brick">bukan cuma pelajaran</em> - itu warisan.
            </h2>
            <div className="mt-9 space-y-6 text-[17px] leading-[1.75] text-muted-foreground">
              <p>
                Generasi orang tua kita tumbuh bersama aksara ini. Ditulis di kelas,
                dipakai di lontar, dan dilihat di banyak tempat. Sekarang, banyak
                yang mulai lupa cara menulisnya.
              </p>
              <p>
                Bukan karena tidak peduli. Seringnya karena cara belajarnya kaku,
                tools-nya tertinggal, dan tidak ada teman latihan setiap hari.
              </p>
              <p>
                Aksa Bali dibuat untuk siswa Bali, guru, dan siapa pun yang ingin
                menjaga warisan ini dengan cara yang lebih dekat dengan keseharian.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-screen max-w-[1180px] overflow-hidden px-6 py-20 lg:py-24">
          <div className="grid min-w-0 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="min-w-0">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
                Isi aplikasi
              </p>
              <h2 className="font-display text-[clamp(28px,4vw,42px)] font-normal leading-[1.15] tracking-[-0.02em]">
                Latihan nyurat 32 aksara dasar -{" "}
                <em className="italic text-brick">main bareng teman.</em>
              </h2>
              <p className="mt-6 text-[17px] leading-[1.7] text-muted-foreground">
                Mulai dari wianjana sampai aksara suara. Belajar satu per satu,
                latihan solo, atau ajak teman sekelas main bareng.
              </p>
              <p className="mt-4 text-[17px] leading-[1.7] text-muted-foreground">
                Yang penting: tidak kaku, tidak membosankan, dan benar-benar nempel.
              </p>
              <ul className="mt-7 divide-y divide-ink/[0.06] border-t border-ink/10 pt-3">
                {[
                  ["Aksara wianjana", "18"],
                  ["Aksara suara", "14"],
                  ["Cara belajar", "Solo & bareng"],
                  ["Bahasa", "Indonesia & Bali"]
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between py-3.5 text-base text-ink">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-display font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid min-w-0 grid-cols-4 gap-3 rounded-[20px] border border-ink/[0.08] bg-white p-6 sm:p-8">
              {aksaraTiles.map((item) => (
                <div
                  key={item}
                  className="bali-text flex aspect-square items-center justify-center rounded-xl bg-lontar text-4xl text-brick transition hover:scale-105 hover:bg-secondary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="aplikasi" className="bg-[linear-gradient(180deg,hsl(var(--background)/0.72),hsl(var(--muted)/0.82))] px-6 py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
                Aplikasi mobile
              </p>
              <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-normal leading-[1.15] tracking-[-0.02em]">
                Latihan kapan aja, <em className="italic text-brick">di mana aja.</em>
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
                Belajar aksara Bali sambil menunggu jemputan, di sela istirahat,
                atau malam sebelum tidur. Aksa Bali siap dipakai di web, Android,
                dan iPhone.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <StoreButton type="play" label="Google Play" />
                <StoreButton type="apple" label="App Store" />
              </div>
            </div>

            <div className="mx-auto aspect-[9/19] w-full max-w-[320px] rounded-[36px] bg-ink p-3 shadow-[0_30px_60px_hsl(var(--foreground)/0.2)]">
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--foreground)))] px-5 py-10 text-center">
                <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-ink" />
                <div className="bali-text mb-6 text-[130px] leading-none text-primary-foreground drop-shadow">
                  ᬩ
                </div>
                <div className="text-white">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.15em] opacity-70">
                    Aksara Wianjana
                  </div>
                  <div className="mb-4 font-display text-2xl font-medium">Ba</div>
                  <div className="mb-3 h-1 w-52 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[65%] rounded-full bg-primary-foreground" />
                  </div>
                  <div className="text-xs opacity-65">13 dari 18 selesai</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="harga" className="mx-auto max-w-[1180px] px-6 py-20 lg:py-24">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
              Harga
            </p>
            <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-normal leading-[1.15] tracking-[-0.02em]">
              Coba dulu, baru bayar.
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-muted-foreground">
              Ada yang gratis. Ada yang bayar sekali, pakai selamanya.
            </p>
          </div>

          <div className="mx-auto grid max-w-[880px] gap-6 lg:grid-cols-2">
            <div className="rounded-[20px] border border-ink/[0.08] bg-white px-7 py-9 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_hsl(var(--foreground)/0.08)] sm:px-9">
              <div className="font-display text-2xl font-semibold tracking-[-0.01em]">Gratis</div>
              <p className="mt-2 text-sm text-muted-foreground">Buat yang mau coba dulu</p>
              <div className="mt-7 flex items-baseline gap-2">
                <span className="font-display text-2xl text-muted-foreground">Rp</span>
                <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">0</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Selamanya</p>
              <ul className="mt-7 grid gap-3 border-t border-ink/[0.08] pt-7">
                {freeFeatures.map(([feature, active]) => (
                  <li key={feature} className={`flex gap-3 text-sm ${active ? "text-ink" : "text-muted-foreground/55"}`}>
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-brick" : "text-muted-foreground/35"}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={openModal}
                className="mt-8 w-full rounded-[10px] border border-ink/15 px-4 py-3.5 text-sm font-semibold transition hover:border-brick hover:text-brick"
              >
                Daftar gratis
              </button>
            </div>

            <div className="relative rounded-[20px] border-2 border-brick bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--surface-container-lowest)))] px-7 py-9 shadow-[0_20px_50px_hsl(var(--primary)/0.12)] transition hover:-translate-y-1 sm:px-9">
              <div className="absolute -top-3 left-9 rounded-full bg-brick px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                Paling Populer
              </div>
              <div className="font-display text-2xl font-semibold tracking-[-0.01em]">Premium</div>
              <p className="mt-2 text-sm text-muted-foreground">Bayar sekali, pakai selamanya</p>
              <div className="mt-6 text-sm font-semibold text-muted-foreground/70 line-through">
                Rp 250rb
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl text-muted-foreground">Rp</span>
                <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">49</span>
                <span className="font-display text-2xl text-muted-foreground">rb</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Sekali bayar, lifetime</p>
              <ul className="mt-7 grid gap-3 border-t border-ink/[0.08] pt-7">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brick" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={openModal}
                className="mt-8 w-full rounded-[10px] bg-brick px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brick/90"
              >
                Ambil Premium
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Harga promo aktif untuk pengguna awal. Akses aktif setelah akun dibuat.
          </p>
        </section>

        <section id="tentang" className="mx-auto max-w-[1180px] px-6 py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
                Tentang
              </p>
              <h2 className="font-display text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-[-0.02em]">
                Dibuat oleh <em className="italic text-brick">Ardana Yatra</em>.
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
                Aksa Bali berakar dari skripsi Ardana di STIKOM Bali — risetnya mengangkat
                pembelajaran Aksara Bali dengan pendekatan digital. Versi skripsi itu sekarang
                dikembangkan ulang dan diperluas supaya bisa dipakai luas oleh masyarakat: siswa,
                guru, dan siapa pun yang ingin melestarikan aksara.
              </p>
              <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
                Tools-nya hadir di web untuk kelas dan persiapan lomba, plus aplikasi Android untuk
                latihan harian — dengan engine stroke recognition yang dibangun dari nol.
              </p>
              <a
                href="https://spinter.stikom-bali.ac.id/index.php/spinter/article/view/242/207"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 border-b border-brick/30 pb-1 text-sm font-medium text-brick transition hover:border-brick"
              >
                Baca publikasi awal di SPINTER STIKOM Bali
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[20px] border border-ink/[0.08] bg-rice/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                  Latar belakang
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                  Riset skripsi mendalami bagaimana siswa Bali belajar nyurat aksara dan apa saja
                  hambatan tools digital yang ada. Insight itu jadi fondasi desain Aksa Bali sekarang.
                </p>
              </div>
              <div className="rounded-[20px] border border-ink/[0.08] bg-rice/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                  Yang dikembangkan ulang
                </p>
                <ul className="mt-3 grid gap-2 text-[15px] leading-[1.65] text-muted-foreground">
                  <li>· Engine stroke recognition (bentuk, arah, posisi, panjang, halus)</li>
                  <li>· Mode kelas Kahoot-style untuk guru</li>
                  <li>· Aplikasi mobile dengan animasi cara goresan</li>
                  <li>· Konten 32 aksara dasar + ekspansi gantungan & gempelan</li>
                </ul>
              </div>
              <div className="rounded-[20px] border border-ink/[0.08] bg-rice/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                  Kolaborasi
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                  Punya masukan, mau kontribusi materi, atau ajak kelasmu jadi early adopter?{" "}
                  <a
                    href="mailto:hi@aksabali.app"
                    className="font-semibold text-brick underline-offset-4 hover:underline"
                  >
                    hi@aksabali.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-ink/[0.06] px-6 py-10">
          <p className="mx-auto max-w-[680px] text-center text-sm text-muted-foreground">
            Tips nyurat & latihan tiap minggu —{" "}
            <a
              href="https://tiktok.com/@aksabali"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brick underline-offset-4 hover:underline"
            >
              ikutin di TikTok
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink/[0.08] px-6 py-10">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Aksa Bali App - <strong className="font-semibold text-ink">Nyurat Aksara Bali</strong>
          </p>
          <div className="flex gap-6">
            <a href="https://tiktok.com/@aksabali" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-brick">
              TikTok
            </a>
            <a href="https://instagram.com/aksabali" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-brick">
              Instagram
            </a>
            <a href="mailto:hi@aksabali.app" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brick">
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>
      </footer>

      <SignupModal
        open={modalOpen}
        submitted={submitted}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
