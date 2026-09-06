import { MetadataRoute } from "next";
import { db } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lembahdamaroutdoor.com";
  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categories = await db.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    productUrls = products.map((p) => ({
      url: `${baseUrl}/produk/${p.slug}`,
      lastModified: p.updatedAt,
    }));

    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/katalog?category=${c.slug}`,
      lastModified: c.updatedAt,
    }));
  } catch (error) {
    console.warn("Sitemap DB fetch error fallback:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/cara-sewa`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
    },
    ...productUrls,
    ...categoryUrls,
  ];
}
