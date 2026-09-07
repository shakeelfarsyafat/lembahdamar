"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export function PartnerSlider({ partners }: { partners: Partner[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!partners || partners.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header dengan Title dan Tombol Navigasi Scroll persis seperti Produk Populer */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
          MITRA RESMI & KOMUNITAS
        </h2>

        {/* Tombol Panah Kiri & Kanan */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors shadow-xs cursor-pointer"
            aria-label="Scroll mitra ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors shadow-xs cursor-pointer"
            aria-label="Scroll mitra ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Container Scroll ke Samping */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-1 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="w-36 sm:w-48 shrink-0 bg-white hover:bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-col items-center justify-center text-center space-y-2 group hover:border-[#FF5524]/50 transition-all shadow-xs"
          >
            <div className="w-full h-14 sm:h-16 rounded-xl flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-bold text-stone-800 truncate max-w-[120px] sm:max-w-[140px] block">
              {partner.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
