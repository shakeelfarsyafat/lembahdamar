"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/whatsapp";
import { Search, Filter, ArrowUpDown, ChevronRight, Tent, Tag, Plus, ShoppingBag, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  url: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  pricePerDay: number;
  stock: number;
  description: string;
  isPopular: boolean;
  category: Category;
  images: ProductImage[];
}

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

export function CatalogView({ products, categories, initialCategory }: CatalogViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular");
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category.slug === selectedCategory;
        const matchesPrice = p.pricePerDay <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price-desc") return b.pricePerDay - a.pricePerDay;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, search, selectedCategory, maxPrice, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startDateStr = today.toISOString().split("T")[0];
    const endDateStr = tomorrow.toISOString().split("T")[0];
    const durationDays = 1;
    const primaryImg =
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";

    let cart: any[] = [];
    try {
      const raw = localStorage.getItem("lembahdamar_cart");
      if (raw) cart = JSON.parse(raw);
    } catch (err) {}

    const existingIdx = cart.findIndex((item: any) => item.productId === product.id);
    if (existingIdx > -1) {
      cart[existingIdx].quantity += 1;
      cart[existingIdx].subtotal =
        cart[existingIdx].quantity * cart[existingIdx].pricePerDay * cart[existingIdx].durationDays;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: primaryImg,
        categoryName: product.category.name,
        pricePerDay: product.pricePerDay,
        quantity: 1,
        startDateStr,
        endDateStr,
        durationDays,
        subtotal: product.pricePerDay * durationDays,
      });
    }

    localStorage.setItem("lembahdamar_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));

    // Toast Feedback
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28 sm:pb-16 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1C1C1C] text-white p-6 sm:p-12 rounded-3xl relative overflow-hidden shadow-xl border border-[#282828]">
        <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
            Katalog Sewa Outdoor
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Semua Peralatan Camping
          </h1>
          <p className="text-[#F7F5F0]/80 text-xs sm:text-base leading-relaxed">
            Pilih perlengkapan gunung sesuai kebutuhan pendakianmu. Dapatkan tarif sewa harian terbaik dan kualitas terjamin.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Tent className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-xs space-y-5 sm:space-y-6">
        {/* Search & Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Bar */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari produk sewa (misal: Tenda, Carrier, Kompor)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#F7F5F0] border border-[#EFECE6] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
            />
          </div>

          {/* Sorting */}
          <div className="md:col-span-4 relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-[#F7F5F0] border border-[#EFECE6] rounded-xl text-xs sm:text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D96C3F] focus:bg-white appearance-none transition-all"
            >
              <option value="popular">Urutkan: Terpopuler</option>
              <option value="price-asc">Harga: Terendah ke Tertinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Terendah</option>
              <option value="name">Nama: A - Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider block">
            Filter Kategori
          </span>
          <div className="flex overflow-x-auto pb-1 gap-2 sm:flex-wrap no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#D96C3F] text-white shadow-xs"
                  : "bg-[#F7F5F0] text-stone-700 hover:bg-[#EFECE6]"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "bg-[#D96C3F] text-white shadow-xs"
                    : "bg-[#F7F5F0] text-stone-700 hover:bg-[#EFECE6]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="pt-2 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full max-w-xs">
            <Tag className="h-4 w-4 text-[#D96C3F] shrink-0" />
            <div className="w-full">
              <div className="flex justify-between text-xs font-bold text-stone-600 mb-1">
                <span>Maksimal Harga / Hari:</span>
                <span className="text-[#D96C3F] font-extrabold">{formatRupiah(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#D96C3F] cursor-pointer"
              />
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Menampilkan <span className="font-extrabold text-[#1C1C1C]">{filteredProducts.length}</span> produk
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#EFECE6] space-y-4">
          <div className="w-16 h-16 bg-[#FDF3EE] text-[#D96C3F] rounded-full flex items-center justify-center mx-auto">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1C]">Tidak ada produk ditemukan</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau atur ulang filter kategori dan batas harga.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setMaxPrice(100000);
            }}
            className="inline-flex items-center space-x-2 text-xs font-bold bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-5 py-2.5 rounded-xl transition-all"
          >
            <span>Reset All Filter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const primaryImg =
              product.images.find((img) => img.isPrimary)?.url ||
              product.images[0]?.url ||
              "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {product.category.name}
                  </div>
                  {product.stock > 0 ? (
                    <div className="absolute top-2.5 right-2.5 bg-white/95 text-[#FF5524] text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs">
                      Stok: {product.stock}
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 bg-rose-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      Stok Habis
                    </div>
                  )}
                </div>

                {/* Info & Price */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm sm:text-base group-hover:text-[#FF5524] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 block">Sewa / Hari</span>
                      <span className="text-sm sm:text-base font-black text-[#FF5524]">
                        {formatRupiah(product.pricePerDay)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Link
                        href={`/produk/${product.slug}`}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0"
                        title="Lihat Detail Produk"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={product.stock <= 0}
                        className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl font-black text-xs shadow-xs transition-all cursor-pointer shrink-0 ${
                          addedItemIds.includes(product.id)
                            ? "bg-emerald-600 text-white"
                            : "bg-[#FF5524] hover:bg-[#E04618] disabled:bg-stone-300 text-white"
                        }`}
                      >
                        {addedItemIds.includes(product.id) ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>+ Sewa</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>+ Sewa</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
