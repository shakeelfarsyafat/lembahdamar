"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon, Building, X, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { compressImage } from "@/lib/image-compressor";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  category?: string | null;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  category?: string | null;
}

interface GalleryManagerProps {
  initialPartners: Partner[];
  initialGalleryItems: GalleryItem[];
}

export function GalleryManager({ initialPartners, initialGalleryItems }: GalleryManagerProps) {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [activeTab, setActiveTab] = useState<"partners" | "gallery">("partners");

  // Modal states
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerCategory, setPartnerCategory] = useState("Mitra Resmi");
  const [uploadingPartner, setUploadingPartner] = useState(false);

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImageUrl, setGalleryImageUrl] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Kegiatan Camping");
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (file: File): Promise<string> => {
    // Compress and convert to WebP before upload
    const compressed = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: "image/webp",
    });

    try {
      const formData = new FormData();
      formData.append("file", compressed.file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
      return compressed.dataUrl;
    } catch {
      return compressed.dataUrl;
    }
  };

  const handlePartnerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPartner(true);
    setErrorMsg("");
    try {
      const url = await handleFileUpload(file);
      setPartnerLogoUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUploadingPartner(false);
    }
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    setErrorMsg("");
    try {
      const url = await handleFileUpload(file);
      setGalleryImageUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerLogoUrl.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName,
          logoUrl: partnerLogoUrl,
          category: partnerCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah mitra");

      setPartners([data.partner, ...partners]);
      setShowPartnerModal(false);
      setPartnerName("");
      setPartnerLogoUrl("");
      setToastMsg("Logo mitra berhasil ditambahkan!");
      router.refresh();
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Yakin ingin menghapus logo mitra ini?")) return;
    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPartners(partners.filter((p) => p.id !== id));
        setToastMsg("Mitra dihapus");
        router.refresh();
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryImageUrl.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: galleryTitle,
          imageUrl: galleryImageUrl,
          description: galleryDesc,
          category: galleryCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah galeri");

      setGalleryItems([data.galleryItem, ...galleryItems]);
      setShowGalleryModal(false);
      setGalleryTitle("");
      setGalleryImageUrl("");
      setGalleryDesc("");
      setToastMsg("Foto galeri berhasil ditambahkan!");
      router.refresh();
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Yakin ingin menghapus foto galeri ini?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGalleryItems(galleryItems.filter((g) => g.id !== id));
        setToastMsg("Foto galeri dihapus");
        router.refresh();
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-emerald-700 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "partners"
                ? "bg-[#D96C3F] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Logo Mitra Kerja Sama ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "gallery"
                ? "bg-[#D96C3F] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Galeri Dokumentasi ({galleryItems.length})
          </button>
        </div>

        <div>
          {activeTab === "partners" ? (
            <button
              onClick={() => setShowPartnerModal(true)}
              className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#c25a2e] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Logo Mitra</span>
            </button>
          ) : (
            <button
              onClick={() => setShowGalleryModal(true)}
              className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#c25a2e] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Foto Galeri</span>
            </button>
          )}
        </div>
      </div>

      {/* PARTNERS TAB */}
      {activeTab === "partners" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {partners.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between items-center text-center space-y-3 group hover:border-[#D96C3F] transition-all relative"
              >
                <div className="w-full h-20 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                  <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs truncate max-w-[130px]">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">{p.category || "Mitra"}</span>
                </div>
                <button
                  onClick={() => handleDeletePartner(p.id)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 bg-white p-1 rounded-lg shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 relative group"
            >
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {g.category || "Dokumentasi"}
                </div>
                <button
                  onClick={() => handleDeleteGallery(g.id)}
                  className="absolute top-2.5 right-2.5 text-rose-600 hover:text-rose-800 bg-white p-1.5 rounded-xl shadow-md cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{g.title}</h4>
                {g.description && <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ADD PARTNER */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Building className="h-5 w-5 text-[#D96C3F]" />
                <span>Tambah Logo Mitra</span>
              </h3>
              <button onClick={() => setShowPartnerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddPartner} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Instansi / Perusahaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: EIGER Adventure"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Logo Gambar Mitra *</label>
                <div className="flex items-center space-x-2">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#D96C3F] bg-slate-50 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors text-slate-600">
                    <Upload className="h-4 w-4 text-[#D96C3F]" />
                    <span>{uploadingPartner ? "Mengunggah..." : "Pilih File dari Komputer"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Atau tempel URL gambar (https://...)"
                    value={partnerLogoUrl}
                    onChange={(e) => setPartnerLogoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                  />
                </div>
                {partnerLogoUrl && (
                  <div className="w-16 h-16 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-hidden mt-1">
                    <img src={partnerLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kategori Mitra</label>
                <input
                  type="text"
                  placeholder="Mitra Resmi / Komunitas Outdoor / Event"
                  value={partnerCategory}
                  onChange={(e) => setPartnerCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingPartner}
                  className="flex-1 py-2.5 bg-[#D96C3F] hover:bg-[#c25a2e] text-white font-extrabold rounded-xl"
                >
                  {isSubmitting ? "Simpan..." : "Simpan Mitra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD GALLERY */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-[#D96C3F]" />
                <span>Tambah Foto Galeri</span>
              </h3>
              <button onClick={() => setShowGalleryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddGallery} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Foto / Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Camping Ceria Puncak 2026"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Foto Kegiatan *</label>
                <div className="flex items-center space-x-2">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#D96C3F] bg-slate-50 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors text-slate-600">
                    <Upload className="h-4 w-4 text-[#D96C3F]" />
                    <span>{uploadingGallery ? "Mengunggah..." : "Pilih Foto dari Komputer"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Atau tempel URL gambar (https://...)"
                    value={galleryImageUrl}
                    onChange={(e) => setGalleryImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                  />
                </div>
                {galleryImageUrl && (
                  <div className="h-24 w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden mt-1">
                    <img src={galleryImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Dokumentasi sewa tenda komunitas..."
                  value={galleryDesc}
                  onChange={(e) => setGalleryDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kategori Foto</label>
                <input
                  type="text"
                  placeholder="Kegiatan Camping / Event / Basecamp"
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#D96C3F]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#D96C3F] hover:bg-[#c25a2e] text-white font-extrabold rounded-xl"
                >
                  {isSubmitting ? "Simpan..." : "Simpan Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
