"use client";

import { useState, useEffect } from "react";
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ArticleFormModal, ArticleData } from "@/components/admin/article-form-modal";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/articles?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (res.ok && json.articles) {
        setArticles(json.articles);
      }
    } catch (err) {
      console.error("Fetch articles failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [search]);

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (art: ArticleData) => {
    setSelectedArticle(art);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchArticles();
      } else {
        alert("Gagal menghapus berita.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus berita.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#FF5524] uppercase tracking-wider mb-1">
            <Newspaper className="h-4 w-4" />
            <span>Manajemen Konten</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Berita & Edukasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Tulis dan kelola artikel edukasi outdoor, warta pendakian, review gear, dan tips camping.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#FF5524] hover:bg-[#E04618] text-white px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, kategori, atau penulis..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5524] shadow-xs"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs font-bold text-stone-500 self-end sm:self-center">
          Total Artikel: <span className="text-stone-900 font-extrabold">{articles.length}</span>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-stone-400 space-y-2">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF5524]" />
            <span className="text-xs font-medium">Memuat data berita...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Newspaper className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="font-extrabold text-stone-700 text-sm">Belum ada berita</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Mulai tulis artikel edukasi pertama untuk mengedukasi pelanggan dan pendaki Lembah Damar.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tulis Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Sampul & Judul Berita</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Penulis</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Title & Cover */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {art.coverImage ? (
                            <img
                              src={art.coverImage}
                              alt={art.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <Newspaper className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {art.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black rounded-md uppercase">
                                <Sparkles className="h-2.5 w-2.5" />
                                <span>Featured</span>
                              </span>
                            )}
                            <h4 className="font-extrabold text-stone-900 text-xs truncate max-w-sm sm:max-w-md">
                              {art.title}
                            </h4>
                          </div>
                          <p className="text-stone-400 text-[10px] font-mono truncate max-w-xs">
                            /edukasi/{art.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-lg text-[10px]">
                        {art.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                        <User className="h-3.5 w-3.5 text-stone-400" />
                        <span>{art.author || "Admin"}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {art.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Publik</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-500 font-bold rounded-full text-[10px]">
                          <XCircle className="h-3 w-3" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/edukasi/${art.slug}`}
                          target="_blank"
                          title="Lihat Halaman Publik"
                          className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(art)}
                          title="Edit Berita"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => art.id && handleDelete(art.id)}
                          disabled={deletingId === art.id}
                          title="Hapus Berita"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === art.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchArticles}
        initialData={selectedArticle}
      />
    </div>
  );
}
