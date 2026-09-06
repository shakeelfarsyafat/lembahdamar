import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const galleryItems = await db.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, galleryItems });
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, imageUrl, description, category } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Judul dan URL foto galeri wajib diisi" }, { status: 400 });
    }

    if (id) {
      const updated = await db.galleryItem.update({
        where: { id },
        data: { title, imageUrl, description, category: category || "Dokumentasi" },
      });
      return NextResponse.json({ success: true, galleryItem: updated });
    } else {
      const created = await db.galleryItem.create({
        data: { title, imageUrl, description, category: category || "Dokumentasi" },
      });
      return NextResponse.json({ success: true, galleryItem: created });
    }
  } catch (error) {
    console.error("Save gallery item error:", error);
    return NextResponse.json({ error: "Gagal menyimpan galeri" }, { status: 500 });
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
      return NextResponse.json({ error: "Gallery ID required" }, { status: 400 });
    }

    await db.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return NextResponse.json({ error: "Gagal menghapus foto galeri" }, { status: 500 });
  }
}
