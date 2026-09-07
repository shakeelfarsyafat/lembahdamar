import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { Footer } from "@/components/storefront/footer";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";
import { ArrowLeft, User, Calendar, BookOpen, Share2, ArrowRight } from "lucide-react";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });

  if (!article || !article.isPublished) {
    return { title: "Berita Tidak Ditemukan" };
  }

  return {
    title: `${article.title} - Edukasi Lembah Damar`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  // Fetch related articles
  const related = await db.article.findMany({
    where: {
      id: { not: article.id },
      isPublished: true,
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] font-sans">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-[#1c1c1e] text-white py-3.5 px-4 sm:px-6 shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/edukasi"
            className="inline-flex items-center gap-2 text-stone-300 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#FF5524]" />
            <span>Semua Edukasi & Berita</span>
          </Link>

          <span className="text-xs font-black tracking-widest text-orange-400 uppercase hidden sm:inline-block">
            LEMBAH DAMAR JOURNAL
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 w-full">
        {/* Article Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FF5524] text-white font-extrabold text-xs uppercase tracking-wider rounded-md">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.2]">
            {article.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-semibold border-b border-stone-200 pb-5">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[#FF5524]">
                <User className="h-4 w-4" />
              </div>
              <span>{article.author}</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1.5 text-stone-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(article.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-md max-h-[460px] w-full bg-stone-100">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="p-5 sm:p-6 bg-white rounded-2xl border-l-4 border-[#FF5524] shadow-xs text-sm sm:text-base text-stone-700 font-medium italic leading-relaxed">
            {article.excerpt}
          </div>
        )}

        {/* Body Article HTML Content */}
        <article
          className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Share & Back */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-stone-100 rounded-3xl">
          <div>
            <h4 className="font-extrabold text-stone-900 text-sm">Bagikan Artikel Ini</h4>
            <p className="text-xs text-stone-500">
              Bagikan pengetahuan & informasi outdoor ini ke teman pendakianmu.
            </p>
          </div>

          <Link
            href="/edukasi"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Baca Artikel Lainnya</span>
          </Link>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-stone-200">
            <h3 className="text-xl font-black text-stone-900 tracking-tight uppercase">
              Artikel Terkait
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/edukasi/${item.slug}`}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-32 rounded-xl overflow-hidden bg-stone-100 relative">
                      <img
                        src={
                          item.coverImage ||
                          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-black text-[#FF5524] uppercase block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs text-stone-900 group-hover:text-[#FF5524] transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-[10px] text-stone-400 font-semibold border-t border-stone-100 mt-2">
                    <span>{item.author}</span>
                    <ArrowRight className="h-3 w-3 text-[#FF5524]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <FloatingCartBar />
      <Footer />
    </div>
  );
}
