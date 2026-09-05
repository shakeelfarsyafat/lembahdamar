import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { CatalogView } from "@/components/storefront/catalog-view";
import { db } from "@/lib/db/prisma";

export const revalidate = 60;

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const initialCategory = params?.category;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fcfdfc]">
        <CatalogView
          products={products}
          categories={categories}
          initialCategory={initialCategory}
        />
      </main>
      <Footer />
    </div>
  );
}
