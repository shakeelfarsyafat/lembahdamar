import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { Footer } from "@/components/storefront/footer";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";
import {
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Edukasi & Jurnal Petualang - Lembah Damar Outdoor",
  description:
    "Kumpulan artikel edukasi outdoor, warta pendakian gunung, tips & trik camping, serta review perlengkapan alam bebas.",
};

interface EdukasiPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function EdukasiPage({ searchParams }: EdukasiPageProps) {
  const params = await searchParams;
  const activeCategory = params?.category;
  const searchQuery = params?.search;

  const articles = await db.article.findMany({
    where: {
      isPublished: true,
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: "insensitive" } },
              { excerpt: { contains: searchQuery, mode: "insensitive" } },
              { content: { contains: searchQuery, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  // Extract distinct categories from DB
  const allCategories = await db.article.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ["category"],
  });

  const categories = allCategories.map((c) => c.category);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] font-sans">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-[#1c1c1e] text-white py-3.5 px-4 sm:px-6 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-300 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#FF5524]" />
            <span>Kembali ke Beranda</span>
          </Link>

          <span className="text-xs font-black tracking-widest text-orange-400 uppercase hidden sm:inline-block">
            LEMBAH DAMAR JOURNAL
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 w-full">
        {/* Banner Title */}
        <div className="bg-[#183327] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-lg space-y-4">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#FF5524] uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Pusat Informasi & Edukasi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
              Jurnal Petualang
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              Edukasi outdoor, warta konservasi, panduan keselamatan gunung, dan ulasan perlengkapan camping terpercaya.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <BookOpen className="w-80 h-80 text-white stroke-[1]" />
          </div>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-5">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            <Link
              href="/edukasi"
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                !activeCategory
                  ? "bg-[#FF5524] text-white shadow-xs"
                  : "bg-white text-stone-700 hover:bg-stone-200/60 border border-stone-200"
              }`}
            >
              Semua Berita
            </Link>

            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Link
                  key={cat}
                  href={`/edukasi?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#FF5524] text-white shadow-xs"
                      : "bg-white text-stone-700 hover:bg-stone-200/60 border border-stone-200"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Search Input */}
          <form method="GET" action="/edukasi" className="relative w-full sm:w-72 shrink-0">
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ""}
              placeholder="Cari artikel..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5524] shadow-xs"
            />
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
            <BookOpen className="h-12 w-12 text-stone-300 mx-auto" />
            <h3 className="font-extrabold text-stone-700 text-base">Belum Ada Artikel Ditemukan</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Tidak ada artikel yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
            <Link
              href="/edukasi"
              className="inline-block px-5 py-2.5 bg-[#FF5524] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Lihat Semua Artikel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/edukasi/${art.slug}`}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
                    <img
                      src={
                        art.coverImage ||
                        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80"
                      }
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/75 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md backdrop-blur-xs">
                      {art.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    <h3 className="font-black text-stone-900 text-base sm:text-lg group-hover:text-[#FF5524] transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>
                    {art.excerpt && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-medium">
                        {art.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <User className="h-3.5 w-3.5 text-[#FF5524]" />
                    <span className="truncate max-w-[120px]">{art.author}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#FF5524] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Baca</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <FloatingCartBar />
      <Footer />
    </div>
  );
}
