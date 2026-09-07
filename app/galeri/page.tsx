import { Footer } from "@/components/storefront/footer";
import { FloatingCartBar } from "@/components/storefront/floating-cart-bar";
import { SubpageHeader } from "@/components/storefront/subpage-header";
import { db } from "@/lib/db/prisma";
import { Building2, Camera, Sparkles } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Galeri & Portofolio Mitra - Lembah Damar Outdoor",
  description: "Portofolio logo mitra kerja sama dan dokumentasi foto kegiatan outdoor Lembah Damar.",
};

export default async function GaleriPage() {
  const [partners, galleryItems] = await Promise.all([
    db.partner.findMany({ orderBy: { createdAt: "desc" } }),
    db.galleryItem.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] font-sans">
      <SubpageHeader title="LEMBAH DAMAR GALERI" />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 w-full">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#FF5524]/10 border border-[#FF5524]/20 px-4 py-1.5 rounded-full text-xs font-black text-[#FF5524] uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Portofolio & Dokumentasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight uppercase">
            Mitra Kerja Sama & Galeri Kegiatan
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Kepercayaan ribuan pendaki, komunitas outdoor, dan instansi mitra yang telah mempercayakan sewa alat di Lembah Damar.
          </p>
        </div>

        {/* SECTION 1: LOGO MITRA KERJA SAMA */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <Building2 className="h-5 w-5 text-[#FF5524]" />
              <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
                Mitra Kerja Sama
              </h2>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
              {partners.length} Mitra
            </span>
          </div>

          {partners.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-stone-300 text-center text-stone-500 text-xs font-bold">
              Belum ada logo mitra yang diunggah. Tambahkan melalui Dashboard Admin Galeri.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between items-center text-center space-y-3 group hover:border-[#FF5524]/50"
                >
                  <div className="w-full h-24 bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center p-3 border border-stone-100 group-hover:scale-105 transition-transform">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain transition-all duration-300"
                    />
                  </div>
                  <div className="w-full">
                    <h3 className="font-extrabold text-stone-900 text-xs truncate">
                      {partner.name}
                    </h3>
                    <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
                      {partner.category || "Mitra Resmi"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: DOKUMENTASI GALERI FOTO */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <Camera className="h-5 w-5 text-[#FF5524]" />
              <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
                Galeri Dokumentasi
              </h2>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
              {galleryItems.length} Foto
            </span>
          </div>

          {galleryItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center text-stone-500 text-xs font-bold">
              Belum ada foto kegiatan yang diunggah. Tambahkan melalui Dashboard Admin Galeri.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-[#FF5524]/40"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/85 text-white text-[10px] font-bold px-3 py-1 rounded-md backdrop-blur-xs shadow">
                      {item.category || "Dokumentasi"}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-stone-900 text-base group-hover:text-[#FF5524] transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <FloatingCartBar />
      <Footer />
    </div>
  );
}
