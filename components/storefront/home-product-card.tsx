"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import { Check, Plus } from "lucide-react";

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

export function HomeProductCard({ product }: { product: Product }) {
  const [isAdded, setIsAdded] = useState(false);

  const primaryImg =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;

    let cart: any[] = [];
    try {
      const raw = localStorage.getItem("lembahdamar_cart");
      if (raw) cart = JSON.parse(raw);
    } catch (err) {}

    const existingIdx = cart.findIndex((item: any) => item.productId === product.id);
    if (existingIdx > -1) {
      cart[existingIdx].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: primaryImg,
        categoryName: product.category.name,
        pricePerDay: product.pricePerDay,
        quantity: 1,
      });
    }

    localStorage.setItem("lembahdamar_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 sm:space-y-4 group">
      <div className="space-y-2 sm:space-y-3">
        {/* Image Header with Badge Overlay */}
        <Link href={`/produk/${product.slug}`} className="block relative h-32 sm:h-48 w-full rounded-lg sm:rounded-xl overflow-hidden bg-stone-100">
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md backdrop-blur-xs max-w-[100px] truncate">
            {product.category.name}
          </div>
          {product.stock > 0 ? (
            <div className="absolute top-2 right-2 bg-emerald-900/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md">
              Stok: {product.stock}
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-rose-900/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Habis
            </div>
          )}
        </Link>

        {/* Content */}
        <div>
          <Link href={`/produk/${product.slug}`}>
            <h3 className="font-extrabold text-stone-900 text-xs sm:text-base group-hover:text-[#FF5524] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="hidden sm:block text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <p className="text-xs sm:text-sm font-black text-[#FF5524] mt-1 sm:mt-2">
            {formatRupiah(product.pricePerDay)}/hari
          </p>
        </div>
      </div>

      {/* CTA Action Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-1 sm:space-x-1.5 cursor-pointer ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-[#FF5524] hover:bg-[#E04618] text-white"
          } disabled:opacity-50`}
        >
          {isAdded ? (
            <>
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Sewa</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Sewa</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
