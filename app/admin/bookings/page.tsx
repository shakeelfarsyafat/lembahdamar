import { db } from "@/lib/db/prisma";
import { BookingsTable } from "@/components/admin/bookings-table";

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const [bookings, products] = await Promise.all([
    db.booking.findMany({
      include: {
        customer: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { isActive: true },
      include: { category: true, images: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Pesanan Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau seluruh reservasi sewa alat, verifikasi pembayaran, dan perbarui status penyewaan.
        </p>
      </div>

      <BookingsTable bookings={bookings} products={products as any} />
    </div>
  );
}
