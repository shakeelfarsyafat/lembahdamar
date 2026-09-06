import { db } from "@/lib/db/prisma";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const [partners, galleryItems] = await Promise.all([
    db.partner.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Galeri & Logo Mitra
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola portofolio logo mitra kerja sama dan foto dokumentasi kegiatan outdoor Lembah Damar.
        </p>
      </div>

      <GalleryManager
        initialPartners={partners as any}
        initialGalleryItems={galleryItems as any}
      />
    </div>
  );
}
