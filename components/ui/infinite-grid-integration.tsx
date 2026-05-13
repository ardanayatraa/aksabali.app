"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Facebook, Instagram, Mail, Youtube } from "lucide-react";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";
import { AnimatedDaHero } from "@/components/ui/AnimatedDaHero";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PromoBanner } from "@/components/PromoBanner";
import { promoConfig, promoSlots } from "@/lib/promo-data";
import { CP, glyph } from "@/lib/aksara-codepoints";

const PROMO_DISMISS_KEY = "promo-only25k-dismissed";

const promoSubscribers = new Set<() => void>();
function subscribePromo(cb: () => void) {
  promoSubscribers.add(cb);
  return () => {
    promoSubscribers.delete(cb);
  };
}
function getPromoSnapshot() {
  return !document.documentElement.classList.contains("promo-dismissed");
}
function getPromoServerSnapshot() {
  return true;
}
function dismissPromoGlobal() {
  document.documentElement.classList.add("promo-dismissed");
  try {
    window.localStorage.setItem(PROMO_DISMISS_KEY, "1");
  } catch {}
  promoSubscribers.forEach((cb) => cb());
}

// Tile decorative — 16 aksara wianjana, di-construct dari codepoint.
const aksaraTiles = [
  glyph(CP.ha), glyph(CP.na), glyph(CP.ca), glyph(CP.ra),
  glyph(CP.ka), glyph(CP.da), glyph(CP.ta), glyph(CP.sa),
  glyph(CP.wa), glyph(CP.la), glyph(CP.ma), glyph(CP.ga),
  glyph(CP.ba), glyph(CP.nga), glyph(CP.pa), glyph(CP.ja)
];

const freeFeatures = [
  ["5 aksara dasar", true],
  ["Ikut game kelas sebagai pemain", true],
  ["Progres dasar tersimpan", true],
  ["32 aksara lengkap", false],
  ["Bikin room game sendiri", false],
  ["Statistik harian", false]
] as const;

const premiumFeatures = [
  "32 aksara dasar lengkap",
  "Bikin room game tanpa batas",
  "Statistik latihan tersimpan",
  "Sinkron web ↔ Android",
  "Update gratis, selamanya",
  "Tanpa langganan bulanan"
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
        {glyph(CP.akara)}
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

export default function Component() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof landingNavItems)[number]["id"]>("kenapa");
  const promoVisible = useSyncExternalStore(subscribePromo, getPromoSnapshot, getPromoServerSnapshot);

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

  function goToLogin() {
    window.location.href = "/login";
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-lontar text-ink">
      <AnimatedGridBackground className="fixed z-0 opacity-90" gridSize={44} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--tertiary)/0.06),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.06),transparent_42%)]" />

      {promoVisible && (
        <div className="promo-banner-wrap fixed inset-x-0 top-0 z-50">
          <PromoBanner
            claimed={promoSlots.length}
            total={promoConfig.total}
            onDismiss={dismissPromoGlobal}
          />
        </div>
      )}
      <nav
        className={`promo-nav-with-banner fixed inset-x-0 z-40 border-b transition-all duration-500 ease-out ${
          promoVisible ? "top-11 sm:top-10" : "top-0"
        } ${
          isScrolled
            ? "border-ink/[0.08] bg-lontar/75 shadow-[0_12px_35px_hsl(var(--foreground)/0.08)] backdrop-blur-2xl"
            : "border-ink/[0.06] bg-lontar/90 backdrop-blur-md"
        }`}
      >
        <div className={`mx-auto flex max-w-[1180px] items-center justify-between px-6 transition-all duration-500 ${isScrolled ? "py-3.5" : "py-6"}`}>
          <BrandMark />
          <div className="hidden items-center gap-6 md:flex">
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
            <ThemeToggle
              showLabel={false}
              className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-rice/70 text-muted-foreground transition hover:border-brick/30 hover:text-brick"
            />
            <button
              type="button"
              onClick={goToLogin}
              className="rounded-lg bg-brick px-[18px] py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-brick/90"
            >
              Mulai
            </button>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle
              showLabel={false}
              className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-rice/70 text-muted-foreground transition hover:border-brick/30 hover:text-brick"
            />
            <button
              type="button"
              onClick={goToLogin}
              className="rounded-lg bg-brick px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-brick/90"
            >
              Mulai
            </button>
          </div>
        </div>
      </nav>

      <main className={`promo-main-with-banner relative z-10 ${promoVisible ? "pt-32 sm:pt-32" : "pt-24"}`}>
        <section className="mx-auto w-screen max-w-[1180px] overflow-hidden px-6 py-14 sm:py-20 lg:py-24">
          <div className="grid min-w-0 items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div className="min-w-0 w-full max-w-[342px] sm:max-w-[560px] lg:w-auto lg:max-w-none">
              <p className="mb-8 inline-block border-b border-brick/20 pb-2 text-[13px] font-medium tracking-[0.05em] text-brick">
                Aksa Bali App
              </p>
              <h1 className="font-display text-[clamp(44px,6.5vw,80px)] font-normal leading-[0.98] tracking-[-0.025em] text-ink">
                Aksa Bali. <br />
                <em className="font-medium italic text-brick">Goresan indah, mengingat sejarah.</em>
              </h1>
              <p className="mt-6 max-w-[460px] border-l-2 border-brick/40 pl-4 font-display text-lg italic leading-snug text-brick/85 sm:text-xl">
                Ngiring ngajegang budaya Bali — nyurat aksara Bali.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-brick px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-brick/90 hover:shadow-[0_6px_16px_hsl(var(--primary)/0.25)]"
                >
                  Mulai belajar
                </button>
                <a
                  href="#aplikasi"
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-ink/[0.12] bg-rice px-6 py-3.5 text-[15px] font-medium text-ink transition hover:border-brick hover:text-brick"
                >
                  Lihat aplikasinya
                </a>
              </div>
            </div>

            <div className="relative order-first min-w-0 w-full max-w-[342px] sm:max-w-[480px] lg:w-auto lg:order-none">
              <div className="relative mx-auto flex aspect-square w-full max-w-[342px] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--secondary)))] shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_24px_60px_hsl(var(--primary)/0.10),inset_0_1px_0_hsl(0_0%_100%/0.5)] sm:max-w-[480px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_75%_75%,hsl(var(--tertiary)/0.08),transparent_55%)]" />
                <div className="relative z-10 h-[68%] w-[68%] animate-[float_6s_ease-in-out_infinite]">
                  <AnimatedDaHero />
                </div>
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
              Aksara Bali bukan sekadar pelajaran — <em className="italic text-brick">itu warisan.</em>
            </h2>
            <div className="mt-9 space-y-6 text-[17px] leading-[1.75] text-muted-foreground">
              <p>
                Aksara Bali masih ada di pelajaran sekolah dan papan nama desa.
                Yang luput cuma kebiasaan menulisnya.
              </p>
              <p>Wajar. Sekolah padat, tangan jarang pegang buku tulis aksara lagi.</p>
              <p>
                Aksa Bali tempat latihan ringan — untuk siswa, guru, atau siapa pun
                yang mau tetap akrab dengan aksaranya.
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
                32 aksara dasar.{" "}
                <em className="italic text-brick">Mulai dari mana saja.</em>
              </h2>
              <p className="mt-6 text-[17px] leading-[1.7] text-muted-foreground">
                Wianjana, swara, angka — pilih yang mau kamu kuasai duluan.
                Bisa solo, bisa rame-rame.
              </p>
              <p className="mt-4 text-[17px] leading-[1.7] text-muted-foreground">
                Tinggal konsisten.
              </p>
              <ul className="mt-7 divide-y divide-ink/[0.06] border-t border-ink/10 pt-3">
                {[
                  ["Aksara wianjana", "18"],
                  ["Pangangge suara", "6"],
                  ["Cara belajar", "Solo & bareng"],
                  ["Bahasa antarmuka", "Indonesia"]
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between py-3.5 text-base text-ink">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-display font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid min-w-0 grid-cols-4 gap-3 rounded-[20px] border border-ink/[0.08] bg-rice p-6 sm:p-8">
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

        <section
          id="aplikasi"
          className="relative overflow-hidden bg-[#1A1A1A] px-6 py-20 text-white dark:bg-[#2A1414] dark:ring-1 dark:ring-inset dark:ring-[#B91C1C]/25 lg:py-24"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(185,28,28,0.32),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(185,28,28,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_75%_30%,rgba(220,38,38,0.45),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(220,38,38,0.28),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#E94545] dark:text-[#FCA5A5]">
                Aplikasi mobile
              </p>
              <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-normal leading-[1.15] tracking-[-0.02em] text-white">
                Di mana saja. <em className="italic text-[#E94545] dark:text-[#FCA5A5]">Kapan kamu mau.</em>
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-white/70">
                Sela waktu — antara kelas, di angkutan, sebelum tidur.
                Web + Android, satu akun.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="relative inline-flex min-h-16 items-center gap-3 overflow-hidden rounded-xl bg-white px-5 py-3 text-left text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-white/90 dark:shadow-[0_8px_24px_rgba(185,28,28,0.45)]"
                >
                  <span className="grid h-7 w-7 place-items-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635Zm3.198-3.198 2.486 1.44a1 1 0 0 1 0 1.732l-2.486 1.44L15.069 12l2.628-2.491ZM5.864 2.658 16.802 8.99l-2.302 2.302-8.636-8.634Z" />
                    </svg>
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[0.7rem] opacity-70">Download di</span>
                    <span className="font-display text-base font-semibold">Google Play</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="mx-auto aspect-[9/19] w-full max-w-[320px] rounded-[36px] border border-white/10 bg-[#0A0A0A] p-3 shadow-[0_40px_80px_rgba(185,28,28,0.30)] dark:border-white/15 dark:shadow-[0_40px_90px_rgba(220,38,38,0.55)]">
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#B91C1C,#0A0A0A)] px-5 py-10 text-center dark:bg-[linear-gradient(135deg,#DC2626,#1A0A0A)]">
                <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-[#0A0A0A]" />
                <div className="bali-text mb-6 text-[130px] leading-none text-white drop-shadow">
                  {glyph(CP.ba)}
                </div>
                <div className="text-white">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.15em] opacity-70">
                    Aksara Wianjana
                  </div>
                  <div className="mb-4 font-display text-2xl font-medium">Ba</div>
                  <div className="mb-3 h-1 w-52 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[65%] rounded-full bg-white" />
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
              Coba dulu gratisnya. <em className="italic text-brick">Upgrade kalau cocok.</em>
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-muted-foreground">
              Materi dasar gratis. Premium sekali bayar, dipake selamanya.
            </p>
          </div>

          <div className="mx-auto grid max-w-[880px] gap-6 lg:grid-cols-2">
            <div className="rounded-[20px] border border-ink/[0.08] bg-rice px-7 py-9 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_hsl(var(--foreground)/0.08)] sm:px-9">
              <div className="font-display text-2xl font-semibold tracking-[-0.01em]">Gratis</div>
              <p className="mt-2 text-sm text-muted-foreground">Mulai tanpa kartu kredit</p>
              <div className="mt-7 flex items-baseline gap-2">
                <span className="font-display text-2xl text-muted-foreground">Rp</span>
                <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">0</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Berlaku selamanya</p>
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
                onClick={goToLogin}
                className="mt-8 w-full rounded-[10px] border border-ink/15 px-4 py-3.5 text-sm font-semibold transition hover:border-brick hover:text-brick"
              >
                Daftar gratis
              </button>
            </div>

            <div className="relative rounded-[20px] border-2 border-brick bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--surface-container-lowest)))] px-7 py-9 shadow-[0_20px_50px_hsl(var(--primary)/0.12)] transition hover:-translate-y-1 sm:px-9">
              <div className="absolute -top-3 left-9 rounded-full bg-brick px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                Paling Populer
              </div>
              <div className="font-display text-2xl font-semibold tracking-[-0.01em]">Premium</div>
              <p className="mt-2 text-sm text-muted-foreground">Akses penuh, sekali bayar</p>
              <div className="mt-6 text-sm font-semibold text-muted-foreground/70 line-through">
                Rp 250rb
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl text-muted-foreground">Rp</span>
                <span className="font-display text-6xl font-medium leading-none tracking-[-0.03em]">49</span>
                <span className="font-display text-2xl text-muted-foreground">rb</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Sekali bayar, dipake selamanya</p>
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
                onClick={goToLogin}
                className="mt-8 w-full rounded-[10px] bg-brick px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-brick/90"
              >
                Ambil Premium
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Harga promo buat pengguna awal. Premium langsung aktif setelah bayar.
          </p>
        </section>

        <section id="tentang" className="mx-auto max-w-[1180px] px-6 py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
                Tentang
              </p>
              <h2 className="font-display text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-[-0.02em]">
                Belajar aksara Bali, <em className="italic text-brick">tanpa ribet.</em>
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
                Aksa Bali fokus ke satu hal: bikin latihan menulis aksara Bali jadi
                lebih sering dan lebih nempel.
              </p>
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ikuti perjalanan Aksa Bali
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    aria-label="YouTube Aksa Bali"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-rice text-ink transition hover:border-brick hover:text-brick"
                  >
                    <Youtube className="h-5 w-5" strokeWidth={1.8} />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram Aksa Bali"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-rice text-ink transition hover:border-brick hover:text-brick"
                  >
                    <Instagram className="h-5 w-5" strokeWidth={1.8} />
                  </a>
                  <a
                    href="#"
                    aria-label="Facebook Aksa Bali"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-rice text-ink transition hover:border-brick hover:text-brick"
                  >
                    <Facebook className="h-5 w-5" strokeWidth={1.8} />
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[20px] border border-ink/[0.08] bg-rice/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                  Kolaborasi
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                  Punya ide, mau kontribusi materi, atau ajak kelasmu coba duluan?
                  Tinggal email ke{" "}
                  <a
                    href="mailto:hi@aksabali.app"
                    className="font-semibold text-brick underline-offset-4 hover:underline"
                  >
                    hi@aksabali.app
                  </a>
                  .
                </p>
              </div>

              <div className="rounded-[20px] border-2 border-brick/30 bg-brick/5 p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brick">
                  ⚠ Situs resmi
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-ink">
                  Aksa Bali resmi <strong className="font-extrabold">hanya</strong> di{" "}
                  <a
                    href="https://aksabali.app"
                    className="font-extrabold text-brick underline decoration-2 underline-offset-4"
                  >
                    aksabali.app
                  </a>
                  . Hati-hati dengan tiruan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-ink/[0.06] px-6 py-10">
          <p className="mx-auto max-w-[680px] text-center text-sm text-muted-foreground">
            Tips latihan tiap minggu —{" "}
            <a
              href="https://tiktok.com/@aksabali"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brick underline-offset-4 hover:underline"
            >
              ikuti di TikTok
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink/[0.08] px-6 py-10">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Aksa Bali · <strong className="font-semibold text-ink">Belajar nyurat aksara Bali</strong> · Yang resmi hanya{" "}
            <a href="https://aksabali.app" className="font-bold text-brick hover:underline">
              aksabali.app
            </a>
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
    </div>
  );
}
