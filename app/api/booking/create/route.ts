import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { generateBookingCode, generateInvoiceNumber } from "@/lib/invoice";
import { generateWhatsAppLink, WhatsAppBookingPayload } from "@/lib/whatsapp";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createBookingSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z.string().min(8, "Nomor WhatsApp tidak valid"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerAddress: z.string().min(5, "Alamat minimal 5 karakter"),
  customerNotes: z.string().optional(),
  startDateStr: z.string(),
  endDateStr: z.string(),
  durationDays: z.number().min(1),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().min(1),
      pricePerDay: z.number().min(0),
      subtotal: z.number().min(0),
    })
  ),
  totalAmount: z.number().min(0),
  paymentMethod: z.string().optional(),
  bankName: z.string().optional(),
  transferAmount: z.number().min(0).optional(),
  paymentType: z.enum(["DP", "LUNAS", "BELUM_BAYAR"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    // 1. Fetch admin settings to get WA number
    const settings = await db.setting.findUnique({ where: { id: "default" } });
    const adminWaNumber = settings?.waNumber || "6281563105682";

    // 2. Create or find customer
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

    // 3. Generate Codes
    const bookingCode = await generateBookingCode();
    const invoiceNumber = await generateInvoiceNumber();

    const startDate = new Date(validated.startDateStr);
    const endDate = new Date(validated.endDateStr);

    // Compute payment status based on transferAmount
    const transferAmount = Number(validated.transferAmount) || 0;
    const isLunas = transferAmount >= validated.totalAmount && validated.totalAmount > 0;
    const isDp = transferAmount > 0 && !isLunas;
    const paymentStatus = isLunas ? "LUNAS" : isDp ? "DP" : "BELUM_DIBAYAR";
    const paymentType = isLunas ? "LUNAS" : isDp ? "DP" : "BELUM_BAYAR";

    // 4. Create Booking, Items, Invoice, and Status History in database
    const booking = await db.booking.create({
      data: {
        bookingCode,
        customerId: customer.id,
        startDate,
        endDate,
        durationDays: validated.durationDays,
        subtotal: validated.totalAmount,
        totalAmount: validated.totalAmount,
        status: "MENUNGGU",
        paymentStatus,
        notes: validated.customerNotes || null,
        items: {
          create: validated.items.map((item: any) => ({
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
            dpAmount: isLunas ? 0 : transferAmount,
            remainingAmount: Math.max(0, validated.totalAmount - transferAmount),
            status: isLunas ? "PAID" : isDp ? "ISSUED" : "DRAFT",
          },
        },
        ...(transferAmount > 0
          ? {
              payments: {
                create: {
                  amount: transferAmount,
                  paymentMethod: validated.paymentMethod || "TRANSFER_BANK",
                  paymentType,
                  status: "LUNAS",
                  notes: `${
                    validated.paymentMethod === "QRIS"
                      ? "QRIS"
                      : `Transfer Bank ${validated.bankName || "BCA"}`
                  } via storefront (${paymentType})`,
                },
              },
            }
          : {}),
        statusHistories: {
          create: {
            status: "MENUNGGU",
            notes: `Booking dibuat via storefront (${paymentStatus}: Rp ${transferAmount.toLocaleString("id-ID")})`,
          },
        },
      },
    });

    // 5. Generate WhatsApp Link
    const waPayload: WhatsAppBookingPayload = {
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerAddress: validated.customerAddress,
      customerNotes: validated.customerNotes,
      startDateStr: validated.startDateStr,
      endDateStr: validated.endDateStr,
      durationDays: validated.durationDays,
      items: validated.items,
      totalAmount: validated.totalAmount,
      adminWaNumber,
      bookingCode: booking.bookingCode,
      paymentMethod: validated.paymentMethod,
      bankName: validated.bankName,
      transferAmount,
      paymentType,
    };

    const waLink = generateWhatsAppLink(waPayload);

    return NextResponse.json({
      success: true,
      bookingCode: booking.bookingCode,
      waLink,
      paymentStatus,
      transferAmount,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 });
  }
}
