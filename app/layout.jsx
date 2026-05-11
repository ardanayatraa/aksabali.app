import "./globals.css";
import { Fraunces, Outfit } from "next/font/google";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aksabali.app";

const epilogue = Fraunces({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap"
});

const lexend = Outfit({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap"
});

export const metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Aksa Bali",
  title: {
    default: "Aksa Bali App",
    template: "%s | Aksa Bali"
  },
  description: "Aplikasi belajar nyurat aksara Bali untuk latihan harian, kelas, dan persiapan lomba.",
  keywords: [
    "Aksa Bali",
    "Aksara Bali",
    "belajar aksara bali",
    "nyurat aksara bali",
    "Bahasa Bali",
    "lomba aksara bali"
  ],
  authors: [{ name: "Aksa Bali" }],
  creator: "Aksa Bali",
  publisher: "Aksa Bali",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Aksa Bali",
    title: "Aksa Bali App",
    description: "Belajar nyurat aksara Bali bareng-bareng."
  },
  twitter: {
    card: "summary_large_image",
    title: "Aksa Bali App",
    description: "Belajar nyurat aksara Bali bareng-bareng."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${epilogue.variable} ${lexend.variable}`}>{children}</body>
    </html>
  );
}
