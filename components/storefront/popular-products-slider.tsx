"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeProductCard } from "./home-product-card";

interface Product {
  id: string;
  name: string;
  slug: string;
  pricePerDay: number;
  stock: number;
  description: string;
  category: { name: string };
  images: { url: string; isPrimary?: boolean }[];
}

export function PopularProductsSlider({ products }: { products: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header dengan Title dan Tombol Navigasi Scroll */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-stone-900 tracking-wider uppercase">
          PRODUK POPULER
        </h2>

        {/* Tombol Panah Kiri & Kanan */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors shadow-xs cursor-pointer"
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors shadow-xs cursor-pointer"
            aria-label="Scroll ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Satu Baris Scrollable Horizontal Card (Awal 5 Card pada Desktop) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 -mx-2 px-2 no-scrollbar scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[175px] sm:w-[210px] md:w-[220px] lg:w-[calc(20%-13px)] shrink-0 snap-start"
          >
            <HomeProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
