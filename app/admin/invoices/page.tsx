import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import { FileText, Eye, Printer } from "lucide-react";

export const revalidate = 0;

export default async function AdminInvoicesPage() {
  const invoices = await db.invoice.findMany({
    include: {
      booking: {
        include: { customer: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Daftar Invoice & Struk Penyewaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cetak atau lihat ringkasan invoice resmi bertanda tagihan `INV-YYYYMMDD-XXXX`.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-4 px-6">No. Invoice</th>
                <th className="py-4 px-4">Tanggal Terbit</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Total Biaya</th>
                <th className="py-4 px-4">DP / Bayar</th>
                <th className="py-4 px-4">Sisa Tagihan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900 font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-4 px-4">
                    {new Date(inv.issueDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800 block">
                      {inv.booking.customer.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {inv.booking.customer.phone}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">
                    {formatRupiah(inv.totalAmount)}
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-700">
                    {formatRupiah(inv.dpAmount)}
                  </td>
                  <td className="py-4 px-4 font-bold text-rose-600">
                    {formatRupiah(inv.remainingAmount)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="inline-flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Cetak Invoice</span>
                    </Link>
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
