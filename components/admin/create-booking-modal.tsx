"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/whatsapp";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Search,
  Check,
} from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  pricePerDay: number;
  stock: number;
  category?: { name: string };
  images?: { url: string }[];
}

interface SelectedItem {
  productId: string;
  productName: string;
  pricePerDay: number;
  quantity: number;
  image?: string;
}

export function CreateBookingModal({
  isOpen,
  onClose,
  products: initialProducts,
}: {
  isOpen: boolean;
  onClose: () => void;
  products?: ProductOption[];
}) {
  const router = useRouter();

  // Products catalog list
  const [productsList, setProductsList] = useState<ProductOption[]>(initialProducts || []);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Dates Form State (Default: Today & Tomorrow)
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [startDateStr, setStartDateStr] = useState(today);
  const [endDateStr, setEndDateStr] = useState(tomorrow);

  // Items Form State
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Initial Payment & Status
  const [initialStatus, setInitialStatus] = useState("DIKONFIRMASI");
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(0);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState("CASH");
  const [initialPaymentType, setInitialPaymentType] = useState("DP");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate rental duration in days
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate total rental amount
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.pricePerDay * item.quantity * durationDays,
    0
  );

  // Fetch products if not provided
  useEffect(() => {
    if (isOpen && (!initialProducts || initialProducts.length === 0)) {
      setLoadingProducts(true);
      fetch("/api/admin/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.products)) {
            setProductsList(data.products);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingProducts(false));
    }
  }, [isOpen, initialProducts]);

  // Filter catalog products by search query
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return productsList;
    const q = catalogSearch.toLowerCase();
    return productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.name.toLowerCase().includes(q))
    );
  }, [productsList, catalogSearch]);

  const handleAddProductFromCatalog = (prod: ProductOption) => {
    const existingIdx = selectedItems.findIndex((i) => i.productId === prod.id);
    const imageUrl = prod.images?.[0]?.url || "";

    if (existingIdx >= 0) {
      const updated = [...selectedItems];
      updated[existingIdx].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: prod.id,
          productName: prod.name,
          pricePerDay: prod.pricePerDay,
          quantity: 1,
          image: imageUrl,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedItem[]
    );
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setErrorMsg("Pilih minimal 1 barang dari katalog untuk disewa.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerNotes,
        startDateStr,
        endDateStr,
        durationDays,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          pricePerDay: i.pricePerDay,
          subtotal: i.pricePerDay * i.quantity * durationDays,
        })),
        totalAmount,
        initialStatus,
        initialPaymentAmount: Number(initialPaymentAmount),
        initialPaymentMethod,
        initialPaymentType,
      };

      const res = await fetch("/api/admin/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan manual");
      }

      onClose();
      router.push(`/admin/bookings/${data.bookingId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-xl">Tambah Pesanan Manual</h2>
              <p className="text-xs text-slate-500">Pilih alat langsung dari katalog dan isi data penyewa.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Customer */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-emerald-700" />
              <span>1. Informasi Customer / Penyewa</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">No. WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Alamat Lengkap Domisili *</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Raya Puncak KM 77, Cisarua, Bogor..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tanggal Sewa */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>2. Periode Sewa Peralatan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tanggal Ambil (Mulai) *</label>
                <input
                  type="date"
                  required
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tanggal Kembali (Selesai) *</label>
                <input
                  type="date"
                  required
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between border border-emerald-200">
              <span>Total Durasi Sewa:</span>
              <span className="text-sm font-extrabold">{durationDays} Hari</span>
            </div>
          </div>

          {/* Section 3: Katalog Produk Interaktif */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2">
                <Package className="h-4 w-4 text-emerald-700" />
                <span>3. Pilih Barang dari Katalog Outdoor</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800">
                {selectedItems.length} Barang Dipilih
              </span>
            </div>

            {/* Catalog Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang katalog (misal: Tenda, Carrier, Kompor)..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Catalog Grid Cards */}
            <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loadingProducts ? (
                <p className="text-xs text-slate-400 italic py-4 col-span-2 text-center">
                  Memuat katalog produk...
                </p>
              ) : filteredCatalog.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 col-span-2 text-center">
                  Tidak ada barang ditemukan.
                </p>
              ) : (
                filteredCatalog.map((prod) => {
                  const isSelected = selectedItems.some((i) => i.productId === prod.id);
                  const selectedQty = selectedItems.find((i) => i.productId === prod.id)?.quantity || 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-300"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="font-bold text-slate-900 block truncate">{prod.name}</span>
                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="font-extrabold text-emerald-800">
                            {formatRupiah(prod.pricePerDay)}/hari
                          </span>
                          <span className="text-slate-400">• Stok: {prod.stock}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center space-x-1.5 shrink-0 bg-white px-2 py-1 rounded-xl border border-emerald-300">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(prod.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-extrabold text-emerald-800 px-1">{selectedQty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(prod.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddProductFromCatalog(prod)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-[11px] flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Pilih</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Items Summary Table */}
            {selectedItems.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs space-y-0 mt-4">
                <div className="bg-slate-900 text-white px-4 py-2.5 font-bold flex justify-between items-center text-xs">
                  <span>Rincian Barang Dipilih ({selectedItems.length} Jenis)</span>
                  <span>Durasi: {durationDays} Hari</span>
                </div>
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <th className="py-2.5 px-4">Nama Peralatan</th>
                      <th className="py-2.5 px-3 text-center">Jumlah Unit</th>
                      <th className="py-2.5 px-3 text-right">Harga/Hari</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <div className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, -1)}
                              className="text-slate-600 hover:text-slate-900 font-bold"
                            >
                              -
                            </button>
                            <span className="px-1 text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, 1)}
                              className="text-slate-600 hover:text-slate-900 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">{formatRupiah(item.pricePerDay)}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-emerald-800">
                          {formatRupiah(item.pricePerDay * item.quantity * durationDays)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="h-4 w-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Initial Status & Payment */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              <span>4. Status Pesanan & Pembayaran Awal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status Pesanan *</label>
                <select
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="DIKONFIRMASI">DIKONFIRMASI (DP Terverifikasi)</option>
                  <option value="DIBAYAR">DIBAYAR (Lunas)</option>
                  <option value="SEDANG_DISEWA">SEDANG DISEWA (Diambil)</option>
                  <option value="MENUNGGU">MENUNGGU (Baru Masuk)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nominal Pembayaran Diterima (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={initialPaymentAmount}
                  onChange={(e) => setInitialPaymentAmount(Number(e.target.value))}
                  placeholder="0 jika belum ada bayar"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800"
                />
              </div>

              {initialPaymentAmount > 0 && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Jenis Bayar</label>
                    <select
                      value={initialPaymentType}
                      onChange={(e) => setInitialPaymentType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="DP">DP (Uang Muka)</option>
                      <option value="FULL">Bayar Lunas Full</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Metode Bayar</label>
                    <select
                      value={initialPaymentMethod}
                      onChange={(e) => setInitialPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="CASH">Tunai / Cash</option>
                      <option value="TRANSFER_BANK">Transfer Bank</option>
                      <option value="QRIS">QRIS</option>
                      <option value="EWALLET">E-Wallet</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Total Biaya Sewa:</span>
              <span className="text-base font-extrabold text-emerald-800">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
