"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
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
  Tent,
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  categoryName: string;
  pricePerDay: number;
  quantity: number;
  startDateStr: string;
  endDateStr: string;
  durationDays: number;
  subtotal: number;
}

export function BookingClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("lembahdamar_cart");
    if (raw) {
      try {
        setCart(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("lembahdamar_cart", JSON.stringify(newCart));
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const firstItem = cart[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage("Silakan lengkapi Nama, Nomor WhatsApp, dan Alamat Anda.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: address,
        customerNotes: notes,
        startDateStr: firstItem?.startDateStr || new Date().toISOString().split("T")[0],
        endDateStr: firstItem?.endDateStr || new Date().toISOString().split("T")[0],
        durationDays: firstItem?.durationDays || 1,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          pricePerDay: item.pricePerDay,
          subtotal: item.subtotal,
        })),
        totalAmount: grandTotal,
      };

      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses booking");
      }

      // Clear cart on successful booking submission
      localStorage.removeItem("lembahdamar_cart");
      setCart([]);

      // Redirect directly to WhatsApp
      window.open(data.waLink, "_blank");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat membuat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Memuat data keranjang...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-[#FDF3EE] text-[#D96C3F] rounded-full flex items-center justify-center mx-auto border border-[#D96C3F]/20">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#1C1C1C]">Keranjang Sewa Kosong</h1>
        <p className="text-stone-600 text-base max-w-md mx-auto leading-relaxed">
          Anda belum memilih perlengkapan outdoor untuk disewa. Silakan lihat katalog produk kami.
        </p>
        <div>
          <Link
            href="/katalog"
            className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-md"
          >
            <span>Buka Katalog Produk</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28 sm:pb-16 space-y-8 sm:space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
          Checkout & Booking
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight mt-1">
          Ringkasan & Form Penyewaan
        </h1>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
            <h2 className="font-extrabold text-[#1C1C1C] text-base sm:text-lg border-b border-[#EFECE6] pb-3 flex items-center justify-between">
              <span>Daftar Barang Dipesan</span>
              <span className="text-xs text-[#D96C3F] font-bold bg-[#FDF3EE] px-3 py-1 rounded-full border border-[#D96C3F]/20">
                {cart.length} Jenis Barang
              </span>
            </h2>

            {/* Rental Period Badge */}
            {firstItem && (
              <div className="bg-[#1C1C1C] text-white p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#D96C3F] shrink-0" />
                  <span className="truncate">
                    {firstItem.startDateStr} s/d {firstItem.endDateStr}
                  </span>
                </div>
                <span className="font-extrabold text-[#D96C3F] bg-[#282828] px-2.5 sm:px-3 py-1 rounded-xl border border-[#383838] shrink-0">
                  {firstItem.durationDays} Hari
                </span>
              </div>
            )}

            {/* Item Rows */}
            <div className="divide-y divide-[#EFECE6]">
              {cart.map((item) => (
                <div key={item.productId} className="py-4 flex items-start sm:items-center space-x-3 sm:space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-[#EFECE6] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#D96C3F] block">
                      {item.categoryName}
                    </span>
                    <h3 className="font-bold text-[#1C1C1C] text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                      {formatRupiah(item.pricePerDay)} × {item.quantity} unit × {item.durationDays} hari
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-[#1C1C1C] text-sm sm:text-base block">
                      {formatRupiah(item.subtotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center space-x-1 mt-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleBookingSubmit}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xl space-y-5"
          >
            <h2 className="font-extrabold text-[#1C1C1C] text-xl border-b border-[#EFECE6] pb-3">
              Data Penyewa
            </h2>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-[#D96C3F]" />
                <span>Nama Lengkap *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                <Phone className="h-3.5 w-3.5 text-[#D96C3F]" />
                <span>Nomor WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 085712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-[#D96C3F]" />
                <span>Email (Opsional)</span>
              </label>
              <input
                type="email"
                placeholder="Contoh: budi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-[#D96C3F]" />
                <span>Alamat Lengkap *</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Alamat domisili untuk pencatatan sewa..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                <FileText className="h-3.5 w-3.5 text-[#D96C3F]" />
                <span>Catatan Tambahan (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Jam perkiraan pengambilan / request khusus..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
              />
            </div>

            {/* Summary Calculation */}
            <div className="bg-[#1C1C1C] text-white p-5 rounded-2xl space-y-3 pt-4 border border-[#282828]">
              <div className="flex justify-between text-xs text-stone-300">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-white">{formatRupiah(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-300">
                <span>Jaminan Identitas:</span>
                <span className="font-semibold text-[#D96C3F]">1x e-KTP / SIM ASLI</span>
              </div>
              <div className="border-t border-[#383838] pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-[#D96C3F]">Estimasi Total Biaya</span>
                <span className="text-2xl font-extrabold text-[#D96C3F]">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* WhatsApp Booking Trigger Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center space-x-3 bg-[#D96C3F] hover:bg-[#C05A2E] disabled:bg-stone-300 text-white px-6 py-4 rounded-2xl font-extrabold text-base shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="h-5 w-5 fill-white" />
              <span>{isSubmitting ? "Memproses..." : "BOOKING VIA WHATSAPP"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
