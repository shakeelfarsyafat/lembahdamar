import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category: string;
  author: string;
  isFeatured: boolean;
}

export function HomeEducationSection({ articles }: { articles: ArticleItem[] }) {
  // Pick featured article (or first article)
  const featured =
    articles.find((a) => a.isFeatured) ||
    articles[0] || {
      id: "default-featured",
      title: "Per September 2026, 9 Taman Nasional Ditutup, Pendakian Dibatasi karena Karhutla",
      slug: "9-taman-nasional-ditutup-karhutla-september-2026",
      coverImage:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
      category: "#WARTA RIMBA",
      author: "Ranger Fajar",
      isFeatured: true,
    };

  // Sub articles (2 cards for the bottom left)
  const subArticles = articles.filter((a) => a.id !== featured.id).slice(0, 2);

  // Fallback defaults if fewer than 2 sub-articles in db
  const cardA = subArticles[0] || {
    id: "sub-1",
    title: "Review Sepatu Trekking Terbaik untuk Jalur Basah & Berbatu",
    slug: "review-sepatu-trekking-jalur-basah-berbatu",
    coverImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    category: "#NUEV UPDATE",
  };

  const cardB = subArticles[1] || {
    id: "sub-2",
    title: "Panduan Manajemen Air & Logistik Pendakian Musim Kemarau",
    slug: "panduan-manajemen-air-logistik-kemarau",
    coverImage:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    category: "#WARTA RIMBA",
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
          JURNAL PETUALANG
        </h2>

        <Link
          href="/edukasi"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF5524] hover:text-[#E04618] transition-colors group"
        >
          <span>Selengkapnya</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid Layout 2 Kolom Sesuai Referensi Gambar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* KOLOM KIRI (Top: MEDIA & GEAR LABS, Bottom: 2 Kartu Thumbnail) */}
        <div className="flex flex-col justify-between gap-5 sm:gap-6">
          {/* Card 1 (Atas): MEDIA & GEAR LABS Banner */}
          <Link
            href="/edukasi"
            className="bg-[#EBE7E1] p-6 sm:p-8 md:p-10 rounded-3xl border border-stone-300/60 flex flex-col justify-between hover:shadow-md transition-all group flex-1"
          >
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-[1.05] uppercase">
                MEDIA &amp; <br />
                GEAR LABS
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mt-6 max-w-md font-medium">
              Cerita, tips, Sosok, Reviews dan panduan untuk menemani langkah petualanganmu berikutnya.
            </p>
          </Link>

          {/* Card 2 & 3 (Bawah): 2 Kartu Foto Berdampingan */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {/* Subcard 1 */}
            <Link
              href={`/edukasi/${cardA.slug}`}
              className="relative h-40 sm:h-48 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all group block"
            >
              <img
                src={
                  cardA.coverImage ||
                  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"
                }
                alt={cardA.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pr-2">
                <span className="font-black text-white text-[11px] sm:text-xs uppercase tracking-wider block drop-shadow-sm group-hover:text-orange-300 transition-colors">
                  {cardA.category || "#NUEV UPDATE"}
                </span>
              </div>
            </Link>

            {/* Subcard 2 */}
            <Link
              href={`/edukasi/${cardB.slug}`}
              className="relative h-40 sm:h-48 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all group block"
            >
              <img
                src={
                  cardB.coverImage ||
                  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80"
                }
                alt={cardB.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pr-2">
                <span className="font-black text-white text-[11px] sm:text-xs uppercase tracking-wider block drop-shadow-sm group-hover:text-orange-300 transition-colors">
                  {cardB.category || "#WARTA RIMBA"}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN: Kartu Besar Artikel Utama (Featured) */}
        <div className="relative rounded-3xl overflow-hidden shadow-md group min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10">
          {/* Background Photo */}
          <img
            src={
              featured.coverImage ||
              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
            }
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

          {/* Content */}
          <div className="relative z-10 space-y-5">
            <Link href={`/edukasi/${featured.slug}`} className="block group-hover:underline">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight drop-shadow-md">
                {featured.title}
              </h3>
            </Link>

            {/* Pill CTA Button */}
            <Link
              href={`/edukasi/${featured.slug}`}
              className="inline-flex items-center gap-3 bg-[#F4EFEA] hover:bg-white text-stone-900 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg group/btn cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                BACA ARTIKEL
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF5524] text-white flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
