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
    const { bookingId, status, notes } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Booking ID dan status wajib diisi" },
        { status: 400 }
      );
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status,
        statusHistories: {
          create: {
            status,
            notes: notes || `Status diubah oleh admin (${session.email})`,
            createdById: session.userId,
          },
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status booking" },
      { status: 500 }
    );
  }
}
