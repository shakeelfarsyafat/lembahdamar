"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  UploadCloud,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { compressImage, formatBytes } from "@/lib/image-compressor";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Images list (default empty if new product, no unsplash links!)
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i) => i.url) || []
  );

  // Uploading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Process and upload files with client-side compression
  const processAndUploadFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (filesArray.length === 0) {
      setUploadError("Pilih file foto/gambar yang valid (JPG, PNG, WEBP).");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadStatus(
          `Mengompresi foto ${i + 1}/${filesArray.length}: ${file.name} (${formatBytes(file.size)})...`
        );

        // Compress and convert to WebP directly in browser
        const compressionResult = await compressImage(file, {
          maxWidth: 1400,
          maxHeight: 1400,
          quality: 0.82,
          mimeType: "image/webp",
        });

        const compressed = compressionResult.file;
        const savings = compressionResult.savingsPercentage;

        setUploadStatus(
          `Mengunggah foto ${i + 1}/${filesArray.length}: WebP (${formatBytes(compressed.size)}, hemat ${savings}%)...`
        );

        const formData = new FormData();
        formData.append("file", compressed);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || `Gagal mengunggah foto "${file.name}"`);
        }

        newUploadedUrls.push(data.url);
      }

      setImages((prev) => [...prev, ...newUploadedUrls]);
      setUploadStatus("");
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    setImages([selected, ...remaining]);
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMsg("Wajib mengunggah minimal 1 foto produk.");
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
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Produk</span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Produk"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
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

      {/* Image Manager (Direct Upload with Auto Compress & WebP Convert) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              Foto Produk ({images.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Otomatis dikonversi ke format WebP & dikompresi agar ukuran file sangat ringan dan cepat dimuat.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto">
            Foto pertama = Foto Utama
          </span>
        </div>

        {uploadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="hidden"
            id="product-photo-upload"
          />

          <label
            htmlFor="product-photo-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isDragOver
                ? "border-emerald-600 bg-emerald-50/70 scale-[1.01]"
                : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-emerald-500"
            } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shadow-inner">
              {isUploading ? (
                <Loader2 className="h-7 w-7 animate-spin text-emerald-800" />
              ) : (
                <UploadCloud className="h-7 w-7" />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-800">
                {isUploading
                  ? "Sedang memproses & mengompresi gambar..."
                  : "Klik untuk pilih foto produk atau seret foto ke sini"}
              </p>
              <p className="text-xs text-slate-500">
                Bisa pilih banyak foto sekaligus (JPG, PNG, WEBP). Foto langsung otomatis diperkecil & dioptimasi WebP.
              </p>
            </div>

            {/* Upload status message */}
            {isUploading && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </label>
        </div>

        {/* Gallery Preview Grid */}
        {images.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-600">Daftar Foto Terunggah:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((url, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-100 transition-all ${
                      isPrimary
                        ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-slate-100">
                      <img
                        src={url}
                        alt={`Foto produk ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Primary Badge */}
                    {isPrimary ? (
                      <div className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Foto Utama</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(idx)}
                        className="absolute top-2 left-2 bg-black/70 hover:bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow"
                        title="Jadikan foto utama"
                      >
                        Set Utama
                      </button>
                    )}

                    {/* Reorder and Delete Controls */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-xl">
                      <div className="flex items-center space-x-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, -1)}
                          disabled={idx === 0}
                          className="text-white hover:text-emerald-400 p-1 rounded-md disabled:opacity-30"
                          title="Pindahkan ke kiri"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 1)}
                          disabled={idx === images.length - 1}
                          className="text-white hover:text-emerald-400 p-1 rounded-md disabled:opacity-30"
                          title="Pindahkan ke kanan"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition-colors"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-xs">
            Belum ada foto yang diunggah. Unggah minimal 1 foto produk menggunakan area di atas.
          </div>
        )}
      </div>

      {/* Checkboxes Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-6">
        <label className="flex items-center space-x-3 cursor-pointer select-none">
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

        <label className="flex items-center space-x-3 cursor-pointer select-none">
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
