"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import { Mountain, Printer, ArrowLeft, Download, CheckCircle2 } from "lucide-react";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string | Date;
  totalAmount: number;
  dpAmount: number;
  remainingAmount: number;
  status: string;
  booking: {
    bookingCode: string;
    startDate: string | Date;
    endDate: string | Date;
    durationDays: number;
    notes?: string | null;
    paymentStatus: string;
    customer: {
      name: string;
      phone: string;
      email?: string | null;
      address: string;
    };
    items: {
      id: string;
      quantity: number;
      pricePerDay: number;
      subtotal: number;
      product: { name: string };
    }[];
  };
  setting?: {
    storeName: string;
    address?: string | null;
    waNumber: string;
    email?: string | null;
    rentalTerms?: string | null;
  } | null;
}

export function InvoicePrintable({ invoice }: { invoice: InvoiceData }) {
  const storeName = invoice.setting?.storeName || "Lembah Damar Outdoor";
  const storeAddress = invoice.setting?.address || "Jl. Raya Puncak KM 77, Cisarua, Bogor, Jawa Barat";
  const storeWa = invoice.setting?.waNumber || "6281563105682";
  const storeEmail = invoice.setting?.email || "info@lembahdamaroutdoor.com";
  const terms = invoice.setting?.rentalTerms || "Wajib menunjukkan e-KTP/SIM asli saat pengambilan barang.";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Action (Hidden on Print) */}
      <div className="no-print flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Invoice</span>
        </Link>

        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Struk / Download PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Body */}
      <div className="invoice-card bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8 text-slate-900">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-950 text-white p-2.5 rounded-xl">
                <Mountain className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                {storeName}
              </h1>
            </div>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">{storeAddress}</p>
            <div className="text-xs text-slate-500 space-x-3 font-semibold">
              <span>WhatsApp: +{storeWa}</span>
              <span>•</span>
              <span>Email: {storeEmail}</span>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest block">
              INVOICE RESMI PENYEWAAN
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono block">
              {invoice.invoiceNumber}
            </span>
            <span className="text-xs text-slate-500 block">
              Tanggal Terbit: {new Date(invoice.issueDate).toLocaleDateString("id-ID")}
            </span>
            <div className="pt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                  invoice.booking.paymentStatus === "LUNAS"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                STATUS: {invoice.booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Period Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider block">
              Penyewa (Customer)
            </span>
            <span className="font-extrabold text-slate-900 text-sm block">
              {invoice.booking.customer.name}
            </span>
            <span className="text-slate-700 block">
              No. WhatsApp: {invoice.booking.customer.phone}
            </span>
            <span className="text-slate-600 block leading-relaxed">
              Alamat: {invoice.booking.customer.address}
            </span>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider block">
              Periode Sewa Alat
            </span>
            <span className="font-extrabold text-slate-900 text-sm block">
              {new Date(invoice.booking.startDate).toLocaleDateString("id-ID")} s/d{" "}
              {new Date(invoice.booking.endDate).toLocaleDateString("id-ID")}
            </span>
            <span className="text-emerald-800 font-extrabold text-xs block">
              Durasi Total: {invoice.booking.durationDays} Hari
            </span>
            <span className="text-slate-500 font-mono text-[11px] block">
              Kode Booking: {invoice.booking.bookingCode}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Rincian Barang Diberikan
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-100 text-[11px] font-extrabold uppercase text-slate-600">
                <th className="py-3 px-4">Nama Peralatan</th>
                <th className="py-3 px-4 text-center">Jumlah (Qty)</th>
                <th className="py-3 px-4 text-right">Harga / Hari</th>
                <th className="py-3 px-4 text-center">Durasi</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoice.booking.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.product.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">{item.quantity} Unit</td>
                  <td className="py-3.5 px-4 text-right">{formatRupiah(item.pricePerDay)}</td>
                  <td className="py-3.5 px-4 text-center">{invoice.booking.durationDays} Hari</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Box */}
        <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-2 text-xs text-slate-600 max-w-md">
            <span className="font-extrabold text-slate-900 uppercase block">
              Ketentuan Pengembalian:
            </span>
            <p className="whitespace-pre-line leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              {terms}
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs bg-slate-900 text-white p-5 rounded-2xl">
            <div className="flex justify-between text-slate-300">
              <span>Total Biaya Sewa:</span>
              <span className="font-bold text-white">{formatRupiah(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Uang Muka (DP) / Bayar:</span>
              <span className="font-bold text-emerald-400">{formatRupiah(invoice.dpAmount)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
              <span className="font-bold text-amber-400">Sisa Tagihan Pelunasan:</span>
              <span className="text-base font-extrabold text-amber-400">
                {formatRupiah(invoice.remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div className="space-y-12">
            <span>Petugas Basecamp / Admin</span>
            <div className="font-bold text-slate-900 pt-8 border-t border-slate-300 inline-block px-8">
              ( Lembah Damar )
            </div>
          </div>
          <div className="space-y-12">
            <span>Penyewa Barang</span>
            <div className="font-bold text-slate-900 pt-8 border-t border-slate-300 inline-block px-8">
              ( {invoice.booking.customer.name} )
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
