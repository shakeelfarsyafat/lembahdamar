"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    pricePerDay: number;
    stock: number;
    description: string;
    capacity?: string | null;
    weight?: string | null;
    packageItems?: string | null;
    terms?: string | null;
    isActive: boolean;
    isPopular: boolean;
    images: { url: string }[];
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "");
  const [pricePerDay, setPricePerDay] = useState(initialData?.pricePerDay || 20000);
  const [stock, setStock] = useState(initialData?.stock || 5);
  const [description, setDescription] = useState(initialData?.description || "");
  const [capacity, setCapacity] = useState(initialData?.capacity || "");
  const [weight, setWeight] = useState(initialData?.weight || "");
  const [packageItems, setPackageItems] = useState(initialData?.packageItems || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isPopular, setIsPopular] = useState(initialData?.isPopular ?? false);

  // Image URLs list
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i) => i.url) || [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMsg("Minimal tambahkan 1 gambar produk.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = {
        id: initialData?.id,
        name,
        slug,
        categoryId,
        pricePerDay: Number(pricePerDay),
        stock: Number(stock),
        description,
        capacity,
        weight,
        packageItems,
        terms,
        isActive,
        isPopular,
        images,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Produk</span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-xs"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Produk"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Informasi Utama Produk
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Nama Produk *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Tenda Dome 4 Person Eiger"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tenda-dome-4-person-eiger"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price per day */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Harga Sewa / Hari (Rp) *</label>
            <input
              type="number"
              required
              min={0}
              value={pricePerDay}
              onChange={(e) => setPricePerDay(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Stok Unit Fisik *</label>
            <input
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi keunggulan dan spesifikasi singkat produk..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Specifications & Extras */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Spesifikasi & Aturan Penggunaan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kapasitas</label>
            <input
              type="text"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Contoh: 4 Orang + Barang"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Berat Alat</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Contoh: 3.8 kg"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Isi Paket Kelengkapan</label>
            <input
              type="text"
              value={packageItems}
              onChange={(e) => setPackageItems(e.target.value)}
              placeholder="1x Outer, 1x Inner, 2x Frame Set, 12x Pasak, Tas Carry"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Ketentuan Sewa Khusus</label>
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Contoh: Hindari kontak dengan api terbuka secara langsung."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Image Manager */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Manajemen Gambar Produk</span>
          <span className="text-xs text-slate-400 font-normal">
            Gambar pertama akan menjadi foto utama
          </span>
        </h2>

        {/* Image Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setIsSubmitting(true);
                try {
                  for (let i = 0; i < files.length; i++) {
                    const formData = new FormData();
                    formData.append("file", files[i]);
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      setImages((prev) => [...prev, data.url]);
                    }
                  }
                } catch (err) {
                  console.error("Gagal unggah gambar produk:", err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="atau tempel URL Gambar (https://...)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center space-x-1 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Gallery Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-32"
            >
              <img src={url} alt="Product image" className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Utama
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkboxes Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 rounded-md"
          />
          <span className="text-xs font-bold text-slate-800">
            Tampilkan di Katalog Customer (Status Aktif)
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPopular}
            onChange={(e) => setIsPopular(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 rounded-md"
          />
          <span className="text-xs font-bold text-slate-800">
            Tampilkan di Section Rekomendasi Terpopuler
          </span>
        </label>
      </div>
    </form>
  );
}
