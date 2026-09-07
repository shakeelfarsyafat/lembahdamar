import Link from "next/link";
import { HeroNavigation } from "@/components/storefront/hero-navigation";
import { Footer } from "@/components/storefront/footer";
import { PopularProductsSlider } from "@/components/storefront/popular-products-slider";
import { HomeEducationSection } from "@/components/storefront/home-education-section";
import { PartnerSlider } from "@/components/storefront/partner-slider";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";
import { db } from "@/lib/db/prisma";
import {
  Tent,
  Bed,
  Flame,
  Utensils,
  Backpack,
  Layers,
  Lightbulb,
  Armchair,
  Compass,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, popularProducts, partners, articles] = await Promise.all([
    db.category.findMany({
      take: 8,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { isActive: true, isPopular: true },
      take: 12,
      include: {
        category: true,
        images: true,
      },
    }),
    db.partner.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
    }),
    db.article.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const getCategoryIcon = (iconName: string | null, className = "h-8 w-8 stroke-[1.5]") => {
    switch (iconName) {
      case "Tent":
        return <Tent className={className} />;
      case "Backpack":
        return <Backpack className={className} />;
      case "Bed":
        return <Bed className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Lightbulb":
        return <Lightbulb className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Armchair":
        return <Armchair className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  const steps = [
    {
      num: "01",
      title: "Pilih Perlengkapan",
      desc: "Jelajahi katalog dan pilih alat camping sesuai kebutuhan pendakian atau perkemahanmu.",
    },
    {
      num: "02",
      title: "Tentukan Tanggal Sewa",
      desc: "Pilih tanggal mulai dan tanggal kembali. Sistem akan menghitung otomatis estimasi total biaya.",
    },
    {
      num: "03",
      title: "Kirim Booking via WA",
      desc: "Klik tombol WhatsApp untuk langsung mengirim rincian sewa tanpa perlu registrasi akun.",
    },
    {
      num: "04",
      title: "Ambil & Nikmati Petualangan",
      desc: "Lakukan pembayaran DP dan ambil barang di basecamp Lembah Damar sesuai jadwal.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] font-sans">
      <HeroNavigation />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-16 w-full flex-1">
        {/* KATEGORI ALAT Section */}
        <section className="space-y-3 sm:space-y-6">
          <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
            KATEGORI ALAT
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5">
            {categories.slice(0, 6).map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.slug}`}
                className="bg-[#EBE7E1] p-2 sm:p-3.5 rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-300 relative flex flex-col justify-between h-20 sm:h-32 lg:h-36 border border-stone-300/60 group hover:-translate-y-0.5"
              >
                <span className="text-stone-400 font-bold text-[9px] sm:text-xs absolute top-1.5 left-2 sm:top-2.5 sm:left-3">
                  {idx + 1}.
                </span>
                <div className="w-full flex justify-center pt-0.5 sm:pt-2 pb-0 sm:pb-1">
                  <div className="relative flex items-center justify-center text-stone-700 group-hover:scale-110 group-hover:text-[#FF5500] transition-all">
                    {getCategoryIcon(cat.icon, "h-5 w-5 sm:h-7 sm:w-7 stroke-[1.6]")}
                  </div>
                </div>
                <div className="w-full text-left">
                  <h3 className="font-extrabold text-stone-900 text-[10px] sm:text-xs tracking-tight uppercase line-clamp-1" title={cat.name}>
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-[9px] sm:text-[10px] text-stone-500 leading-tight mt-0.5 line-clamp-1">
                    Pilihan alat {cat.name.toLowerCase()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUK POPULER Section */}
        <section>
          <PopularProductsSlider products={popularProducts} />
        </section>



        {/* How to Rent Steps */}
        <section className="space-y-4 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-[10px] sm:text-xs font-black tracking-widest text-[#FF5524] uppercase mb-0.5 sm:mb-1">
              Cara Penyewaan
            </h2>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              4 Langkah Mudah Menyewa Alat
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-1.5 sm:space-y-3"
              >
                <span className="text-xl sm:text-3xl font-black text-[#FF5524]/40 block leading-none">
                  {step.num}
                </span>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-base text-stone-900 leading-tight mb-1 line-clamp-1 sm:line-clamp-none">
                    {step.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-stone-600 leading-tight sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Edukasi & Jurnal Petualang Section */}
        <HomeEducationSection articles={articles} />

        {/* Mitra Resmi & Komunitas Section (Logo Saja, Scroll ke Samping) */}
        <PartnerSlider partners={partners} />
      </main>

      <FloatingCartBar />
      <Footer />
    </div>
  );
}
