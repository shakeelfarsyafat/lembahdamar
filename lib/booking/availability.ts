import { db } from "@/lib/db/prisma";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculates the available stock for a specific product within a date range [startDate, endDate].
 * Subtracts quantities reserved by active, overlapping bookings.
 */
export async function getProductAvailableStock(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<{ totalStock: number; bookedCount: number; availableStock: number }> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product) {
    return { totalStock: 0, bookedCount: 0, availableStock: 0 };
  }

  // Active bookings that overlap with requested range [startDate, endDate]
  // Overlap condition: (Booking.startDate < endDate) AND (Booking.endDate > startDate)
  // Non-stock-reducing statuses: DIBATALKAN, DIKEMBALIKAN, SELESAI
  const activeBookings = await db.bookingItem.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      productId: productId,
      booking: {
        status: {
          notIn: ["DIBATALKAN", "DIKEMBALIKAN", "SELESAI"],
        },
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
    },
  });

  const bookedCount = activeBookings._sum.quantity || 0;
  const availableStock = Math.max(0, product.stock - bookedCount);

  return {
    totalStock: product.stock,
    bookedCount,
    availableStock,
  };
}

/**
 * Batch availability checker for cart/multiple items.
 */
export async function checkItemsAvailability(
  items: { productId: string; quantity: number }[],
  startDate: Date,
  endDate: Date
) {
  const results = [];
  let allAvailable = true;

  for (const item of items) {
    const stockInfo = await getProductAvailableStock(item.productId, startDate, endDate);
    const isAvailable = stockInfo.availableStock >= item.quantity;
    if (!isAvailable) {
      allAvailable = false;
    }
    results.push({
      productId: item.productId,
      requestedQuantity: item.quantity,
      ...stockInfo,
      isAvailable,
    });
  }

  return {
    allAvailable,
    items: results,
  };
}
