import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Lembah Damar Outdoor - Rental Alat Camping & Outdoor Terbaik",
    template: "%s | Lembah Damar Outdoor",
  },
  description:
    "Sewa tenda dome, carrier, sleeping bag, kompor, dan perlengkapan outdoor berkualitas di Lembah Damar Outdoor. Proses mudah, stok terjamin, & respon cepat via WhatsApp.",
  keywords: [
    "sewa alat camping",
    "rental outdoor bogor",
    "sewa tenda dome",
    "rental alat gunung",
    "sewa carrier deuter",
    "lembah damar outdoor",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/logo-hero.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
    shortcut: ["/logo-hero.png"],
  },
  openGraph: {
    title: "Lembah Damar Outdoor - Penyewaan Alat Camping & Outdoor",
    description:
      "Perlengkapan sewa camping terlengkap & terawat di Lembah Damar Outdoor. Tenda dome, sleeping bag, kompor, matras, dan perlengkapan mendaki gunung.",
    url: "https://lembahdamaroutdoor.com",
    siteName: "Lembah Damar Outdoor",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo-hero.png",
        width: 1200,
        height: 630,
        alt: "DAMARRENT - Lembah Damar Outdoor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lembah Damar Outdoor - Rental Alat Camping",
    description: "Sewa alat camping dan outdoor terlengkap di Bogor. Kualitas terawat & proses cepat.",
    images: ["/logo-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${montserrat.variable} font-sans`}>
      <body className="min-h-screen bg-[#F7F5F0] text-[#1C1C1C] antialiased flex flex-col font-sans">
        {children}
        <FloatingCartBar />
      </body>
    </html>
  );
}
