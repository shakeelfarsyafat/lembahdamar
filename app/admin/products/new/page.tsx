import { db } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tambah Produk Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi detail spesifikasi, foto, dan tarif sewa barang baru.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
