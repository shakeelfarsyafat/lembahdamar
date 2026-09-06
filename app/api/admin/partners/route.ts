import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const partners = await db.partner.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, partners });
  } catch (error) {
    console.error("Get partners error:", error);
    return NextResponse.json({ error: "Gagal mengambil data mitra" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, logoUrl, category } = body;

    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Nama mitra dan logo wajib diisi" }, { status: 400 });
    }

    if (id) {
      const updated = await db.partner.update({
        where: { id },
        data: { name, logoUrl, category: category || "Mitra Resmi" },
      });
      return NextResponse.json({ success: true, partner: updated });
    } else {
      const created = await db.partner.create({
        data: { name, logoUrl, category: category || "Mitra Resmi" },
      });
      return NextResponse.json({ success: true, partner: created });
    }
  } catch (error) {
    console.error("Save partner error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data mitra" }, { status: 500 });
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
      return NextResponse.json({ error: "Partner ID required" }, { status: 400 });
    }

    await db.partner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete partner error:", error);
    return NextResponse.json({ error: "Gagal menghapus mitra" }, { status: 500 });
  }
}
