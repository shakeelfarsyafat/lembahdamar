"use client";

import { useState } from "react";
import { Plus, Edit3, Trash2, Layers, Compass, CheckCircle2, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  _count: { products: number };
}

export function CategoriesManager({ categories: initialData }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialData);

  // Form dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Compass");
  const [image, setImage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openCreateModal = () => {
    setEditingCat(null);
    setName("");
    setSlug("");
    setIcon("Compass");
    setImage("");
    setErrorMsg("");
    setIsOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "Compass");
    setImage(cat.image || "");
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCat) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCat?.id,
          name,
          slug,
          icon,
          image,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kategori");

      if (editingCat) {
        setCategories(
          categories.map((c) =>
            c.id === editingCat.id ? { ...c, name, slug, icon, image } : c
          )
        );
      } else {
        setCategories([...categories, { ...data.category, _count: { products: 0 } }]);
      }

      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg">Daftar Kategori Peralatan</h2>
          <p className="text-xs text-slate-500">Total {categories.length} kategori terdaftar</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-xl">
              {editingCat ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Tenda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="tenda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Icon / Lambang</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Tent">Tent (Tenda)</option>
                  <option value="Backpack">Backpack (Carrier)</option>
                  <option value="Bed">Bed (Sleeping Bag)</option>
                  <option value="Flame">Flame (Kompor)</option>
                  <option value="Layers">Layers (Matras)</option>
                  <option value="Lightbulb">Lightbulb (Lampu)</option>
                  <option value="Utensils">Utensils (Cooking set)</option>
                  <option value="Armchair">Armchair (Kursi/Meja)</option>
                  <option value="Compass">Compass (Lainnya)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL Banner/Gambar (Opsional)</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs"
                >
                  {isSubmitting ? "Memproses..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{cat.name}</h3>
                <span className="text-xs text-slate-400 font-semibold">
                  {cat._count.products} Produk Terdaftar
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
