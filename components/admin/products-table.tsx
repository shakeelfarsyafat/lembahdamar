"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/whatsapp";
import { Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Category {
  id: string;
  name: string;
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
  isActive: boolean;
  isPopular: boolean;
  category: Category;
  images: ProductImage[];
}

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
}

export function ProductsTable({ products: initialProducts, categories }: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.category.id === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const updatedStatus = !product.isActive;
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.category.id,
          pricePerDay: product.pricePerDay,
          stock: product.stock,
          description: "Updated status",
          isActive: updatedStatus,
          isPopular: product.isPopular,
          images: product.images.map((i) => i.url),
        }),
      });

      if (res.ok) {
        setProducts(
          products.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p))
        );
      }
    } catch (e) {
      console.error("Toggle status failed:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">Hapus Produk?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini tidak dapat dibatalkan. Data produk akan dihapus permanen.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/admin/products/new"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-4 px-6">Produk</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Harga / Hari</th>
                <th className="py-4 px-4">Stok</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredProducts.map((product) => {
                const primaryImg =
                  product.images.find((i) => i.isPrimary)?.url ||
                  product.images[0]?.url ||
                  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80";

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={primaryImg}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            slug: {product.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      {product.category.name}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                      {formatRupiah(product.pricePerDay)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {product.stock} Unit
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors inline-block"
                        title="Edit Produk"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
