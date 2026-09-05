"use client";

import { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Phone, Store, CreditCard, Shield } from "lucide-react";

interface SettingData {
  storeName: string;
  logoUrl?: string | null;
  description?: string | null;
  address?: string | null;
  waNumber: string;
  email?: string | null;
  instagram?: string | null;
  operationalHours?: string | null;
  bankDetails?: string | null;
  qrisImage?: string | null;
  rentalTerms?: string | null;
  cancellationPolicy?: string | null;
  lateFeePerDay: number;
  damageFeeTerms?: string | null;
}

export function SettingsForm({ initialData }: { initialData?: SettingData | null }) {
  const [storeName, setStoreName] = useState(initialData?.storeName || "Lembah Damar Outdoor");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [description, setDescription] = useState(
    initialData?.description || "Penyewaan alat camping & outdoor terpercaya di Bogor"
  );
  const [address, setAddress] = useState(
    initialData?.address || "Jl. Raya Puncak KM 77, Cisarua, Bogor, Jawa Barat"
  );
  const [waNumber, setWaNumber] = useState(initialData?.waNumber || "6281563105682");
  const [email, setEmail] = useState(initialData?.email || "info@lembahdamaroutdoor.com");
  const [instagram, setInstagram] = useState(initialData?.instagram || "@lembahdamar_outdoor");
  const [operationalHours, setOperationalHours] = useState(
    initialData?.operationalHours || "Setiap Hari: 07.00 - 21.00 WIB"
  );
  const [bankDetails, setBankDetails] = useState(
    initialData?.bankDetails ||
      "BCA 7890123456 a.n Lembah Damar Outdoor\nMandiri 1330098765432 a.n Lembah Damar Outdoor"
  );
  const [qrisImage, setQrisImage] = useState(initialData?.qrisImage || "");
  const [rentalTerms, setRentalTerms] = useState(
    initialData?.rentalTerms ||
      "1. Wajib menunjukkan 1 e-KTP/SIM asli saat pengambilan.\n2. Pembayaran DP minimal 50% saat konfirmasi."
  );
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialData?.cancellationPolicy ||
      "H-3 DP dikembalikan 100%. H-1 DP dikembalikan 50%. Hari H DP hangus."
  );
  const [lateFeePerDay, setLateFeePerDay] = useState(initialData?.lateFeePerDay || 25000);
  const [damageFeeTerms, setDamageFeeTerms] = useState(
    initialData?.damageFeeTerms ||
      "Kerusakan ringan dikenakan biaya perbaikan. Hilang/rusak total wajib mengganti barang sejenis."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = {
        storeName,
        logoUrl,
        description,
        address,
        waNumber,
        email,
        instagram,
        operationalHours,
        bankDetails,
        qrisImage,
        rentalTerms,
        cancellationPolicy,
        lateFeePerDay: Number(lateFeePerDay),
        damageFeeTerms,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setToastMsg("Pengaturan berhasil disimpan!");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-700 animate-bounce">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Identitas Rental */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Store className="h-5 w-5 text-emerald-700" />
          <span>Profil & Identitas Rental</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Rental *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Admin *</label>
            <input
              type="text"
              required
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="Format internasional: 6281234567890"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-emerald-800"
            />
            <p className="text-[11px] text-slate-400">
              * Nomor ini yang digunakan otomatis untuk menerima booking WhatsApp customer.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Resmi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@lembahdamar_outdoor"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Jam Operasional Basecamp</label>
            <input
              type="text"
              value={operationalHours}
              onChange={(e) => setOperationalHours(e.target.value)}
              placeholder="Setiap Hari: 07.00 - 21.00 WIB"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Alamat Lengkap Toko / Basecamp</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Rekening & Pembayaran */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-emerald-700" />
          <span>Rekening Bank & QRIS</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Daftar Rekening Bank (Tampil untuk Customer)</label>
            <textarea
              rows={3}
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="BCA: 123456789 a/n Lembah Damar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">URL Gambar QRIS Pembayaran</label>
            <input
              type="url"
              value={qrisImage}
              onChange={(e) => setQrisImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Ketentuan, Denda, & Kebijakan */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-emerald-700" />
          <span>Ketentuan Penyewaan & Denda</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Ketentuan Umum Sewa</label>
            <textarea
              rows={3}
              value={rentalTerms}
              onChange={(e) => setRentalTerms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Denda Keterlambatan / Hari (Rp)</label>
            <input
              type="number"
              value={lateFeePerDay}
              onChange={(e) => setLateFeePerDay(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-rose-700"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Kebijakan Pembatalan / Refund</label>
            <textarea
              rows={2}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Ketentuan Denda Kerusakan / Barang Hilang</label>
            <textarea
              rows={2}
              value={damageFeeTerms}
              onChange={(e) => setDamageFeeTerms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all text-sm"
        >
          <Save className="h-5 w-5" />
          <span>{isSubmitting ? "Memproses..." : "Simpan Semua Pengaturan"}</span>
        </button>
      </div>
    </form>
  );
}
