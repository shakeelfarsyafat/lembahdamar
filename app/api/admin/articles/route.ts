import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const articles = await db.article.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("GET /api/admin/articles error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan konten berita wajib diisi." },
        { status: 400 }
      );
    }

    // Auto-generate slug if missing
    let cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug uniqueness
    const existing = await db.article.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await db.article.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        category: category || "Edukasi",
        author: author || "Admin Lembah Damar",
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("POST /api/admin/articles error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan artikel. Pastikan data valid." },
      { status: 500 }
    );
  }
}
