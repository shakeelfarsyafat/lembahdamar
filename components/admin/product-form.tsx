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
  X,
  Sparkles,
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

  // Images list (default empty for new products, no external Unsplash placeholders)
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i) => i.url) || []
  );

  // Uploading states & feedback
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((cur) => (cur?.text === text ? null : cur));
    }, 5000);
  };

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

  // Process and upload files of ANY size with automatic client-side compression
  const processAndUploadFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    // Filter image files by type or extension
    const imageFiles = rawFiles.filter((f) => {
      const isImgMime = f.type.startsWith("image/");
      const isImgExt = /\.(jpe?g|png|webp|gif|svg|bmp|heic|heif|jfif)$/i.test(f.name);
      return isImgMime || isImgExt;
    });

    if (imageFiles.length === 0) {
      const err = `File yang dipilih (${rawFiles.map((f) => f.name).join(", ")}) bukan format gambar yang didukung. Gunakan JPG, PNG, WEBP, atau HEIC.`;
      setUploadError(err);
      showToast(err, "error");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const originalSizeStr = formatBytes(file.size);

        setUploadStatus(
          `Memproses foto ${i + 1}/${imageFiles.length}: "${file.name}" (${originalSizeStr})...`
        );

        // 1. Client-side compression & WebP conversion (handles any size up to 50MB+)
        const compressionResult = await compressImage(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.78,
          mimeType: "image/webp",
        });

        const compressed = compressionResult.file;
        const compressedSizeStr = formatBytes(compressed.size);
        const savings = compressionResult.savingsPercentage;

        setUploadStatus(
          `Mengunggah ${i + 1}/${imageFiles.length}: Ukuran diperkecil ${originalSizeStr} ➔ ${compressedSizeStr} (-${savings}%)...`
        );

        // 2. Send compressed file to backend upload handler
        let finalUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", compressed);

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok && data.url) {
            finalUrl = data.url;
          } else {
            // If server returned specific error (e.g. 401 session or filesystem), fallback to optimized data URL
            console.warn("Server upload notice:", data.error);
            finalUrl = compressionResult.dataUrl;
          }
        } catch (netErr: any) {
          console.warn("Network upload fallback to local WebP data URL:", netErr);
          finalUrl = compressionResult.dataUrl;
        }

        // Fallback to dataUrl if finalUrl wasn't set
        if (!finalUrl) {
          finalUrl = compressionResult.dataUrl;
        }

        newUploadedUrls.push(finalUrl);

        showToast(
          `Foto "${file.name}" berhasil dioptimasi (${originalSizeStr} ➔ ${compressedSizeStr}, hemat ${savings}%).`,
          "success"
        );
      }

      setImages((prev) => [...prev, ...newUploadedUrls]);
      setUploadStatus("");
    } catch (err: any) {
      console.error("Upload error:", err);
      const message = err.message || "Terjadi kendala saat memproses foto.";
      setUploadError(message);
      showToast(message, "error");
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
    showToast("Foto dihapus dari daftar.", "info");
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    setImages([selected, ...remaining]);
    showToast("Foto utama produk berhasil diubah!", "success");
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
      showToast("Wajib mengunggah minimal 1 foto produk sebelum menyimpan.", "error");
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
        throw new Error(data.error || "Gagal menyimpan produk ke database.");
      }

      showToast("Produk berhasil disimpan!", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 relative">
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-md p-4 rounded-2xl shadow-2xl flex items-start space-x-3 text-xs font-bold border transition-all animate-in slide-in-from-top-3 duration-300 ${
            toastMsg.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : toastMsg.type === "error"
              ? "bg-rose-900 text-white border-rose-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : toastMsg.type === "error" ? (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{toastMsg.text}</div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-white/70 hover:text-white shrink-0 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header Actions */}
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
          <span>{isSubmitting ? "Menyimpan Produk..." : "Simpan Produk"}</span>
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

      {/* Image Manager: Direct Upload with Auto WebP Convert & Zero-Failure Fallback */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-slate-900 text-lg">
                Foto Produk ({images.length})
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                Auto WebP Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pilih foto resolusi apapun (hingga 50 MB+). Foto otomatis diperkecil & dikompresi ke WebP agar hemat memori dan cepat dibuka customer.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
            Foto pertama = Foto Utama
          </span>
        </div>

        {/* Detailed Error Alert if upload failed */}
        {uploadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="font-extrabold block">Peringatan Upload:</span>
              <p className="font-normal text-rose-700">{uploadError}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadError("")}
              className="text-rose-400 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.jfif,.bmp"
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
            className={`relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
              isDragOver
                ? "border-emerald-600 bg-emerald-50/80 scale-[1.01]"
                : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/70 hover:border-emerald-500"
            } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-3 shadow-inner">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
              ) : (
                <UploadCloud className="h-8 w-8 text-emerald-700" />
              )}
            </div>

            <div className="text-center space-y-1.5 max-w-md">
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {isUploading
                  ? "Sedang mengompresi & mengunggah foto..."
                  : "Klik untuk pilih foto produk atau seret foto ke sini"}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bisa pilih banyak foto sekaligus. Ukuran file <span className="font-bold text-emerald-700">bebas (hingga 50 MB+)</span> karena langsung direkayasa kecil secara otomatis.
              </p>
            </div>

            {/* Live Progress Bar Badge */}
            {isUploading && (
              <div className="mt-4 inline-flex items-center space-x-2.5 bg-emerald-950 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg border border-emerald-800">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </label>
        </div>

        {/* Gallery Preview Grid */}
        {images.length > 0 ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Daftar Foto Produk ({images.length} foto):</span>
              <span className="text-slate-400 font-normal">Arahkan kursor untuk atur posisi atau jadikan foto utama</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((url, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={`${url.substring(0, 30)}-${idx}`}
                    className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-100 transition-all ${
                      isPrimary
                        ? "border-emerald-600 shadow-lg ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-400"
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
                      <div className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md">
                        <Star className="h-3 w-3 fill-current text-amber-300" />
                        <span>Foto Utama</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(idx)}
                        className="absolute top-2 left-2 bg-black/75 hover:bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        title="Jadikan foto utama produk"
                      >
                        Set Utama
                      </button>
                    )}

                    {/* Reorder and Delete Controls */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs p-1 rounded-xl">
                      <div className="flex items-center space-x-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, -1)}
                          disabled={idx === 0}
                          className="text-white hover:text-emerald-400 p-1 rounded-md disabled:opacity-30 transition-colors"
                          title="Geser ke kiri"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 1)}
                          disabled={idx === images.length - 1}
                          className="text-white hover:text-emerald-400 p-1 rounded-md disabled:opacity-30 transition-colors"
                          title="Geser ke kanan"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition-colors shadow"
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
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-xs flex flex-col items-center justify-center space-y-1">
            <ImageIcon className="h-6 w-6 text-slate-300" />
            <span>Belum ada foto produk yang diunggah. Silakan unggah minimal 1 foto melalui kotak di atas.</span>
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
