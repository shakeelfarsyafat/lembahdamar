import { db } from "@/lib/db/prisma";
import { CustomersManager } from "@/components/admin/customers-manager";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const [customers, setting] = await Promise.all([
    db.customer.findMany({
      include: {
        bookings: {
          include: {
            items: { include: { product: true } },
            payments: { orderBy: { createdAt: "asc" } },
            invoice: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.setting.findUnique({ where: { id: "default" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Customer & Pembayaran
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau riwayat sewa penyewa, status pelunasan pembayaran, serta cetak invoice resmi secara langsung.
        </p>
      </div>

      <CustomersManager customers={customers as any} setting={setting} />
    </div>
  );
}
