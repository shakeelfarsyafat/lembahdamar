"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Package, ShoppingBag } from "lucide-react";
import { CreateBookingModal } from "@/components/admin/create-booking-modal";

export function DashboardHeaderActions({ products }: { products?: any[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CreateBookingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        products={products}
      />

      <button
        onClick={() => setShowCreateModal(true)}
        className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>Tambah Pesanan</span>
      </button>

      <Link
        href="/admin/products/new"
        className="inline-flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
      >
        <Package className="h-4 w-4 text-emerald-700" />
        <span>+ Tambah Produk</span>
      </Link>

      <Link
        href="/admin/bookings"
        className="inline-flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
      >
        <ShoppingBag className="h-4 w-4 text-slate-500" />
        <span>Kelola Booking</span>
      </Link>
    </div>
  );
}
