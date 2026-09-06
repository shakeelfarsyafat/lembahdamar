import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  categoryId: z.string().min(1, "Pilih kategori"),
  pricePerDay: z.number().min(0, "Harga tidak boleh negatif"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  capacity: z.string().optional(),
  weight: z.string().optional(),
  packageItems: z.string().optional(),
  terms: z.string().optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  images: z.array(z.string()).min(1, "Minimal 1 foto produk"),
});

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    if (validated.id) {
      // Update Product
      const updated = await db.product.update({
        where: { id: validated.id },
        data: {
          name: validated.name,
          slug: validated.slug,
          categoryId: validated.categoryId,
          pricePerDay: validated.pricePerDay,
          stock: validated.stock,
          description: validated.description,
          capacity: validated.capacity || null,
          weight: validated.weight || null,
          packageItems: validated.packageItems || null,
          terms: validated.terms || null,
          isActive: validated.isActive,
          isPopular: validated.isPopular,
        },
      });

      // Replace images
      await db.productImage.deleteMany({ where: { productId: updated.id } });
      for (let i = 0; i < validated.images.length; i++) {
        await db.productImage.create({
          data: {
            productId: updated.id,
            url: validated.images[i],
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      }

      return NextResponse.json({ success: true, product: updated });
    } else {
      // Create New Product
      const created = await db.product.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          categoryId: validated.categoryId,
          pricePerDay: validated.pricePerDay,
          stock: validated.stock,
          description: validated.description,
          capacity: validated.capacity || null,
          weight: validated.weight || null,
          packageItems: validated.packageItems || null,
          terms: validated.terms || null,
          isActive: validated.isActive,
          isPopular: validated.isPopular,
          images: {
            create: validated.images.map((url: string, i: number) => ({
              url,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          },
        },
      });

      return NextResponse.json({ success: true, product: created });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Product save error:", error);
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
