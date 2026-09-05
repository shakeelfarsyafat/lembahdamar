import { db } from "@/lib/db/prisma";
import { ProductsTable } from "@/components/admin/products-table";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Katalog Produk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola perlengkapan sewa, atur tarif harian, jumlah stok unit, dan foto produk.
        </p>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
