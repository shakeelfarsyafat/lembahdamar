"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import {
  PaymentMethodSelector,
  PaymentAmountCard,
} from "./payment-options-view";
import { BANK_ACCOUNTS } from "@/lib/bank-accounts";
import {
  ShoppingBag,
  Trash2,
  Calendar,
  Phone,
  User,
  MapPin,
  FileText,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  categoryName: string;
  pricePerDay: number;
  quantity: number;
  startDateStr?: string;
  endDateStr?: string;
  durationDays?: number;
  subtotal?: number;
}

interface BookingSuccessData {
  bookingCode: string;
  waLink: string;
  customerName: string;
  totalAmount: number;
  transferAmount: number;
  remainingAmount: number;
  paymentMethod: "TRANSFER_BANK" | "QRIS";
  bankName: string;
  paymentStatus: string;
}

export function BookingClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dates state
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [startDateStr, setStartDateStr] = useState(todayStr);
  const [endDateStr, setEndDateStr] = useState(tomorrowStr);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER_BANK" | "QRIS" | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("bsi");
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccessData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("lembahdamar_cart");
    if (raw) {
      try {
        const parsed: CartItem[] = JSON.parse(raw);
        setCart(parsed);
        if (parsed.length > 0 && parsed[0].startDateStr) {
          setStartDateStr(parsed[0].startDateStr);
        }
        if (parsed.length > 0 && parsed[0].endDateStr) {
          setEndDateStr(parsed[0].endDateStr);
        }
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("lembahdamar_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  // Calculate duration in days
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate Grand Total
  const grandTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.pricePerDay * item.quantity * durationDays,
      0
    );
  }, [cart, durationDays]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage("Silakan lengkapi Nama Lengkap, Nomor WhatsApp, dan Alamat Anda.");
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    if (!paymentMethod) {
      setErrorMessage("Silakan klik salah satu Metode Pembayaran (Transfer Rekening Bank atau Scan QRIS) di bagian bawah.");
      const el = document.getElementById("section-pembayaran");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const selectedBank =
        BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];

      const paymentType =
        transferAmount >= grandTotal
          ? "LUNAS"
          : transferAmount > 0
          ? "DP"
          : "BELUM_BAYAR";

      const payload = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: address,
        customerNotes: notes,
        startDateStr,
        endDateStr,
        durationDays,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          pricePerDay: item.pricePerDay,
          subtotal: item.pricePerDay * item.quantity * durationDays,
        })),
        totalAmount: grandTotal,
        paymentMethod,
        bankName: paymentMethod === "TRANSFER_BANK" ? selectedBank.name : "QRIS",
        transferAmount,
        paymentType,
      };

      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses booking.");
      }

      // Clear cart
      localStorage.removeItem("lembahdamar_cart");
      setCart([]);
      window.dispatchEvent(new Event("cart_updated"));

      const successData: BookingSuccessData = {
        bookingCode: data.bookingCode,
        waLink: data.waLink,
        customerName: name,
        totalAmount: grandTotal,
        transferAmount,
        remainingAmount: Math.max(0, grandTotal - transferAmount),
        paymentMethod,
        bankName: paymentMethod === "TRANSFER_BANK" ? selectedBank.name : "QRIS",
        paymentStatus: data.paymentStatus || paymentType,
      };

      setBookingSuccess(successData);

      // Buka WhatsApp otomatis
      if (data.waLink) {
        window.open(data.waLink, "_blank");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat membuat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-stone-500 font-semibold">
        Memuat data pemesanan...
      </div>
    );
  }

  // Tampilan Berhasil / Receipt Pemesanan
  if (bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Pesanan Berhasil Dicatat & Terintegrasi
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Terima Kasih, {bookingSuccess.customerName}!
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto">
              Pesanan Anda telah otomatis tercatat di sistem admin kami dengan kode booking di bawah ini:
            </p>
          </div>

          <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-4 max-w-sm mx-auto">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
              Kode Booking Anda
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#FF5524] tracking-wider block mt-0.5">
              {bookingSuccess.bookingCode}
            </span>
          </div>

          {/* Rincian Status Pembayaran */}
          <div className="bg-stone-50 rounded-2xl p-4 text-xs space-y-2 text-left border border-stone-200 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-stone-500">Metode Pembayaran:</span>
              <span className="font-extrabold text-stone-900">
                {bookingSuccess.paymentMethod === "TRANSFER_BANK"
                  ? `Transfer Bank ${bookingSuccess.bankName}`
                  : "Scan QRIS"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Status Pembayaran:</span>
              <span
                className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                  bookingSuccess.paymentStatus === "LUNAS"
                    ? "bg-emerald-100 text-emerald-800"
                    : bookingSuccess.paymentStatus === "DP"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {bookingSuccess.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Jumlah Ditransfer:</span>
              <span className="font-extrabold text-stone-900">
                {formatRupiah(bookingSuccess.transferAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-1.5 font-bold">
              <span className="text-stone-600">Sisa Tagihan:</span>
              <span
                className={`font-black ${
                  bookingSuccess.remainingAmount === 0
                    ? "text-emerald-700"
                    : "text-rose-600"
                }`}
              >
                {formatRupiah(bookingSuccess.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={bookingSuccess.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              <Phone className="h-4 w-4 fill-white" />
              <span>Buka WhatsApp Sekarang</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/katalog"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Keranjang Kosong
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 text-[#FF5524] rounded-full flex items-center justify-center mx-auto border border-[#FF5524]/20 shadow-xs">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Keranjang Sewa Masih Kosong
        </h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Anda belum memilih perlengkapan camping outdoor untuk disewa. Silakan pilih alat yang Anda butuhkan di katalog kami.
        </p>
        <div>
          <Link
            href="/katalog"
            className="inline-flex items-center space-x-2 bg-[#FF5524] hover:bg-[#E04618] text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all shadow-md"
          >
            <span>Buka Katalog Produk</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-bold animate-shake">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="space-y-6">
        {/* ========================================================= */}
        {/* BARIS 1: RINCIAN ALAT (KIRI) & DATA PENYEWA (KANAN)       */}
        {/* Keduanya disejajarkan dan dipresisikan dengan rapi       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* SISI KIRI: Periode Tanggal & Daftar Alat Sewa */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Periode Tanggal Sewa */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#FF5524]" />
                    <span>Periode Tanggal Sewa</span>
                  </span>
                  <span className="text-xs font-black text-[#FF5524] bg-orange-50 px-3 py-1 rounded-full border border-[#FF5524]/20">
                    {durationDays} Hari Sewa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-stone-600">
                      Tanggal Ambil / Mulai:
                    </label>
                    <input
                      type="date"
                      required
                      value={startDateStr}
                      min={todayStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-stone-600">
                      Tanggal Kembali:
                    </label>
                    <input
                      type="date"
                      required
                      value={endDateStr}
                      min={startDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Daftar Perlengkapan */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#FF5524]" />
                    <span>Daftar Perlengkapan ({cart.length} Jenis)</span>
                  </span>
                  <Link
                    href="/katalog"
                    className="text-[11px] font-bold text-[#FF5524] hover:underline"
                  >
                    + Tambah Alat Lain
                  </Link>
                </div>

                {/* List Items */}
                <div className="divide-y divide-stone-100 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0 bg-stone-50"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                            {item.categoryName}
                          </span>
                          <h3 className="font-black text-stone-900 text-xs truncate">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            {formatRupiah(item.pricePerDay)} × {item.quantity} unit
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-stone-900 text-xs block">
                          {formatRupiah(item.pricePerDay * item.quantity * durationDays)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 inline-flex items-center space-x-0.5 mt-0.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Biaya Sewa di Bagian Bawah Card Kiri */}
            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
              <span className="font-bold text-stone-600">
                Total Biaya Sewa ({durationDays} Hari):
              </span>
              <span className="text-lg font-black text-[#FF5524]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* SISI KANAN: 1. Data Penyewa (Presisi Sejajar) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h2 className="font-black text-stone-900 text-sm sm:text-base border-b border-stone-100 pb-3 flex items-center space-x-2">
                <User className="h-4 w-4 text-[#FF5524]" />
                <span>1. Data Penyewa</span>
              </h2>

              <div className="space-y-3 mt-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Alamat Lengkap Domisili *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Alamat untuk verifikasi saat pengambilan alat..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Perkiraan jemput alat jam 08.00 pagi..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-stone-400 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Data penyewa tersimpan aman dan terintegrasi otomatis ke sistem verifikasi Lembah Damar.</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARIS 2: PEMBAYARAN SEWA MENYAMPING (KE SAMPING, BUKAN SCROLL) */}
        {/* KIRI: Pilihan Bank / QRIS                                 */}
        {/* KANAN: Nominal Transfer & Tombol Konfirmasi WhatsApp      */}
        {/* ========================================================= */}
        <div
          id="section-pembayaran"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
        >
          {/* SISI KIRI: 2. Metode Pembayaran Sewa (Kartu Rekening / QRIS) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-black text-stone-900 text-sm sm:text-base border-b border-stone-100 pb-3 flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-[#FF5524]" />
              <span>2. Metode Pembayaran Sewa</span>
            </h2>

            <PaymentMethodSelector
              totalAmount={grandTotal}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              selectedBankId={selectedBankId}
              onBankChange={setSelectedBankId}
              transferAmount={transferAmount}
              onTransferAmountChange={setTransferAmount}
            />
          </div>

          {/* SISI KANAN: 3. Nominal Transfer, Status Tagihan & Konfirmasi WhatsApp */}
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-black text-stone-900 text-sm sm:text-base border-b border-stone-100 pb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#FF5524]" />
                <span>3. Nominal Transfer & Tagihan</span>
              </h2>

              {paymentMethod ? (
                <PaymentAmountCard
                  totalAmount={grandTotal}
                  transferAmount={transferAmount}
                  onTransferAmountChange={setTransferAmount}
                  paymentMethod={paymentMethod}
                />
              ) : (
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-6 text-center space-y-2">
                  <CreditCard className="h-8 w-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-600">
                    Silakan klik salah satu Metode Pembayaran di samping kiri terlebih dahulu
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Pilih Transfer Rekening Bank atau Scan QRIS untuk menentukan nominal transfer (DP / Lunas).
                  </p>
                </div>
              )}
            </div>

            {/* Kotak Konfirmasi Pesanan & Kirim ke WhatsApp */}
            <div className="bg-[#183327] text-white p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl border border-[#234737]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-300">Total Biaya Sewa:</span>
                <span className="text-xl font-black text-[#FF5524]">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-300 border-t border-[#234737] pt-2">
                <span>Jaminan Identitas:</span>
                <span className="font-extrabold text-white">1x e-KTP / SIM Asli</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-[#FF5524] hover:bg-[#E04618] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Memproses & Menghubungkan ke Admin...</span>
                ) : (
                  <>
                    <Phone className="h-4 w-4 fill-white" />
                    <span>Konfirmasi & Kirim ke WhatsApp</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                Data pemesanan akan langsung tercatat otomatis di Dashboard Admin dan diarahkan ke chat WhatsApp resmi Lembah Damar Outdoor.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
