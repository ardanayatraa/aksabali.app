import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-primary hover:underline">
          Kembali
        </Link>
        <p className="mt-10 text-sm font-black uppercase tracking-[0.2em] text-primary">
          Aksa Bali
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold">
          Ketentuan Penggunaan
        </h1>
        <div className="mt-6 space-y-5 leading-8 text-muted-foreground">
          <p>
            Aksa Bali digunakan untuk belajar nyurat aksara Bali dan aktivitas kelas. Pengguna bertanggung jawab menjaga akses akunnya sendiri.
          </p>
          <p>
            Konten, hasil latihan, dan fitur game dapat berubah mengikuti pengembangan produk dan kebutuhan kurikulum.
          </p>
          <p>
            Akses premium dan voucher mengikuti status transaksi atau aktivasi yang tercatat di sistem.
          </p>
        </div>
      </section>
    </main>
  );
}
