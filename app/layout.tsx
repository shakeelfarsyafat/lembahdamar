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
  openGraph: {
    title: "Lembah Damar Outdoor - Penyewaan Alat Camping & Outdoor",
    description:
      "Perlengkapan sewa camping terlengkap & terawat. Tenda, sleeping bag, kompor, matras, dan perlengkapan mendaki gunung.",
    url: "https://lembahdamaroutdoor.com",
    siteName: "Lembah Damar Outdoor",
    locale: "id_ID",
    type: "website",
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
