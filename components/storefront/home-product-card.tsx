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
    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Image Header with Badge Overlay */}
        <Link href={`/produk/${product.slug}`} className="block relative h-48 w-full rounded-xl overflow-hidden bg-stone-100">
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
            {product.category.name}
          </div>
          {product.stock > 0 ? (
            <div className="absolute top-2.5 right-2.5 bg-emerald-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Stok: {product.stock}
            </div>
          ) : (
            <div className="absolute top-2.5 right-2.5 bg-rose-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Habis
            </div>
          )}
        </Link>

        {/* Content */}
        <div>
          <Link href={`/produk/${product.slug}`}>
            <h3 className="font-extrabold text-stone-900 text-base group-hover:text-[#FF5524] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <p className="text-sm font-black text-stone-900 mt-2">
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
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-[#FF5524] hover:bg-[#E04618] text-white"
          } disabled:opacity-50`}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4" />
              <span>Ditambahkan!</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Sewa Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
