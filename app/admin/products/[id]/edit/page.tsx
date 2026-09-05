import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Edit Produk: {product.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perbarui harga, stok, deskripsi, atau foto perlengkapan.
        </p>
      </div>

      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}
