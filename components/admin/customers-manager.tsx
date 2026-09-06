"use client";

import { useState, useMemo } from "react";
import { formatRupiah } from "@/lib/whatsapp";
import {
  Users,
  Phone,
  MapPin,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { InvoicePrintable } from "@/components/admin/invoice-printable";

interface CustomerBookingItem {
  id: string;
  quantity: number;
  pricePerDay: number;
  subtotal: number;
  product: { name: string };
}

interface CustomerPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  paymentDate: string | Date;
}

interface CustomerBooking {
  id: string;
  bookingCode: string;
  startDate: string | Date;
  endDate: string | Date;
  durationDays: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string | null;
  items: CustomerBookingItem[];
  payments: CustomerPayment[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    issueDate: string | Date;
    totalAmount: number;
    dpAmount: number;
    remainingAmount: number;
    status: string;
  } | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  bookings: CustomerBooking[];
}

interface CustomersManagerProps {
  customers: Customer[];
  setting?: any;
}

export function CustomersManager({ customers, setting }: CustomersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Selected invoice modal state
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId(expandedCustomerId === id ? null : id);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q) ||
        c.bookings.some((b) => b.bookingCode.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedStatusFilter === "ALL") return true;
      if (selectedStatusFilter === "LUNAS") {
        return c.bookings.some((b) => b.paymentStatus === "LUNAS");
      }
      if (selectedStatusFilter === "DP") {
        return c.bookings.some((b) => b.paymentStatus === "DP" || b.paymentStatus === "BELUM_LUNAS");
      }
      if (selectedStatusFilter === "UNPAID") {
        return c.bookings.some((b) => b.paymentStatus === "BELUM_DIBAYAR");
      }
      return true;
    });
  }, [customers, searchQuery, selectedStatusFilter]);

  const openInvoiceModal = (booking: CustomerBooking, customer: Customer) => {
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, booking.totalAmount - totalPaid);

    const invoiceData = {
      id: booking.invoice?.id || `inv-${booking.id}`,
      invoiceNumber: booking.invoice?.invoiceNumber || `INV-${booking.bookingCode}`,
      issueDate: booking.invoice?.issueDate || new Date(),
      totalAmount: booking.totalAmount,
      dpAmount: totalPaid,
      remainingAmount: remaining,
      status: booking.paymentStatus === "LUNAS" ? "PAID" : "UNPAID",
      booking: {
        bookingCode: booking.bookingCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        durationDays: booking.durationDays,
        notes: booking.notes,
        paymentStatus: booking.paymentStatus,
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
        items: booking.items,
      },
      setting: setting,
    };

    setActiveInvoice(invoiceData);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, no. WA, alamat, kode booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
          {[
            { id: "ALL", label: "Semua" },
            { id: "LUNAS", label: "Lunas" },
            { id: "DP", label: "DP / Sebagian" },
            { id: "UNPAID", label: "Belum Bayar" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedStatusFilter(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                selectedStatusFilter === btn.id
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Data Customer Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400">
            Coba ubah kata kunci pencarian atau reset filter status pembayaran.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((c) => {
            const isExpanded = expandedCustomerId === c.id;
            const totalSpent = c.bookings.reduce((sum, b) => sum + b.totalAmount, 0);

            // Determine aggregate payment status badge
            const hasLunas = c.bookings.some((b) => b.paymentStatus === "LUNAS");
            const hasUnpaid = c.bookings.some(
              (b) => b.paymentStatus === "BELUM_DIBAYAR" || b.paymentStatus === "MENUNGGU"
            );
            const hasDp = c.bookings.some(
              (b) => b.paymentStatus === "DP" || b.paymentStatus === "BELUM_LUNAS"
            );

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-emerald-300"
              >
                {/* Header Card Row */}
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                        {hasLunas && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Pernah Lunas
                          </span>
                        )}
                        {hasDp && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                            DP / Sisa
                          </span>
                        )}
                        {hasUnpaid && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                            Belum Bayar
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-semibold">
                        <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{c.phone}</span>
                        </span>
                        {c.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.email}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="line-clamp-1 max-w-xs">{c.address}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Total {c.bookings.length} Booking
                      </span>
                      <span className="font-extrabold text-emerald-800 text-sm block">
                        {formatRupiah(totalSpent)}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
                    >
                      <span>{isExpanded ? "Sembunyikan" : "Rincian & Invoice"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-6 space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                      Riwayat Transaksi & Pembayaran ({c.bookings.length} Booking)
                    </h4>

                    {c.bookings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada transaksi sewa.</p>
                    ) : (
                      <div className="space-y-3">
                        {c.bookings.map((b) => {
                          const totalPaid = b.payments.reduce((sum, p) => sum + p.amount, 0);
                          const remaining = Math.max(0, b.totalAmount - totalPaid);

                          return (
                            <div
                              key={b.id}
                              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                                    {b.bookingCode}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      b.paymentStatus === "LUNAS"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        : b.paymentStatus === "DP" || b.paymentStatus === "BELUM_LUNAS"
                                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                                        : "bg-rose-100 text-rose-800 border border-rose-300"
                                    }`}
                                  >
                                    Status Bayar: {b.paymentStatus}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {b.status}
                                  </span>
                                </div>
                                <div className="text-slate-500 space-x-3">
                                  <span>
                                    Periode: {new Date(b.startDate).toLocaleDateString("id-ID")} -{" "}
                                    {new Date(b.endDate).toLocaleDateString("id-ID")} ({b.durationDays} Hari)
                                  </span>
                                </div>
                                <p className="text-slate-600 font-medium">
                                  Barang: {b.items.map((i) => `${i.product.name} (${i.quantity}x)`).join(", ")}
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 border-slate-100 pt-2 md:pt-0">
                                <div className="text-left md:text-right space-y-0.5">
                                  <div>
                                    <span className="text-slate-400 font-bold">Total Biaya: </span>
                                    <span className="font-extrabold text-slate-900">
                                      {formatRupiah(b.totalAmount)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold">Terbayar: </span>
                                    <span className="font-extrabold text-emerald-700">
                                      {formatRupiah(totalPaid)}
                                    </span>
                                    {remaining > 0 && (
                                      <span className="text-rose-600 font-bold ml-2">
                                        (Sisa {formatRupiah(remaining)})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => openInvoiceModal(b, c)}
                                  className="inline-flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all shrink-0"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>Lihat & Cetak Invoice</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200 relative print:max-h-none print:shadow-none print:border-none print:p-0">
            {/* Modal Header Bar (Hidden on Print) */}
            <div className="no-print flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-700" />
                <span>Invoice Resmi #{activeInvoice.invoiceNumber}</span>
              </h3>
              <button
                onClick={() => setActiveInvoice(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Invoice Component */}
            <InvoicePrintable invoice={activeInvoice} />
          </div>
        </div>
      )}
    </div>
  );
}
