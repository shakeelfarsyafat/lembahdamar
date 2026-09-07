"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/whatsapp";

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  categoryName: string;
  pricePerDay: number;
  quantity: number;
  durationDays?: number;
}

export function FloatingCartBar() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

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

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const days = item.durationDays && item.durationDays > 0 ? item.durationDays : 1;
      return sum + item.pricePerDay * item.quantity * days;
    }, 0);
  }, [cart]);

  if (!mounted || cart.length === 0) {
    return null;
  }

  return (
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

      <Link
        href="/booking"
        className="inline-flex items-center space-x-2 bg-[#FF5524] hover:bg-[#E04618] text-white px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:scale-105 shrink-0 cursor-pointer"
      >
        <span>Lanjut ke Pembayaran</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
