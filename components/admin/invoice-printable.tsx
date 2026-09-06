"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import { Printer, ArrowLeft } from "lucide-react";

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
  const storeName = invoice.setting?.storeName || "LEMBAH DAMAR OUTDOOR";
  const storeAddress = invoice.setting?.address || "Jl. Raya Puncak KM 77, Cisarua, Bogor, Jawa Barat";
  const storeWa = invoice.setting?.waNumber || "6281563105682";
  const storeEmail = invoice.setting?.email || "info@lembahdamaroutdoor.com";
  const terms =
    invoice.setting?.rentalTerms ||
    "1. Wajib menitipkan 1 kartu identitas asli (e-KTP / SIM) saat pengambilan alat.\n2. Pemeriksaan kelengkapan alat dilakukan bersama saat serah terima & pengembalian.\n3. Keterlambatan pengembalian wajib konfirmasi terlebih dahulu kepada pihak pengelola.";

  const handlePrint = () => {
    window.print();
  };

  const formattedIssueDate = new Date(invoice.issueDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartDate = new Date(invoice.booking.startDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedEndDate = new Date(invoice.booking.endDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-4">
      {/* Strict Monochrome Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, header, aside, nav, button {
            display: none !important;
          }
          .invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Screen Navigation Bar (Hidden during print) */}
      <div className="no-print flex items-center justify-between bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <Link
          href="/admin/customers"
          className="inline-flex items-center space-x-2 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak / Simpan PDF (Hitam Putih)</span>
        </button>
      </div>

      {/* Elegant Monochrome Invoice Document */}
      <div className="invoice-sheet bg-white p-10 sm:p-14 rounded-2xl border border-neutral-300 shadow-sm text-black font-sans space-y-8">
        {/* Header: Brand & Document Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-black pb-6 gap-6">
          <div className="space-y-1.5 max-w-md">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-black">
              {storeName}
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {storeAddress}
            </p>
            <div className="text-[11px] text-neutral-700 space-x-3 pt-0.5 font-medium">
              <span>WhatsApp: +{storeWa}</span>
              <span>|</span>
              <span>Email: {storeEmail}</span>
            </div>
          </div>

          <div className="sm:text-right space-y-1.5 w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-black">
              INVOICE
            </div>
            <div className="font-mono text-xs font-bold text-neutral-800">
              No: {invoice.invoiceNumber}
            </div>
            <div className="text-xs text-neutral-600">
              Tanggal: {formattedIssueDate}
            </div>
            <div className="pt-1">
              <span className="inline-block border border-black text-black px-3 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-sm">
                STATUS: {invoice.booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info & Rental Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-b border-neutral-300 pb-6">
          {/* Bill To */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 block">
              Tagihan Kepada (Penyewa):
            </span>
            <div className="text-sm font-bold text-black">
              {invoice.booking.customer.name}
            </div>
            <div className="text-neutral-700">
              WhatsApp: {invoice.booking.customer.phone}
            </div>
            {invoice.booking.customer.email && (
              <div className="text-neutral-700">
                Email: {invoice.booking.customer.email}
              </div>
            )}
            <div className="text-neutral-600 leading-relaxed pt-0.5">
              Alamat: {invoice.booking.customer.address}
            </div>
          </div>

          {/* Rental Details */}
          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 block">
              Detail Reservasi Sewa:
            </span>
            <div className="text-xs font-mono font-bold text-black">
              Kode Booking: {invoice.booking.bookingCode}
            </div>
            <div className="text-neutral-800 font-semibold">
              Periode: {formattedStartDate} — {formattedEndDate}
            </div>
            <div className="text-black font-extrabold">
              Total Durasi: {invoice.booking.durationDays} Hari
            </div>
            {invoice.booking.notes && (
              <div className="text-neutral-600 text-[11px] italic pt-1">
                Catatan: {invoice.booking.notes}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-black uppercase text-black">
                <th className="py-2.5 px-2 w-10 text-center">No.</th>
                <th className="py-2.5 px-3">Deskripsi Peralatan</th>
                <th className="py-2.5 px-3 text-center">Jumlah</th>
                <th className="py-2.5 px-3 text-right">Tarif / Hari</th>
                <th className="py-2.5 px-3 text-center">Durasi</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {invoice.booking.items.map((item, index) => (
                <tr key={item.id} className="break-inside-avoid">
                  <td className="py-3 px-2 text-center text-neutral-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-black">
                    {item.product.name}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-black">
                    {item.quantity} Unit
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-800">
                    {formatRupiah(item.pricePerDay)}
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-700">
                    {invoice.booking.durationDays} Hari
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-black">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Terms Section */}
        <div className="border-t-2 border-black pt-5 flex flex-col sm:flex-row justify-between items-start gap-8 break-inside-avoid">
          {/* Terms & Notes (Left) */}
          <div className="space-y-2 text-xs text-neutral-700 max-w-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-black block">
              Ketentuan Sewa & Pengembalian:
            </span>
            <p className="whitespace-pre-line leading-relaxed text-[11px] text-neutral-600 border-l-2 border-neutral-300 pl-3 py-1">
              {terms}
            </p>
          </div>

          {/* Calculations (Right) */}
          <div className="w-full sm:w-72 space-y-2 text-xs border border-black p-4 rounded-none">
            <div className="flex justify-between text-neutral-700">
              <span>Total Biaya Sewa:</span>
              <span className="font-semibold text-black">{formatRupiah(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Uang Muka (DP) / Dibayar:</span>
              <span className="font-semibold text-black">{formatRupiah(invoice.dpAmount)}</span>
            </div>
            <div className="border-t border-black pt-2 mt-2 flex justify-between items-center">
              <span className="font-black text-black uppercase tracking-wider text-xs">Sisa Tagihan:</span>
              <span className="text-sm sm:text-base font-black text-black">
                {formatRupiah(invoice.remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Block */}
        <div className="pt-10 border-t border-neutral-200 grid grid-cols-2 gap-12 text-center text-xs text-neutral-700 break-inside-avoid">
          <div className="space-y-16">
            <span className="text-[11px] font-bold text-neutral-600 block uppercase tracking-wider">
              Pihak Pengelola (Admin)
            </span>
            <div>
              <div className="font-bold text-black border-t border-black pt-2 inline-block min-w-[160px]">
                ( {storeName} )
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <span className="text-[11px] font-bold text-neutral-600 block uppercase tracking-wider">
              Penyewa (Customer)
            </span>
            <div>
              <div className="font-bold text-black border-t border-black pt-2 inline-block min-w-[160px]">
                ( {invoice.booking.customer.name} )
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Footer Note */}
        <div className="text-center text-[10px] text-neutral-400 pt-4 border-t border-neutral-100 uppercase tracking-widest break-inside-avoid">
          Terima kasih telah mempercayakan peralatan petualangan Anda kepada {storeName}
        </div>
      </div>
    </div>
  );
}
