import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { generateBookingCode, generateInvoiceNumber } from "@/lib/invoice";
import { generateWhatsAppLink, WhatsAppBookingPayload } from "@/lib/whatsapp";
import { z } from "zod";

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
        paymentStatus: "BELUM_DIBAYAR",
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
            dpAmount: 0,
            remainingAmount: validated.totalAmount,
            status: "DRAFT",
          },
        },
        statusHistories: {
          create: {
            status: "MENUNGGU",
            notes: "Booking dibuat via WhatsApp storefront",
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
    };

    const waLink = generateWhatsAppLink(waPayload);

    return NextResponse.json({
      success: true,
      bookingCode: booking.bookingCode,
      waLink,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 });
  }
}
