import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import {
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
  ArrowRight,
  Tent,
  Backpack,
  Bed,
  Flame,
  Layers,
  Lightbulb,
  Utensils,
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
        return <Tent className="h-6 w-6" />;
      case "Backpack":
        return <Backpack className="h-6 w-6" />;
      case "Bed":
        return <Bed className="h-6 w-6" />;
      case "Flame":
        return <Flame className="h-6 w-6" />;
      case "Layers":
        return <Layers className="h-6 w-6" />;
      case "Lightbulb":
        return <Lightbulb className="h-6 w-6" />;
      case "Utensils":
        return <Utensils className="h-6 w-6" />;
      case "Armchair":
        return <Armchair className="h-6 w-6" />;
      default:
        return <Compass className="h-6 w-6" />;
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
    <div className="flex flex-col min-h-screen bg-[#F7F5F0]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#1C1C1C] text-white pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden border-b border-[#282828]">
        {/* Ambient Overlay Graphic */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D96C3F]/20 via-[#1C1C1C] to-[#1C1C1C] pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 w-96 h-96 bg-[#D96C3F] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-[#282828] border border-[#383838] px-4 py-1.5 rounded-full text-xs font-semibold text-[#D96C3F]">
                <Sparkles className="h-4 w-4 text-[#D96C3F]" />
                <span>Penyewaan Alat Outdoor Terpercaya di Puncak Bogor</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Lengkapi Petualanganmu dengan <span className="text-[#D96C3F]">Peralatan Camping</span> Terbaik.
              </h1>

              <p className="text-lg sm:text-xl text-[#F7F5F0]/80 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Sewa tenda, carrier, sleeping bag, kompor, dan berbagai perlengkapan outdoor berkualitas tinggi dengan proses mudah, cepat, dan transparan.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/katalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <span>Lihat Katalog Produk</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/kontak"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#282828] hover:bg-[#383838] text-[#F7F5F0] border border-[#383838] px-6 py-4 rounded-xl font-semibold text-base transition-colors"
                >
                  <span>Cara Penyewaan & FAQ</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#282828] grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="block text-2xl font-extrabold text-white">100%</span>
                  <span className="text-xs text-[#F7F5F0]/70">Alat Terawat & Bersih</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">50+</span>
                  <span className="text-xs text-[#F7F5F0]/70">Pilihan Peralatan</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">Fast</span>
                  <span className="text-xs text-[#F7F5F0]/70">Respon WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-[#383838] bg-[#282828]">
                <img
                  src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80"
                  alt="Outdoor Camping Experience"
                  className="w-full h-[400px] lg:h-[480px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#1C1C1C]/90 backdrop-blur-md rounded-2xl border border-[#383838]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[#D96C3F] rounded-xl text-white">
                      <Tent className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#D96C3F] uppercase tracking-wider block">
                        Koleksi Tenda Premium
                      </span>
                      <span className="text-sm font-bold text-white">
                        Frame Aluminium Tahan Angin Gunung
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold tracking-widest text-[#D96C3F] uppercase mb-2">
              Kategori Alat
            </h2>
            <h3 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
              Pilihan Peralatan Outdoor Lengkap
            </h3>
            <p className="mt-3 text-stone-600 text-sm">
              Temukan semua kebutuhan mendaki dan camping dalam satu tempat.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.slug}`}
                className="group bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-xs hover:shadow-md hover:border-[#D96C3F]/50 transition-all duration-300 text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="p-4 bg-[#FDF3EE] group-hover:bg-[#D96C3F] text-[#D96C3F] group-hover:text-white rounded-2xl transition-all duration-300">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h4 className="font-bold text-[#1C1C1C] group-hover:text-[#D96C3F] transition-colors text-sm sm:text-base">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-20 bg-white border-y border-[#EFECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-[#D96C3F] uppercase block mb-1">
                Rekomendasi Favorit
              </span>
              <h2 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
                Produk Paling Sering Disewa
              </h2>
            </div>
            <Link
              href="/katalog"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-[#D96C3F] hover:text-[#C05A2E] transition-colors"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularProducts.map((product) => {
              const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";

              return (
                <div
                  key={product.id}
                  className="group bg-[#F7F5F0] rounded-2xl border border-[#EFECE6] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#D96C3F]/40 transition-all duration-300 flex flex-col"
                >
                  {/* Image Header */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#EFECE6]">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1C1C1C]/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                      {product.category.name}
                    </div>
                    {product.stock > 0 ? (
                      <div className="absolute top-3 right-3 bg-[#FDF3EE] text-[#D96C3F] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#D96C3F]/30">
                        Stok: {product.stock}
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-rose-200">
                        Stok Habis
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-[#1C1C1C] text-lg group-hover:text-[#D96C3F] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-stone-500 block">Sewa Per Hari</span>
                        <span className="text-xl font-extrabold text-[#D96C3F]">
                          {formatRupiah(product.pricePerDay)}
                        </span>
                      </div>

                      <Link
                        href={`/produk/${product.slug}`}
                        className="bg-[#1C1C1C] hover:bg-[#D96C3F] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#1C1C1C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold tracking-widest text-[#D96C3F] uppercase mb-2">
              Keunggulan Kami
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Mengapa Menyewa di Lembah Damar?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#282828] border border-[#383838] p-8 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-[#D96C3F]/20 text-[#D96C3F] rounded-2xl flex items-center justify-center mx-auto border border-[#D96C3F]/30">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-xl text-white">Peralatan Steril & Terawat</h4>
              <p className="text-sm text-[#F7F5F0]/70 leading-relaxed">
                Tenda dan sleeping bag selalu dicuci bersih dan dikeringkan higienis setelah tiap penggunaan.
              </p>
            </div>

            <div className="bg-[#282828] border border-[#383838] p-8 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-[#D96C3F]/20 text-[#D96C3F] rounded-2xl flex items-center justify-center mx-auto border border-[#D96C3F]/30">
                <Sparkles className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-xl text-white">Harga Sewa Bersahabat</h4>
              <p className="text-sm text-[#F7F5F0]/70 leading-relaxed">
                Tarif sewa terjangkau per hari dengan hitungan transparan tanpa biaya tersembunyi.
              </p>
            </div>

            <div className="bg-[#282828] border border-[#383838] p-8 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-[#D96C3F]/20 text-[#D96C3F] rounded-2xl flex items-center justify-center mx-auto border border-[#D96C3F]/30">
                <Truck className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-xl text-white">Proses Booking Cepat</h4>
              <p className="text-sm text-[#F7F5F0]/70 leading-relaxed">
                Pilih tanggal, cek ketersediaan otomatis, dan langsung terhubung dengan WhatsApp admin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Rent Steps */}
      <section className="py-20 bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold tracking-widest text-[#D96C3F] uppercase mb-2">
              Cara Penyewaan
            </h2>
            <h3 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
              4 Langkah Mudah Menyewa Alat
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-[#EFECE6] shadow-xs relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="text-4xl font-extrabold text-[#D96C3F]/30 block">
                    {step.num}
                  </span>
                  <h4 className="font-bold text-lg text-[#1C1C1C]">{step.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-[#EFECE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-extrabold tracking-widest text-[#D96C3F] uppercase mb-2">
              Pertanyaan Umum
            </h2>
            <h3 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
              Pertanyaan Sering Diajukan (FAQ)
            </h3>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#F7F5F0] p-6 rounded-2xl border border-[#EFECE6] shadow-xs space-y-2"
              >
                <h4 className="font-bold text-[#1C1C1C] text-base flex items-start space-x-3">
                  <HelpCircle className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-sm text-stone-600 pl-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Banner CTA */}
      <section className="py-16 bg-[#1C1C1C] text-white border-t border-[#282828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Siap Menikmati Petualangan Campingmu?
          </h2>
          <p className="text-[#F7F5F0]/80 max-w-xl mx-auto text-base">
            Konsultasikan rencana penyewaanmu atau tanya ketersediaan stok langsung ke CS kami.
          </p>
          <div>
            <a
              href={`https://wa.me/${waNumber}?text=Halo%20Lembah%20Damar%20Outdoor,%20saya%20ingin%20tanya%20sewa%20alat%20camping.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-3 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="h-5 w-5 fill-white" />
              <span>Hubungi via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
