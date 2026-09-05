import { db } from "@/lib/db/prisma";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Kategori Peralatan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur pengelompokan jenis barang rental outdoor dan icon kategorinya.
        </p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}
