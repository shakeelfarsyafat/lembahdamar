import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const article = await db.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("GET /api/admin/articles/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      author,
      isPublished,
      isFeatured,
    } = body;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    let cleanSlug = slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const duplicate = await db.article.findUnique({ where: { slug: cleanSlug } });
      if (duplicate && duplicate.id !== id) {
        cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const article = await db.article.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: cleanSlug !== undefined ? cleanSlug : existing.slug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        category: category !== undefined ? category : existing.category,
        author: author !== undefined ? author : existing.author,
        isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
        isFeatured: isFeatured !== undefined ? isFeatured : existing.isFeatured,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("PUT /api/admin/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui artikel." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus artikel." },
      { status: 500 }
    );
  }
}
