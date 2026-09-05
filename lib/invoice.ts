import { db } from "@/lib/db/prisma";

export async function generateInvoiceNumber(): Promise<string> {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const datePrefix = `INV-${year}${month}${day}`;

  const todayCount = await db.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: datePrefix,
      },
    },
  });

  const sequence = String(todayCount + 1).padStart(4, "0");
  return `${datePrefix}-${sequence}`;
}

export async function generateBookingCode(): Promise<string> {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const datePrefix = `BK-${year}${month}${day}`;

  const todayCount = await db.booking.count({
    where: {
      bookingCode: {
        startsWith: datePrefix,
      },
    },
  });

  const sequence = String(todayCount + 1).padStart(4, "0");
  return `${datePrefix}-${sequence}`;
}
