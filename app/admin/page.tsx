import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { formatRupiah } from "@/lib/whatsapp";
import { DashboardHeaderActions } from "@/components/admin/dashboard-header-actions";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  Flame,
} from "lucide-react";

export const revalidate = 0; // Always fresh for admin dashboard

export default async function AdminDashboardPage() {
  const [
    totalProductsCount,
    totalBookingsCount,
    pendingBookingsCount,
    activeBookingsCount,
    completedBookingsCount,
    paymentsSum,
    recentBookings,
    topProducts,
    allProducts,
  ] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.booking.count(),
    db.booking.count({ where: { status: "MENUNGGU" } }),
    db.booking.count({
      where: {
        status: { in: ["DIKONFIRMASI", "DIBAYAR", "SEDANG_DISEWA"] },
      },
    }),
    db.booking.count({
      where: {
        status: { in: ["SELESAI", "DIKEMBALIKAN"] },
      },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "LUNAS" },
    }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { bookingItems: { _count: "desc" } },
      include: {
        category: true,
        _count: { select: { bookingItems: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true },
      include: { category: true, images: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalRevenue = paymentsSum._sum.amount || 0;

  const statCards = [
    {
      title: "Total Produk",
      value: totalProductsCount,
      desc: "Produk aktif di katalog",
      icon: Package,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Total Booking",
      value: totalBookingsCount,
      desc: "Keseluruhan penyewaan",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Menunggu Konfirmasi",
      value: pendingBookingsCount,
      desc: "Perlu ditindaklanjuti",
      icon: Clock,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Penyewaan Aktif",
      value: activeBookingsCount,
      desc: "Sedang sewa / dikonfirmasi",
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      title: "Selesai / Dikembalikan",
      value: completedBookingsCount,
      desc: "Selesai ditransaksikan",
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      desc: "Pembayaran lunas terverifikasi",
      icon: DollarSign,
      color: "bg-emerald-900 text-white border-emerald-950",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Ikhtisar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan performa penyewaan alat outdoor Lembah Damar secara realtime.
          </p>
        </div>
        <DashboardHeaderActions products={allProducts as any} />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border shadow-xs flex items-center justify-between transition-all ${card.color}`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  {card.title}
                </span>
                <span className="text-2xl font-extrabold block">{card.value}</span>
                <span className="text-[11px] opacity-75">{card.desc}</span>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Top Rented Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Rented Products */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <span>Produk Paling Sering Disewa</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Katalog ↗
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl font-extrabold text-xs flex items-center justify-center">
                    {prod.stock} unit
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{prod.name}</h3>
                    <span className="text-[11px] text-slate-400">{prod.category.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-800 block">
                    {formatRupiah(prod.pricePerDay)}/hari
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {prod._count.bookingItems}x Disewa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual Monthly Activity Bar */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-base">
              Visual Revenue & Trend Penyewaan
            </h2>
            <span className="text-xs font-bold text-slate-400">Tahun 2026</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Target Pendapatan Bulanan (Rp 10.000.000)</span>
                <span className="text-emerald-700">{Math.round((totalRevenue / 10000000) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalRevenue / 10000000) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">
                Catatan Performa Penyewaan
              </span>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Stok tenda dome 4P dan sleeping bag paling tinggi permintaannya di akhir pekan. Pastikan mengecek status fisik alat sebelum serah terima pengembalian.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-slate-900 text-base">Pesanan Terbaru</h2>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua Pesanan ({totalBookingsCount}) ↗
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Tanggal Sewa</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.bookingCode}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold block text-slate-800">{b.customer.name}</span>
                    <span className="text-[10px] text-slate-400">{b.customer.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {new Date(b.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(b.endDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3.5 px-4 font-bold">{b.durationDays} Hari</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                    {formatRupiah(b.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === "MENUNGGU"
                          ? "bg-amber-100 text-amber-800"
                          : b.status === "DIKONFIRMASI"
                          ? "bg-blue-100 text-blue-800"
                          : b.status === "SEDANG_DISEWA"
                          ? "bg-indigo-100 text-indigo-800"
                          : b.status === "SELESAI"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
