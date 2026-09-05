import { MetadataRoute } from "next";
import { db } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lembahdamaroutdoor.com";

  const products = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categories = await db.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/produk/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/katalog?category=${c.slug}`,
    lastModified: c.updatedAt,
  }));

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
