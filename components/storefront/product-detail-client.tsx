"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/whatsapp";
import {
  Calendar,
  Clock,
  Package,
  Users,
  Weight,
  ShieldAlert,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ArrowRight,
  Info,
} from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  pricePerDay: number;
  stock: number;
  description: string;
  capacity?: string | null;
  weight?: string | null;
  packageItems?: string | null;
  terms?: string | null;
  category: Category;
  images: ProductImage[];
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();

  // Gallery active image state
  const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";
  const [activeImage, setActiveImage] = useState<string>(primaryImg);

  // Rental form dates (default: tomorrow to 2 days later)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split("T")[0];

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const defaultEnd = dayAfter.toISOString().split("T")[0];

  const [startDateStr, setStartDateStr] = useState<string>(defaultStart);
  const [endDateStr, setEndDateStr] = useState<string>(defaultEnd);
  const [quantity, setQuantity] = useState<number>(1);

  // Availability state
  const [availableStock, setAvailableStock] = useState<number>(product.stock);
  const [isCheckingStock, setIsCheckingStock] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Compute duration in days
  const durationDays = useMemo(() => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDateStr, endDateStr]);

  // Compute total cost
  const subtotal = useMemo(() => {
    return product.pricePerDay * quantity * durationDays;
  }, [product.pricePerDay, quantity, durationDays]);

  // Check stock availability when dates change
  useEffect(() => {
    async function checkStock() {
      if (!startDateStr || !endDateStr) return;
      setIsCheckingStock(true);
      try {
        const res = await fetch(
          `/api/availability?productId=${product.id}&startDate=${startDateStr}&endDate=${endDateStr}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailableStock(data.availableStock);
          if (quantity > data.availableStock && data.availableStock > 0) {
            setQuantity(data.availableStock);
          }
        }
      } catch (e) {
        console.error("Stock check failed:", e);
      } finally {
        setIsCheckingStock(false);
      }
    }
    checkStock();
  }, [product.id, startDateStr, endDateStr]);

  // Save to Cart
  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: activeImage,
      categoryName: product.category.name,
      pricePerDay: product.pricePerDay,
      quantity,
      startDateStr,
      endDateStr,
      durationDays,
      subtotal,
    };

    // Replace or update cart item in localStorage
    const existingCartRaw = localStorage.getItem("lembahdamar_cart");
    let cart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

    const existingIdx = cart.findIndex((item: any) => item.productId === product.id);
    if (existingIdx >= 0) {
      cart[existingIdx] = cartItem;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("lembahdamar_cart", JSON.stringify(cart));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);

    router.push("/booking");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28 sm:pb-16 space-y-8 sm:space-y-12">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1C] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#D96C3F] animate-bounce">
          <CheckCircle2 className="h-6 w-6 text-[#D96C3F] shrink-0" />
          <span className="text-sm font-bold">Produk ditambahkan ke keranjang sewa!</span>
        </div>
      )}

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative h-[280px] sm:h-[480px] w-full rounded-3xl overflow-hidden bg-[#F7F5F0] border border-[#EFECE6] shadow-md">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 bg-[#1C1C1C]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              {product.category.name}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img.url
                      ? "border-[#D96C3F] ring-2 ring-[#D96C3F]/30 scale-95"
                      : "border-[#EFECE6] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specs & Description Accordion/Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-6">
            <h3 className="font-extrabold text-[#1C1C1C] text-lg border-b border-[#EFECE6] pb-3">
              Deskripsi & Spesifikasi Produk
            </h3>

            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Spec Icons Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {product.capacity && (
                <div className="flex items-start space-x-3 bg-[#F7F5F0] p-4 rounded-2xl border border-[#EFECE6]">
                  <Users className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 block uppercase">Kapasitas</span>
                    <span className="text-xs font-bold text-[#1C1C1C]">{product.capacity}</span>
                  </div>
                </div>
              )}

              {product.weight && (
                <div className="flex items-start space-x-3 bg-[#F7F5F0] p-4 rounded-2xl border border-[#EFECE6]">
                  <Weight className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 block uppercase">Berat Alat</span>
                    <span className="text-xs font-bold text-[#1C1C1C]">{product.weight}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Package Items */}
            {product.packageItems && (
              <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
                <h4 className="text-xs font-bold text-[#1C1C1C] uppercase flex items-center space-x-2">
                  <Package className="h-4 w-4 text-[#D96C3F]" />
                  <span>Isi Paket Kelengkapan</span>
                </h4>
                <p className="text-xs text-stone-600 bg-[#FDF3EE] p-4 rounded-2xl border border-[#D96C3F]/20 leading-relaxed">
                  {product.packageItems}
                </p>
              </div>
            )}

            {/* Rental Terms */}
            {product.terms && (
              <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
                <h4 className="text-xs font-bold text-[#1C1C1C] uppercase flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-[#D96C3F]" />
                  <span>Ketentuan Penggunaan</span>
                </h4>
                <p className="text-xs text-stone-600 bg-amber-50/60 p-4 rounded-2xl border border-amber-100 leading-relaxed">
                  {product.terms}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Realtime Booking Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#D96C3F] uppercase tracking-widest block mb-1">
                Formulir Penyewaan
              </span>
              <h1 className="text-2xl font-extrabold text-[#1C1C1C] leading-tight">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="mt-4 flex items-baseline space-x-2 bg-[#FDF3EE] p-4 rounded-2xl border border-[#D96C3F]/20">
                <span className="text-3xl font-extrabold text-[#D96C3F]">
                  {formatRupiah(product.pricePerDay)}
                </span>
                <span className="text-xs font-semibold text-stone-500">/ hari</span>
              </div>
            </div>

            {/* Date-based Availability Indicator */}
            <div className="border-t border-b border-[#EFECE6] py-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 flex items-center space-x-1.5">
                  <Info className="h-4 w-4 text-[#D96C3F]" />
                  <span>Ketersediaan Periode:</span>
                </span>
                {isCheckingStock ? (
                  <span className="text-stone-400 font-medium">Mengecek stok...</span>
                ) : availableStock > 0 ? (
                  <span className="font-extrabold text-[#D96C3F] bg-[#FDF3EE] px-2.5 py-1 rounded-lg border border-[#D96C3F]/30">
                    Tersedia {availableStock} Unit
                  </span>
                ) : (
                  <span className="font-extrabold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                    Stok Penuh Pada Tanggal Ini
                  </span>
                )}
              </div>
              {availableStock < product.stock && availableStock > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Stok normal {product.stock} unit. {product.stock - availableStock} unit sedang disewa customer lain pada periode ini.
                </p>
              )}
            </div>

            {/* Date Pickers */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-[#D96C3F]" />
                    <span>Mulai Sewa</span>
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-[#D96C3F]" />
                    <span>Pengembalian</span>
                  </label>
                  <input
                    type="date"
                    value={endDateStr}
                    min={startDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#EFECE6] rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#D96C3F] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-700">Jumlah Barang</span>
                <div className="flex items-center space-x-3 bg-[#F7F5F0] p-1.5 rounded-xl border border-[#EFECE6]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs text-stone-700 font-bold hover:bg-[#EFECE6] disabled:opacity-40 flex items-center justify-center transition-all"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-extrabold text-sm text-[#1C1C1C]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs text-stone-700 font-bold hover:bg-[#EFECE6] disabled:opacity-40 flex items-center justify-center transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Realtime Cost Calculation Summary */}
            <div className="bg-[#1C1C1C] text-white p-5 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs text-stone-300">
                <span>Durasi Penyewaan:</span>
                <span className="font-bold text-white">{durationDays} Hari</span>
              </div>
              <div className="flex justify-between text-xs text-stone-300">
                <span>Perhitungan:</span>
                <span className="font-mono text-stone-200">
                  {formatRupiah(product.pricePerDay)} × {quantity} unit × {durationDays} hr
                </span>
              </div>
              <div className="border-t border-[#383838] pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#D96C3F]">Estimasi Total Biaya</span>
                <span className="text-2xl font-extrabold text-[#D96C3F]">
                  {formatRupiah(subtotal)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0 || isCheckingStock}
              className="w-full inline-flex items-center justify-center space-x-3 bg-[#D96C3F] hover:bg-[#C05A2E] disabled:bg-stone-300 text-white px-6 py-4 rounded-2xl font-extrabold text-base shadow-lg transition-all transform hover:-translate-y-0.5 disabled:transform-none"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>
                {availableStock <= 0 ? "Stok Tidak Tersedia" : "Sewa & Isi Data Booking"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
