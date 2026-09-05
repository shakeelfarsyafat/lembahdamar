import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { BookingDetailClient } from "@/components/admin/booking-detail-client";

export const revalidate = 0;

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "asc" } },
      statusHistories: { orderBy: { createdAt: "asc" } },
      invoice: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return <BookingDetailClient booking={booking as any} />;
}
