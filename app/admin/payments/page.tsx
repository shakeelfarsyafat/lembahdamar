import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import { CreditCard, DollarSign, Calendar, CheckCircle } from "lucide-react";

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    include: {
      booking: {
        include: { customer: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSum = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Riwayat penerimaan pembayaran DP, pelunasan transfer bank, QRIS, dan tunai.
          </p>
        </div>

        <div className="bg-emerald-950 text-white px-5 py-3 rounded-2xl flex items-center space-x-3 shadow-md">
          <DollarSign className="h-6 w-6 text-emerald-400" />
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">
              Total Pembayaran Diterima
            </span>
            <span className="text-xl font-extrabold">{formatRupiah(totalSum)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-4 px-6">Tanggal Bayar</th>
                <th className="py-4 px-4">Kode Booking</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Jenis</th>
                <th className="py-4 px-4">Metode</th>
                <th className="py-4 px-4">Nominal</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    {new Date(p.paymentDate).toLocaleDateString("id-ID")}{" "}
                    <span className="text-slate-400 text-[10px]">
                      {new Date(p.paymentDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {p.booking.bookingCode}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800 block">{p.booking.customer.name}</span>
                    <span className="text-[10px] text-slate-400">{p.booking.customer.phone}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                      {p.paymentType}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{p.paymentMethod}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-800 text-sm">
                    {formatRupiah(p.amount)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="h-3 w-3" />
                      <span>{p.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
