import Link from "next/link";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { HomeProductCard } from "@/components/storefront/home-product-card";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";
import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import {
  ShieldCheck,
  Sparkles,
  Truck,
  Tent,
  Bed,
  Flame,
  Utensils,
  Backpack,
  Layers,
  Lightbulb,
  Armchair,
  Compass,
  Phone,
  HelpCircle,
} from "lucide-react";

export const revalidate = 60; // Refresh every 60s

export default async function HomePage() {
  const [categories, popularProducts, settings] = await Promise.all([
    db.category.findMany({
      take: 8,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { isActive: true, isPopular: true },
      take: 6,
      include: {
        category: true,
        images: true,
      },
    }),
    db.setting.findUnique({ where: { id: "default" } }),
  ]);

  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case "Tent":
        return <Tent className="h-10 w-10 stroke-[1.5]" />;
      case "Backpack":
        return <Backpack className="h-10 w-10 stroke-[1.5]" />;
      case "Bed":
        return <Bed className="h-10 w-10 stroke-[1.5]" />;
      case "Flame":
        return <Flame className="h-10 w-10 stroke-[1.5]" />;
      case "Layers":
        return <Layers className="h-10 w-10 stroke-[1.5]" />;
      case "Lightbulb":
        return <Lightbulb className="h-10 w-10 stroke-[1.5]" />;
      case "Utensils":
        return <Utensils className="h-10 w-10 stroke-[1.5]" />;
      case "Armchair":
        return <Armchair className="h-10 w-10 stroke-[1.5]" />;
      default:
        return <Compass className="h-10 w-10 stroke-[1.5]" />;
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

  const faqs = [
    {
      q: "Persyaratan apa saja yang dibutuhkan untuk menyewa?",
      a: "Cukup menyerahkan 1 e-KTP atau SIM asli milik penanggung jawab sewa sebagai jaminan selama masa penyewaan.",
    },
    {
      q: "Bagaimana jika alat yang disewa kotor atau basah?",
      a: "Tenda dan matras yang basah akibat hujan wajar. Namun, mohon bersihkan sisa sisa tanah atau makanan di dalam tenda dan alat masak sebelum dikembalikan.",
    },
    {
      q: "Apakah ada batas waktu jam pengembalian barang?",
      a: "Pengembalian barang dapat dilakukan pada jam operasional basecamp (07.00 - 21.00 WIB) di tanggal terakhir masa sewa.",
    },
    {
      q: "Apakah ketersediaan alat dapat dipesan jauh-jauh hari?",
      a: "Sangat disarankan! Booking jauh-jauh hari dengan membayar DP 50% untuk mengamankan stok perlengkapan pada tanggal petualanganmu.",
    },
  ];

  const waNumber = settings?.waNumber || "6281563105682";

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] font-sans">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px] bg-stone-900 overflow-hidden flex items-center">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80"
          alt="Outdoor Camping Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
          <div className="max-w-2xl space-y-4 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.15]">
              SEWA ALAT CAMPING TERLENGKAP DI LEMBAH DAMAR!
            </h1>

            <p className="text-sm sm:text-base text-stone-200 font-medium leading-relaxed max-w-xl">
              Mudah, Aman, dan Siap Berpetualang! Jelajahi alam Puncak & Bogor dengan peralatan kualitas terbaik kami.
            </p>

            <div className="pt-3">
              <Link
                href="/katalog"
                className="inline-block bg-[#FF5524] hover:bg-[#E04618] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
              >
                CEK KETERSEDIAAN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-16 w-full flex-1">
        {/* KATEGORI ALAT Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
            KATEGORI ALAT
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.slice(0, 6).map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.slug}`}
                className="bg-[#EBE7E1] p-6 rounded-2xl hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between h-48 border border-stone-300/60 group"
              >
                <span className="text-stone-500 font-bold text-sm absolute top-4 left-4">
                  {idx + 1}.
                </span>
                <div className="w-full flex justify-center py-2">
                  <div className="w-20 h-16 relative flex items-center justify-center text-stone-700 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.icon)}
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm tracking-wide uppercase">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Pilihan alat outdoor {cat.name.toLowerCase()} berkualitas
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUK POPULER Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
            PRODUK POPULER
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Keunggulan Kami */}
        <section className="py-12 bg-[#183327] text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-black tracking-widest text-[#FF5524] uppercase">
              Keunggulan Kami
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mengapa Menyewa di Lembah Damar?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#162E24] border border-[#234737] p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#FF5524]/20 text-[#FF5524] rounded-xl flex items-center justify-center mx-auto border border-[#FF5524]/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-lg text-white">Peralatan Steril & Terawat</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Tenda dan sleeping bag selalu dicuci bersih dan dikeringkan higienis setelah tiap penggunaan.
              </p>
            </div>

            <div className="bg-[#162E24] border border-[#234737] p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#FF5524]/20 text-[#FF5524] rounded-xl flex items-center justify-center mx-auto border border-[#FF5524]/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-lg text-white">Harga Sewa Bersahabat</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Tarif sewa terjangkau per hari dengan hitungan transparan tanpa biaya tersembunyi.
              </p>
            </div>

            <div className="bg-[#162E24] border border-[#234737] p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#FF5524]/20 text-[#FF5524] rounded-xl flex items-center justify-center mx-auto border border-[#FF5524]/30">
                <Truck className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-lg text-white">Proses Booking Cepat</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Pilih tanggal, cek ketersediaan otomatis, dan langsung terhubung dengan WhatsApp admin.
              </p>
            </div>
          </div>
        </section>

        {/* How to Rent Steps */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-black tracking-widest text-[#FF5524] uppercase mb-1">
              Cara Penyewaan
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              4 Langkah Mudah Menyewa Alat
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <span className="text-3xl font-black text-[#FF5524]/40 block">
                  {step.num}
                </span>
                <h4 className="font-extrabold text-base text-stone-900">{step.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-black tracking-widest text-[#FF5524] uppercase mb-1">
              Pertanyaan Umum
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Pertanyaan Sering Diajukan (FAQ)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#F7F5F0] p-5 rounded-2xl border border-stone-200/60 space-y-1.5"
              >
                <h4 className="font-bold text-stone-900 text-sm flex items-start space-x-2">
                  <HelpCircle className="h-4 w-4 text-[#FF5524] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-stone-600 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WhatsApp Banner CTA */}
        <section className="py-12 bg-[#183327] text-white rounded-3xl text-center space-y-5 px-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Siap Menikmati Petualangan Campingmu?
          </h2>
          <p className="text-stone-300 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Konsultasikan rencana penyewaanmu atau tanya ketersediaan stok langsung ke CS kami.
          </p>
          <div>
            <a
              href={`https://wa.me/${waNumber}?text=Halo%20Lembah%20Damar%20Outdoor,%20saya%20ingin%20tanya%20sewa%20alat%20camping.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-[#FF5524] hover:bg-[#E04618] text-white px-7 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105"
            >
              <Phone className="h-4 w-4 fill-white" />
              <span>Hubungi via WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      <FloatingCartBar />
      <Footer />
    </div>
  );
}
