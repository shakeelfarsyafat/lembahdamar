"use client";

import { useState, useEffect } from "react";
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
  startDateStr: string;
  endDateStr: string;
  durationDays: number;
  subtotal: number;
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

  if (!mounted || cart.length === 0) {
    return null;
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = cart.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-50 sm:w-[92%] sm:max-w-xl bg-[#1C1C1C]/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-[#383838] flex items-center justify-between gap-2.5 transition-all duration-300">
      <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        <div className="relative p-2 sm:p-2.5 bg-[#D96C3F] rounded-xl text-white shrink-0 shadow-md">
          <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="absolute -top-1.5 -right-1.5 bg-white text-[#1C1C1C] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-[#D96C3F]">
            {totalItems}
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-[#D96C3F] block leading-tight truncate">
            {totalItems} Barang di Keranjang
          </span>
          <span className="text-xs sm:text-base font-extrabold text-white block truncate">
            {formatRupiah(totalCost)}
          </span>
        </div>
      </div>

      <Link
        href="/booking"
        className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
      >
        <span>Lihat Keranjang</span>
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Link>
    </div>
  );
}
