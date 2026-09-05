import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    if (validated.id) {
      const updated = await db.category.update({
        where: { id: validated.id },
        data: {
          name: validated.name,
          slug: validated.slug,
          icon: validated.icon || null,
          image: validated.image || null,
        },
      });
      return NextResponse.json({ success: true, category: updated });
    } else {
      const created = await db.category.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          icon: validated.icon || "Compass",
          image: validated.image || null,
        },
      });
      return NextResponse.json({ success: true, category: created });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Category save error:", error);
    return NextResponse.json({ error: "Gagal menyimpan kategori" }, { status: 500 });
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
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
