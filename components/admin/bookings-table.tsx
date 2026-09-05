"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import { Search, Filter, Eye, Calendar, User, Phone, CheckCircle2 } from "lucide-react";

interface Customer {
  name: string;
  phone: string;
}

interface Booking {
  id: string;
  bookingCode: string;
  startDate: string | Date;
  endDate: string | Date;
  durationDays: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  customer: Customer;
  _count: { items: number };
}

export function BookingsTable({ bookings: initialData }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.phone.includes(search);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DIKONFIRMASI":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DIBAYAR":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "SEDANG_DISEWA":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DIKEMBALIKAN":
      case "SELESAI":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DIBATALKAN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode booking, nama customer, WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-52 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Status Booking</option>
            <option value="MENUNGGU">MENUNGGU</option>
            <option value="DIKONFIRMASI">DIKONFIRMASI</option>
            <option value="DIBAYAR">DIBAYAR</option>
            <option value="SEDANG_DISEWA">SEDANG DISEWA</option>
            <option value="DIKEMBALIKAN">DIKEMBALIKAN</option>
            <option value="SELESAI">SELESAI</option>
            <option value="DIBATALKAN">DIBATALKAN</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total <span className="font-extrabold text-slate-900">{filteredBookings.length}</span> Pesanan
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-4 px-6">Kode Booking</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Periode Sewa</th>
                <th className="py-4 px-4">Durasi</th>
                <th className="py-4 px-4">Total Biaya</th>
                <th className="py-4 px-4">Status Booking</th>
                <th className="py-4 px-4">Pembayaran</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900">{b.bookingCode}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{b.customer.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{b.customer.phone}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="block text-slate-800">
                      {new Date(b.startDate).toLocaleDateString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      s/d {new Date(b.endDate).toLocaleDateString("id-ID")}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{b.durationDays} Hari</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-800">
                    {formatRupiah(b.totalAmount)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        b.paymentStatus === "LUNAS"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : b.paymentStatus === "DP"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detail</span>
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
