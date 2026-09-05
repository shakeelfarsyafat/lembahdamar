"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

interface Customer {
  name: string;
  phone: string;
  email?: string | null;
  address: string;
}

interface Product {
  name: string;
}

interface BookingItem {
  id: string;
  quantity: number;
  pricePerDay: number;
  subtotal: number;
  product: Product;
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  paymentDate: string | Date;
  notes?: string | null;
}

interface StatusHistory {
  id: string;
  status: string;
  notes?: string | null;
  createdAt: string | Date;
}

interface BookingDetail {
  id: string;
  bookingCode: string;
  startDate: string | Date;
  endDate: string | Date;
  durationDays: number;
  subtotal: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string | null;
  customer: Customer;
  items: BookingItem[];
  payments: Payment[];
  statusHistories: StatusHistory[];
  invoice?: { id: string; invoiceNumber: string } | null;
}

export function BookingDetailClient({ booking: initialBooking }: { booking: BookingDetail }) {
  const [booking, setBooking] = useState(initialBooking);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Payment form state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(booking.totalAmount);
  const [payMethod, setPayMethod] = useState("TRANSFER_BANK");
  const [payType, setPayType] = useState("DP");
  const [payNotes, setPayNotes] = useState("");
  const [isRecordingPay, setIsRecordingPay] = useState(false);

  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingPay = Math.max(0, booking.totalAmount - totalPaid);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/bookings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          status: selectedStatus,
          notes: statusNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBooking({
          ...booking,
          status: selectedStatus,
          statusHistories: [
            ...booking.statusHistories,
            {
              id: Date.now().toString(),
              status: selectedStatus,
              notes: statusNotes || "Status diubah manual",
              createdAt: new Date(),
            },
          ],
        });
        setStatusNotes("");
        setToastMsg("Status booking berhasil diperbarui!");
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecordingPay(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          paymentType: payType,
          notes: payNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBooking({
          ...booking,
          paymentStatus: data.bookingPaymentStatus,
          payments: [...booking.payments, data.payment],
        });
        setShowPaymentModal(false);
        setToastMsg("Pembayaran berhasil dicatat!");
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecordingPay(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-700 animate-bounce">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/bookings"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{booking.bookingCode}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dibuat untuk {booking.customer.name} ({booking.customer.phone})
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {booking.invoice && (
            <Link
              href={`/admin/invoices/${booking.invoice.id}`}
              className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Invoice</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Rental Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
              <User className="h-5 w-5 text-emerald-700" />
              <span>Data Penyewa</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Nama Lengkap:</span>
                <span className="font-extrabold text-slate-900 text-sm">{booking.customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">No. WhatsApp:</span>
                <span className="font-extrabold text-slate-900 text-sm">{booking.customer.phone}</span>
              </div>
              {booking.customer.email && (
                <div>
                  <span className="text-slate-400 font-bold block">Email:</span>
                  <span className="font-semibold text-slate-800">{booking.customer.email}</span>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-bold block">Alamat Domisili:</span>
                <span className="font-medium text-slate-700 leading-relaxed">
                  {booking.customer.address}
                </span>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-bold block">Catatan Customer:</span>
                  <span className="text-amber-900">{booking.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Rincian Barang Sewa ({booking.durationDays} Hari)
            </h2>

            <div className="divide-y divide-slate-100">
              {booking.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {item.product.name}
                    </span>
                    <span className="text-slate-500">
                      {formatRupiah(item.pricePerDay)} × {item.quantity} unit × {booking.durationDays} hr
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 pt-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-white">{formatRupiah(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Biaya Sewa:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatRupiah(booking.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 border-t border-slate-800 pt-2">
                <span>Sudah Dibayar:</span>
                <span className="font-bold text-cyan-400">{formatRupiah(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Sisa Pembayaran:</span>
                <span className="font-bold text-rose-400">{formatRupiah(remainingPay)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater & Payment Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Changer Card */}
          <form
            onSubmit={handleUpdateStatus}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
          >
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Ubah Status Booking
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pilih Status Baru</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="MENUNGGU">MENUNGGU (Baru Masuk)</option>
                  <option value="DIKONFIRMASI">DIKONFIRMASI (DP Terverifikasi)</option>
                  <option value="DIBAYAR">DIBAYAR (Lunas)</option>
                  <option value="SEDANG_DISEWA">SEDANG DISEWA (Diambil Customer)</option>
                  <option value="DIKEMBALIKAN">DIKEMBALIKAN (Barang Kembali)</option>
                  <option value="SELESAI">SELESAI (Transaksi Tutup)</option>
                  <option value="DIBATALKAN">DIBATALKAN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Perubahan</label>
                <input
                  type="text"
                  placeholder="Catatan internal / alasan perubahan..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-xs"
              >
                {isUpdating ? "Memperbarui..." : "Update Status Pesanan"}
              </button>
            </div>
          </form>

          {/* Payments Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-emerald-700" />
                <span>Riwayat Pembayaran</span>
              </h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all inline-flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Catat Bayar</span>
              </button>
            </div>

            {booking.payments.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Belum ada catatan pembayaran manual.
              </p>
            ) : (
              <div className="space-y-2.5">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {p.paymentType} - {p.paymentMethod}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <span className="font-extrabold text-emerald-800">
                      {formatRupiah(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-emerald-700" />
              <span>Riwayat Status</span>
            </h2>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-100">
              {booking.statusHistories.map((h) => (
                <div key={h.id} className="relative space-y-0.5">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-4 ring-white" />
                  <span className="text-xs font-bold text-slate-800 block">{h.status}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(h.createdAt).toLocaleString("id-ID")}
                  </span>
                  {h.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-1">
                      {h.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Record Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-xl">Catat Pembayaran Manual</h3>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jumlah Pembayaran (Rp) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jenis Pembayaran *</label>
                <select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold"
                >
                  <option value="DP">DP (Uang Muka)</option>
                  <option value="SISA">Pelunasan Sisa</option>
                  <option value="FULL">Bayar Lunas Full</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Metode Pembayaran *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold"
                >
                  <option value="TRANSFER_BANK">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                  <option value="CASH">Tunai / Cash</option>
                  <option value="EWALLET">E-Wallet (GoPay/OVO/ShopeePay)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Catatan Bukti (Opsional)</label>
                <input
                  type="text"
                  placeholder="No. Reff m-banking / bukti tunai..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPay}
                  className="flex-1 py-3 bg-emerald-800 text-white font-bold rounded-xl text-xs"
                >
                  {isRecordingPay ? "Menyimpan..." : "Simpan Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
