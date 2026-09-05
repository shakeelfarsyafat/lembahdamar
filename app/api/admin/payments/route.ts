import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId, amount, paymentMethod, paymentType, notes } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        bookingId,
        amount: Number(amount),
        paymentMethod: paymentMethod || "TRANSFER_BANK",
        paymentType: paymentType || "DP",
        status: "LUNAS",
        notes: notes || null,
      },
    });

    // Calculate total paid including this new payment
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0) + Number(amount);
    let newPaymentStatus = "DP";
    if (totalPaid >= booking.totalAmount) {
      newPaymentStatus = "LUNAS";
    }

    // Update booking payment status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: newPaymentStatus,
        status: booking.status === "MENUNGGU" ? "DIKONFIRMASI" : booking.status,
      },
    });

    // Update Invoice if exists
    if (booking.id) {
      await db.invoice.updateMany({
        where: { bookingId: booking.id },
        data: {
          dpAmount: newPaymentStatus === "LUNAS" ? booking.totalAmount : totalPaid,
          remainingAmount: Math.max(0, booking.totalAmount - totalPaid),
          status: newPaymentStatus === "LUNAS" ? "PAID" : "PARTIAL",
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment,
      bookingPaymentStatus: newPaymentStatus,
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json({ error: "Gagal mencatat pembayaran" }, { status: 500 });
  }
}
