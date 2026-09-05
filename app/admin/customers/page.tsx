import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import { Users, Phone, MapPin, Mail, ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await db.customer.findMany({
    include: {
      bookings: {
        select: { totalAmount: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Data Customer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar penyewa terdaftar beserta riwayat total transaksi sewa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => {
          const totalSpent = c.bookings.reduce((sum, b) => sum + b.totalAmount, 0);

          return (
            <div
              key={c.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                    <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{c.phone}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {c.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs pt-3">
                <div>
                  <span className="text-slate-400 font-bold block">Total Booking</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {c.bookings.length} Transaksi
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block">Total Pengeluaran</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {formatRupiah(totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
