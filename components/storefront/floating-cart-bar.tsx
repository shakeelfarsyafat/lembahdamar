"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  ArrowRight,
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatRupiah } from "@/lib/whatsapp";

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  categoryName: string;
  pricePerDay: number;
  quantity: number;
}

export function FloatingCartBar() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Dates state (Default today & tomorrow)
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [startDateStr, setStartDateStr] = useState(todayStr);
  const [endDateStr, setEndDateStr] = useState(tomorrowStr);

  // Customer Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Payment Success Step state
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingCode: string;
    waLink: string;
    totalAmount: number;
  } | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("lembahdamar_cart");
      if (raw) {
        setCart(JSON.parse(raw));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error("Failed to parse cart:", e);
      setCart([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart_updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cart_updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("lembahdamar_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  // Calculate duration in days
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate grand total cost
  const totalAmount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.pricePerDay * item.quantity * durationDays,
      0
    );
  }, [cart, durationDays]);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg("Mohon lengkapi Nama, No. WhatsApp, dan Alamat Anda.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        customerNotes,
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
        totalAmount,
      };

      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      // Success
      setBookingSuccess({
        bookingCode: data.bookingCode,
        waLink: data.waLink,
        totalAmount,
      });

      // Clear cart
      localStorage.removeItem("lembahdamar_cart");
      setCart([]);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat membuat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBca = () => {
    navigator.clipboard.writeText("872012345678");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  if (!mounted || (cart.length === 0 && !isOpenModal && !bookingSuccess)) {
    return null;
  }

  return (
    <>
      {/* Floating Bar at Bottom */}
      {cart.length > 0 && !isOpenModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-40 sm:w-[92%] sm:max-w-xl bg-[#183327] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#234737] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative p-2.5 bg-[#FF5524] rounded-xl text-white shrink-0 shadow-md">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#183327] text-[10px] font-black px-1.5 py-0.5 rounded-full border border-[#FF5524]">
                {totalItemsCount}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-stone-300 block truncate">
                {cart.length} Jenis Alat ({totalItemsCount} Unit)
              </span>
              <span className="text-sm sm:text-base font-black text-white block truncate">
                Estimasi: {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpenModal(true)}
            className="inline-flex items-center space-x-2 bg-[#FF5524] hover:bg-[#E04618] text-white px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Rincian & Bayar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cart & Payment Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#FF5524]/10 text-[#FF5524] rounded-2xl">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black text-stone-900 text-lg sm:text-xl">
                    {bookingSuccess ? "Instruksi Pembayaran" : "Rincian Sewa & Data Pemesan"}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {bookingSuccess
                      ? "Silakan lakukan transfer ke rekening resmi Lembah Damar"
                      : "Periksa kembali alat pilihanmu dan isi data diri pemesan"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpenModal(false);
                  setBookingSuccess(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* STEP 2: SUCCESS & PAYMENT INSTRUCTION */}
            {bookingSuccess ? (
              <div className="space-y-6 text-stone-900">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl space-y-1 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h3 className="font-black text-base">Pesanan Berhasil Dicatat!</h3>
                  <p className="text-xs text-emerald-800">
                    Kode Booking:{" "}
                    <span className="font-extrabold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                      {bookingSuccess.bookingCode}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-700 pt-1">
                    Pesanan telah otomatis masuk ke dashboard sistem pesanan admin.
                  </p>
                </div>

                {/* Bank Transfer Details (Dummy) */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-wider text-stone-700 flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-[#FF5524]" />
                    <span>Rekening Transfer Pembayaran (Dummy)</span>
                  </h4>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-600">Bank BCA</span>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-extrabold">
                        Utama
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black tracking-wider text-stone-900">
                        8720-1234-5678
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBca}
                        className="text-xs font-bold text-[#FF5524] hover:text-[#E04618] inline-flex items-center space-x-1 cursor-pointer bg-[#FF5524]/10 px-2.5 py-1 rounded-lg"
                      >
                        {copiedBank ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedBank ? "Tersalin" : "Salin No."}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">a.n. Lembah Damar Outdoor</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-600">Bank Mandiri</span>
                    </div>
                    <span className="text-base font-black tracking-wider text-stone-900 block">
                      133-00-9876543-2
                    </span>
                    <p className="text-[11px] text-stone-500">a.n. Lembah Damar Outdoor</p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-600">Total Tagihan Sewa:</span>
                    <span className="text-lg font-black text-[#FF5524]">
                      {formatRupiah(bookingSuccess.totalAmount)}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 italic">
                    * Bayar lunas atau DP 50% ({formatRupiah(Math.round(bookingSuccess.totalAmount / 2))}) untuk mengamankan stok.
                  </p>
                </div>

                {/* WA Direct Confirmation Action */}
                <div className="space-y-3 pt-2">
                  <a
                    href={bookingSuccess.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#1eb956] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    <Phone className="h-4 w-4 fill-white" />
                    <span>Konfirmasi Pemesanan via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenModal(false);
                      setBookingSuccess(null);
                    }}
                    className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-xs font-bold cursor-pointer"
                  >
                    Tutup Modal
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 1: FORM & ITEMS REVIEW */
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                {/* 1. Items List */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between border-b border-stone-200 pb-2">
                    <span>1. Barang yang Disewa ({cart.length} Jenis)</span>
                    <span className="text-[#FF5524]">{totalItemsCount} Unit Total</span>
                  </h3>

                  {cart.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-3 text-center">
                      Keranjang kosong. Silakan pilih barang di katalog.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="font-extrabold text-stone-900 block truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              {formatRupiah(item.pricePerDay)}/hari
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-xl border border-stone-300">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.productId, -1)}
                                className="p-0.5 hover:bg-stone-100 rounded text-stone-700 cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-black text-stone-900 px-1.5">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.productId, 1)}
                                className="p-0.5 hover:bg-stone-100 rounded text-stone-700 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Dates Picker */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-[#FF5524]" />
                    <span>2. Periode Sewa</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Tanggal Mulai *</label>
                      <input
                        type="date"
                        required
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Tanggal Selesai *</label>
                      <input
                        type="date"
                        required
                        value={endDateStr}
                        onChange={(e) => setEndDateStr(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>
                  </div>

                  <div className="bg-[#FF5524]/10 p-2.5 rounded-xl text-xs font-extrabold text-stone-900 flex justify-between items-center border border-[#FF5524]/20">
                    <span>Durasi Sewa:</span>
                    <span className="text-[#FF5524]">{durationDays} Hari</span>
                  </div>
                </div>

                {/* 3. Customer Info */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#FF5524]" />
                    <span>3. Data Penyewa</span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">No. WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="081234567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Alamat Domisili *</label>
                      <input
                        type="text"
                        required
                        placeholder="Jl. Raya Puncak KM 77, Cisarua, Bogor..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Catatan Tambahan (opsional)</label>
                      <input
                        type="text"
                        placeholder="Misal: Jam jemput jam 09.00 WIB..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5524]"
                      />
                    </div>
                  </div>
                </div>

                {/* Total & Submit */}
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-600">Total Biaya Sewa ({durationDays} Hari):</span>
                    <span className="text-lg font-black text-[#FF5524]">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-3.5 bg-[#FF5524] hover:bg-[#E04618] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Memproses..." : "Lanjut Pembayaran Rekening"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
