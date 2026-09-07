"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Eye,
  Edit3,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export interface ArticleData {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  author: string;
  isPublished: boolean;
  isFeatured: boolean;
}

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ArticleData | null;
}

export function ArticleFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ArticleFormModalProps) {
  const [formData, setFormData] = useState<ArticleData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "#WARTA RIMBA",
    author: "Admin Lembah Damar",
    isPublished: true,
    isFeatured: false,
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        slug: initialData.slug || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        coverImage: initialData.coverImage || "",
        category: initialData.category || "#WARTA RIMBA",
        author: initialData.author || "Admin Lembah Damar",
        isPublished: initialData.isPublished ?? true,
        isFeatured: initialData.isFeatured ?? false,
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        category: "#WARTA RIMBA",
        author: "Admin Lembah Damar",
        isPublished: true,
        isFeatured: false,
      });
    }
    setErrorMsg("");
    setActiveTab("edit");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Formatting helpers for the textarea
  const applyFormat = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const selectedText = current.substring(start, end) || placeholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = current.substring(0, start) + replacement + current.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah thumbnail");

      setFormData((prev) => ({ ...prev, coverImage: json.url }));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah gambar");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Judul berita wajib diisi.");
      return;
    }
    if (!formData.content.trim()) {
      setErrorMsg("Konten isi berita wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const url = formData.id
        ? `/api/admin/articles/${formData.id}`
        : "/api/admin/articles";
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan berita.");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-black text-lg text-stone-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FF5524]" />
              {formData.id ? "Edit Berita / Artikel" : "Tulis Berita & Edukasi Baru"}
            </h3>
            <p className="text-xs text-stone-500">
              Kelola tulisan informatif, panduan outdoor, atau warta pendakian secara profesional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Judul Berita / Edukasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                    slug: prev.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  }))
                }
                placeholder="Contoh: Per September 2026, 9 Taman Nasional Ditutup..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Kategori / Tag <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="#WARTA RIMBA, #TIPS, dsb"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Author (Penulis) & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Nama Penulis / Kontributor <span className="text-stone-400 font-normal">(bisa diganti-ganti)</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Contoh: Ranger Fajar, Kang Asep, Tim Lembah Damar"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Custom URL Slug <span className="text-stone-400 font-normal">(otomatis)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="judul-artikel-berita"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#FF5524] focus:bg-white"
              />
            </div>
          </div>

          {/* Row 3: Cover Image / Thumbnail Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">
              Thumbnail / Foto Sampul Berita
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-stone-300 rounded-2xl bg-stone-50/60">
              {formData.coverImage ? (
                <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 shadow-xs">
                  <img
                    src={formData.coverImage}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full text-xs transition-colors"
                    title="Hapus gambar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-36 h-24 rounded-xl border border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-stone-400 text-xs shrink-0">
                  <Upload className="h-6 w-6 mb-1" />
                  <span>Belum ada foto</span>
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {uploadingImg ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Gambar Thumbnail</span>
                      </>
                    )}
                  </button>

                  <input
                    type="text"
                    value={formData.coverImage || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="Atau tempel URL gambar langsung..."
                    className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5524]"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  Rekomendasi rasio gambar 16:9 atau landscape tajam untuk thumbnail profesional.
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Excerpt (Ringkasan) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Ringkasan Singkat (Excerpt)
            </label>
            <textarea
              rows={2}
              value={formData.excerpt || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Tulis ringkasan 1-2 kalimat yang menarik untuk pratinjau kartu berita..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5524] focus:bg-white leading-relaxed"
            />
          </div>

          {/* Row 5: Professional Rich Editor with Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                Isi Konten Berita / Edukasi <span className="text-rose-500">*</span>
              </label>

              {/* Tab Edit vs Preview */}
              <div className="inline-flex bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "edit"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "preview"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Pratinjau</span>
                </button>
              </div>
            </div>

            {activeTab === "edit" ? (
              <div className="border border-stone-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FF5524] transition-all">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-stone-100 border-b border-stone-200">
                  <button
                    type="button"
                    title="Bold / Tebal"
                    onClick={() => applyFormat("<b>", "</b>", "Teks Tebal")}
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Italic / Miring"
                    onClick={() => applyFormat("<i>", "</i>", "Teks Miring")}
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Underline / Garis Bawah"
                    onClick={() => applyFormat("<u>", "</u>", "Garis Bawah")}
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <UnderlineIcon className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-[1px] bg-stone-300 mx-1" />

                  <button
                    type="button"
                    title="Heading 2"
                    onClick={() => applyFormat("<h3>", "</h3>", "Subjudul Utama")}
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors font-bold text-xs"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Heading 3"
                    onClick={() => applyFormat("<h4>", "</h4>", "Subjudul Kecil")}
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors font-bold text-xs"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-[1px] bg-stone-300 mx-1" />

                  <button
                    type="button"
                    title="Kutipan / Quote"
                    onClick={() =>
                      applyFormat("<blockquote>\n", "\n</blockquote>", "Tulis kutipan di sini...")
                    }
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() =>
                      applyFormat("<ul>\n  <li>", "</li>\n  <li>Poin 2</li>\n</ul>", "Poin 1")
                    }
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Tautan / Link"
                    onClick={() =>
                      applyFormat('<a href="https://" target="_blank" rel="noopener">', "</a>", "Teks Link")
                    }
                    className="p-1.5 hover:bg-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Paragraf Baru"
                    onClick={() => applyFormat("<p>", "</p>", "Tulis paragraf baru...")}
                    className="px-2 py-1 text-[10px] font-extrabold bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors ml-auto"
                  >
                    + Paragraf
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Tulis artikel dengan gaya profesional di sini. Gunakan tombol di atas untuk menebalkan, memiringkan, menambahkan subjudul, list, atau kutipan..."
                  className="w-full p-4 text-xs sm:text-sm font-sans focus:outline-none leading-relaxed bg-white text-stone-900"
                />
              </div>
            ) : (
              /* Live Preview */
              <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50 min-h-[260px] max-h-[350px] overflow-y-auto">
                <div className="text-xs font-bold uppercase tracking-wider text-[#FF5524] mb-1">
                  {formData.category}
                </div>
                <h1 className="text-xl font-black text-stone-900 mb-2 leading-snug">
                  {formData.title || "Judul Berita"}
                </h1>
                <div className="text-[11px] text-stone-500 mb-4 border-b border-stone-200 pb-2">
                  Ditulis oleh: <span className="font-bold text-stone-800">{formData.author}</span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-stone-800 text-xs sm:text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.content ||
                      "<p className='text-stone-400 italic'>Konten belum diisi...</p>",
                  }}
                />
              </div>
            )}
          </div>

          {/* Row 6: Featured & Published Status Toggles */}
          <div className="flex flex-wrap items-center gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 text-[#FF5524] rounded-md focus:ring-[#FF5524]"
              />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Jadikan Berita Utama (Featured)
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Tampil di kartu besar utama pada seksi Edukasi beranda.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-stone-900 block">Publikasikan Sekarang</span>
                <span className="text-[10px] text-stone-500 block">
                  Artikel akan langsung dapat dibaca oleh publik.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#FF5524] hover:bg-[#E04618] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Simpan Berita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
