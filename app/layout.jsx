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

const TITLE = "Aksa Bali — Belajar Nyurat Aksara Bali Online Gratis";
const DESCRIPTION =
  "Platform belajar Aksara Bali paling lengkap: latihan nyurat dengan stroke recognition, kuis anacaraka, swara, angka, kata, dan game kelas. Untuk siswa, guru, dan pelestari budaya Bali.";

export const metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Aksa Bali",
  title: {
    default: TITLE,
    template: "%s · Aksa Bali"
  },
  description: DESCRIPTION,
  keywords: [
    "aksara bali",
    "belajar aksara bali",
    "nyurat aksara bali",
    "tulisan bali",
    "aksara wianjana",
    "anacaraka",
    "pangangge suara",
    "sandangan vokal aksara bali",
    "ulu suku taleng pepet tedung",
    "angka bali",
    "bahasa bali",
    "lomba aksara bali",
    "bulan bahasa bali",
    "stroke recognition aksara bali",
    "aplikasi aksara bali",
    "aksa bali",
    "aksabali",
    "wresastra",
    "wrehasta",
    "gantungan bali",
    "tedung",
    "ulu candra",
    "aksara nusantara"
  ],
  category: "Education",
  authors: [{ name: "Ardana Yatra", url: appUrl }],
  creator: "Ardana Yatra",
  publisher: "Aksa Bali",
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Aksa Bali",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aksa Bali — Belajar Nyurat Aksara Bali"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    // Isi token verifikasi setelah daftar Google Search Console / Bing Webmaster Tools
    // google: "xxxxxxxxxxxxxxxxxxxx",
    // other: { "msvalidate.01": "xxxxxxxxxxxxxxxxxxxx" }
  },
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B91C1C"
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      url: appUrl,
      name: "Aksa Bali",
      description: DESCRIPTION,
      inLanguage: "id-ID",
      publisher: { "@id": `${appUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${appUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${appUrl}/#organization`,
      name: "Aksa Bali",
      url: appUrl,
      logo: `${appUrl}/icon.png`,
      sameAs: [
        "https://tiktok.com/@aksabali",
        "https://instagram.com/aksabali"
      ],
      founder: { "@type": "Person", name: "Ardana Yatra" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${appUrl}/#app`,
      name: "Aksa Bali",
      operatingSystem: "Web, Android",
      applicationCategory: "EducationalApplication",
      inLanguage: "id-ID",
      description: DESCRIPTION,
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "IDR"
        },
        {
          "@type": "Offer",
          name: "Premium Lifetime",
          price: "49000",
          priceCurrency: "IDR"
        }
      ],
      author: { "@id": `${appUrl}/#organization` },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1"
      }
    },
    {
      "@type": "EducationalOccupationalProgram",
      "@id": `${appUrl}/#program`,
      name: "Belajar Nyurat Aksara Bali",
      description:
        "Program pembelajaran interaktif untuk Aksara Bali: wianjana, swara, angka, gantungan, dan kombinasi suku kata.",
      educationalProgramMode: "online",
      provider: { "@id": `${appUrl}/#organization` },
      inLanguage: "id-ID"
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="geo.region" content="ID-BA" />
        <meta name="geo.placename" content="Bali, Indonesia" />
        <meta name="DC.language" content="id-ID" />
        <meta httpEquiv="content-language" content="id-ID" />
        {/* Theme + promo banner bootstrap. File external supaya tidak trigger
            "Encountered a script tag while rendering React component" di React 19. */}
        <script src="/theme-init.js" async={false} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${epilogue.variable} ${lexend.variable}`}>{children}</body>
    </html>
  );
}
