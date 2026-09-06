import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { generateBookingCode, generateInvoiceNumber } from "@/lib/invoice";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adminCreateBookingSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z.string().min(8, "Nomor WhatsApp tidak valid"),
  customerEmail: z.string().optional().or(z.literal("")),
  customerAddress: z.string().min(3, "Alamat minimal 3 karakter"),
  customerNotes: z.string().optional(),
  startDateStr: z.string(),
  endDateStr: z.string(),
  durationDays: z.number().min(1),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      pricePerDay: z.number().min(0),
      subtotal: z.number().min(0),
    })
  ).min(1, "Pilih minimal 1 barang sewa"),
  totalAmount: z.number().min(0),
  initialStatus: z.string().default("DIKONFIRMASI"),
  initialPaymentAmount: z.number().default(0),
  initialPaymentMethod: z.string().default("CASH"),
  initialPaymentType: z.string().default("DP"),
});

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = adminCreateBookingSchema.parse(body);

    // 1. Find or create customer
    let customer = await db.customer.findFirst({
      where: { phone: validated.customerPhone },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: validated.customerName,
          phone: validated.customerPhone,
          email: validated.customerEmail || null,
          address: validated.customerAddress,
        },
      });
    } else {
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          name: validated.customerName,
          email: validated.customerEmail || customer.email,
          address: validated.customerAddress,
        },
      });
    }

    // 2. Generate Codes
    const bookingCode = await generateBookingCode();
    const invoiceNumber = await generateInvoiceNumber();

    const startDate = new Date(validated.startDateStr);
    const endDate = new Date(validated.endDateStr);

    const isPaidFull = validated.initialPaymentAmount >= validated.totalAmount;
    const isPaidDp = validated.initialPaymentAmount > 0 && !isPaidFull;

    const paymentStatus = isPaidFull
      ? "LUNAS"
      : isPaidDp
      ? "DP"
      : "BELUM_DIBAYAR";

    // 3. Create Booking & Items
    const booking = await db.booking.create({
      data: {
        bookingCode,
        customerId: customer.id,
        startDate,
        endDate,
        durationDays: validated.durationDays,
        subtotal: validated.totalAmount,
        totalAmount: validated.totalAmount,
        status: validated.initialStatus,
        paymentStatus,
        notes: validated.customerNotes || "Pesanan dibuat manual oleh Admin",
        items: {
          create: validated.items.map((item: { productId: string; quantity: number; pricePerDay: number; subtotal: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            pricePerDay: item.pricePerDay,
            subtotal: item.subtotal,
          })),
        },
        invoice: {
          create: {
            invoiceNumber,
            totalAmount: validated.totalAmount,
            dpAmount: validated.initialPaymentAmount,
            remainingAmount: Math.max(0, validated.totalAmount - validated.initialPaymentAmount),
            status: isPaidFull ? "PAID" : "DRAFT",
          },
        },
        statusHistories: {
          create: {
            status: validated.initialStatus,
            notes: `Booking dibuat manual oleh Admin (${session.email})`,
          },
        },
      },
    });

    // 4. Record Initial Payment if amount > 0
    if (validated.initialPaymentAmount > 0) {
      await db.payment.create({
        data: {
          bookingId: booking.id,
          amount: validated.initialPaymentAmount,
          paymentMethod: validated.initialPaymentMethod,
          paymentType: validated.initialPaymentType,
          status: "LUNAS",
          notes: "Pembayaran awal saat booking manual admin",
        },
      });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Admin create booking error:", error);
    return NextResponse.json({ error: "Gagal membuat pesanan manual" }, { status: 500 });
  }
}
