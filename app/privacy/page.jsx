import Link from "next/link";

export default function PrivacyPage() {
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
          Kebijakan Privasi
        </h1>
        <div className="mt-6 space-y-5 leading-8 text-muted-foreground">
          <p>
            Aksa Bali menyimpan data akun, progres latihan, hasil stroke, dan aktivitas kelas untuk menjalankan pengalaman belajar.
          </p>
          <p>
            Data pembayaran diproses melalui penyedia pembayaran yang terhubung. Aplikasi hanya menyimpan status transaksi yang diperlukan untuk aktivasi akses.
          </p>
          <p>
            Pengguna dapat meminta koreksi atau penghapusan data akun melalui kontak resmi Aksa Bali.
          </p>
        </div>
      </section>
    </main>
  );
}
