import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updated = await db.setting.upsert({
      where: { id: "default" },
      update: {
        storeName: body.storeName,
        logoUrl: body.logoUrl || null,
        description: body.description || null,
        address: body.address || null,
        waNumber: body.waNumber,
        email: body.email || null,
        instagram: body.instagram || null,
        operationalHours: body.operationalHours || null,
        bankDetails: body.bankDetails || null,
        qrisImage: body.qrisImage || null,
        rentalTerms: body.rentalTerms || null,
        cancellationPolicy: body.cancellationPolicy || null,
        lateFeePerDay: Number(body.lateFeePerDay || 20000),
        damageFeeTerms: body.damageFeeTerms || null,
      },
      create: {
        id: "default",
        storeName: body.storeName || "Lembah Damar Outdoor",
        logoUrl: body.logoUrl || null,
        description: body.description || null,
        address: body.address || null,
        waNumber: body.waNumber || "6281563105682",
        email: body.email || null,
        instagram: body.instagram || null,
        operationalHours: body.operationalHours || null,
        bankDetails: body.bankDetails || null,
        qrisImage: body.qrisImage || null,
        rentalTerms: body.rentalTerms || null,
        cancellationPolicy: body.cancellationPolicy || null,
        lateFeePerDay: Number(body.lateFeePerDay || 20000),
        damageFeeTerms: body.damageFeeTerms || null,
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
