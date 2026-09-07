"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/whatsapp";
import { BANK_ACCOUNTS, BankAccount } from "@/lib/bank-accounts";
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  Building2,
  Download,
} from "lucide-react";

interface PaymentMethodSelectorProps {
  totalAmount: number;
  paymentMethod: "TRANSFER_BANK" | "QRIS" | null;
  onPaymentMethodChange: (method: "TRANSFER_BANK" | "QRIS") => void;
  selectedBankId: string;
  onBankChange: (bankId: string) => void;
  transferAmount: number;
  onTransferAmountChange: (amount: number) => void;
}

export function PaymentMethodSelector({
  totalAmount,
  paymentMethod,
  onPaymentMethodChange,
  selectedBankId,
  onBankChange,
  transferAmount,
  onTransferAmountChange,
}: PaymentMethodSelectorProps) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const selectedBank: BankAccount =
    BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];

  const handleCopy = (num: string, bankId: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedBank(bankId);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const halfAmount = Math.round(totalAmount / 2);

  return (
    <div className="space-y-5">
      {/* 1. Pemilihan Metode Pembayaran Awal */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
            Pilih Metode Pembayaran *
          </label>
          {paymentMethod && (
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Metode Aktif
            </span>
          )}
        </div>

        {/* 2 Opsi Card Besar yang Jelas untuk Diklik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Opsi: Rekening Bank */}
          <button
            type="button"
            onClick={() => {
              onPaymentMethodChange("TRANSFER_BANK");
              if (transferAmount === 0 && totalAmount > 0) {
                onTransferAmountChange(halfAmount);
              }
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
              paymentMethod === "TRANSFER_BANK"
                ? "border-[#FF5524] bg-orange-50/40 shadow-sm ring-2 ring-[#FF5524]/20"
                : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 shadow-xs"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-sm">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  paymentMethod === "TRANSFER_BANK"
                    ? "border-[#FF5524] bg-[#FF5524] text-white"
                    : "border-stone-300 bg-white"
                }`}
              >
                {paymentMethod === "TRANSFER_BANK" && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>
            </div>

            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-stone-900">
                Transfer Rekening Bank
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
                BSI, BCA, BRI, Mandiri
              </p>

              {/* Bank Badges */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-900 text-white">
                  BSI
                </span>
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white">
                  BCA
                </span>
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-950 text-white">
                  BRI
                </span>
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white">
                  MANDIRI
                </span>
              </div>
            </div>
          </button>

          {/* Card Opsi: Scan QRIS */}
          <button
            type="button"
            onClick={() => {
              onPaymentMethodChange("QRIS");
              if (transferAmount === 0 && totalAmount > 0) {
                onTransferAmountChange(totalAmount);
              }
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
              paymentMethod === "QRIS"
                ? "border-[#FF5524] bg-orange-50/40 shadow-sm ring-2 ring-[#FF5524]/20"
                : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 shadow-xs"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-sm">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  paymentMethod === "QRIS"
                    ? "border-[#FF5524] bg-[#FF5524] text-white"
                    : "border-stone-300 bg-white"
                }`}
              >
                {paymentMethod === "QRIS" && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>
            </div>

            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-stone-900">
                Scan QRIS Barcode
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
                Semua E-Wallet & M-Banking
              </p>

              {/* QRIS Badges */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                  QRIS RESMI
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                  GoPay / Dana / BCA
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Detail Rekening Bank: HANYA MUNCUL JIKA USER KLIK REKENING */}
      {paymentMethod === "TRANSFER_BANK" && (
        <div className="space-y-3.5 pt-3 border-t border-stone-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#FF5524]" />
              <span>Pilih Bank Tujuan</span>
            </span>
          </div>

          {/* Pilihan 4 Bank */}
          <div className="grid grid-cols-4 gap-2">
            {BANK_ACCOUNTS.map((bank) => {
              const isSelected = bank.id === selectedBank.id;
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => onBankChange(bank.id)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? "border-[#FF5524] bg-orange-50/60 shadow-xs ring-2 ring-[#FF5524]/20"
                      : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <span
                    className={`text-xs font-black uppercase ${
                      isSelected ? "text-[#FF5524]" : "text-stone-800"
                    }`}
                  >
                    {bank.name}
                  </span>
                  <span
                    className={`w-2.5 h-1 rounded-full ${
                      bank.id === "bsi"
                        ? "bg-stone-800"
                        : bank.id === "bca"
                        ? "bg-blue-600"
                        : bank.id === "bri"
                        ? "bg-blue-900"
                        : "bg-amber-500"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Kartu Bank ATM Visual Realistis */}
          <div className="relative">
            <div
              className={`w-full aspect-[1.8/1] sm:aspect-[1.95/1] rounded-3xl p-4 sm:p-6 bg-gradient-to-br ${selectedBank.cardColor.bgGradient} ${selectedBank.cardColor.border} border shadow-xl relative overflow-hidden flex flex-col justify-between text-white select-none transition-all duration-300`}
            >
              {/* Geometric Circles Texture */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-1/2 -left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

              {/* Baris Atas */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-7 sm:w-11 sm:h-8 bg-[#EAB308] rounded shadow-inner border border-amber-300/80 relative overflow-hidden p-1 flex flex-col justify-between">
                    <div className="w-full h-px bg-amber-700/60" />
                    <div className="flex justify-between w-full h-2 border-y border-amber-700/60">
                      <div className="w-1.5 border-r border-amber-700/60" />
                      <div className="w-1.5 border-l border-amber-700/60" />
                    </div>
                    <div className="w-full h-px bg-amber-700/60" />
                  </div>
                  <svg
                    className="w-4 h-4 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.5 8.5a7 7 0 0110 0m-8 3a3 3 0 016 0"
                    />
                  </svg>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-lg font-black tracking-wider uppercase block">
                    {selectedBank.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-white/70 tracking-widest block font-medium">
                    {selectedBank.fullName}
                  </span>
                </div>
              </div>

              {/* Baris Tengah */}
              <div className="z-10 my-auto py-1">
                <span className="text-[8px] sm:text-[9px] text-white/70 tracking-widest uppercase block mb-0.5">
                  Nomor Rekening
                </span>
                <div className="font-mono text-base sm:text-xl font-black tracking-[0.16em] sm:tracking-[0.2em] text-white drop-shadow-md">
                  {selectedBank.formattedNumber}
                </div>
              </div>

              {/* Baris Bawah */}
              <div className="flex items-end justify-between z-10">
                <div>
                  <span className="text-[8px] text-white/60 uppercase tracking-widest block">
                    Pemilik Rekening
                  </span>
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase block text-white/95 truncate max-w-[180px] sm:max-w-xs">
                    {selectedBank.accountHolder}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[8px] font-black tracking-widest text-white/80 mr-1 uppercase">
                    GPN
                  </span>
                  <div className="flex -space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-red-500/90 shadow-xs" />
                    <div className="w-4 h-4 rounded-full bg-amber-400/90 shadow-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Salin */}
            <div className="mt-2.5 flex items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl p-2.5 px-3.5">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-stone-500 block">
                  Rekening {selectedBank.name}:
                </span>
                <span className="text-xs font-black text-stone-900 font-mono tracking-wider truncate block">
                  {selectedBank.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(selectedBank.accountNumber, selectedBank.id)
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  copiedBank === selectedBank.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[#FF5524] hover:bg-[#E04618] text-white shadow-xs"
                }`}
              >
                {copiedBank === selectedBank.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Rekening</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detail Scan QRIS: HANYA MUNCUL JIKA USER KLIK QRIS */}
      {paymentMethod === "QRIS" && (
        <div className="space-y-3 pt-3 border-t border-stone-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                QRIS
              </span>
              <span className="text-xs font-bold text-stone-700">
                Standar Pembayaran Nasional
              </span>
            </div>

            <div className="max-w-[210px] sm:max-w-[230px] mx-auto bg-white p-2.5 rounded-2xl border border-stone-300 shadow-sm">
              <img
                src="/qris-dummy.png"
                alt="QRIS Lembah Damar Outdoor"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-black text-stone-900 block uppercase">
                Lembah Damar Outdoor
              </span>
              <p className="text-[10px] text-stone-500 leading-relaxed max-w-xs mx-auto">
                Scan via GoPay, OVO, DANA, BCA, Mandiri, BRI, atau m-Banking Anda.
              </p>
            </div>

            <div className="pt-1 flex justify-center">
              <a
                href="/qris-dummy.png"
                download="qris-lembah-damar.png"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-extrabold text-[11px] rounded-xl shadow-xs transition-all"
              >
                <Download className="h-3 w-3" />
                <span>Simpan Gambar QRIS</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PaymentAmountCardProps {
  totalAmount: number;
  transferAmount: number;
  onTransferAmountChange: (amount: number) => void;
  paymentMethod: "TRANSFER_BANK" | "QRIS" | null;
}

export function PaymentAmountCard({
  totalAmount,
  transferAmount,
  onTransferAmountChange,
  paymentMethod,
}: PaymentAmountCardProps) {
  const halfAmount = Math.round(totalAmount / 2);
  const remainingAmount = Math.max(0, totalAmount - transferAmount);
  const isLunas = transferAmount >= totalAmount && totalAmount > 0;
  const isDp = transferAmount > 0 && !isLunas;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
          Berapa Nominal yang Ditransfer? *
        </label>
        {isLunas && (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            ✓ Lunas 100%
          </span>
        )}
        {isDp && (
          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
            ✓ DP (Uang Muka)
          </span>
        )}
        {transferAmount === 0 && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            Bayar di Basecamp
          </span>
        )}
      </div>

      {/* Tombol Pilihan Instan: DP 50%, Lunas 100%, Bayar Nanti */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onClick={() => onTransferAmountChange(halfAmount)}
          className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
            transferAmount === halfAmount
              ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
          }`}
        >
          <span className="block text-[10px] text-stone-500">Bayar DP 50%</span>
          <span className="block font-black text-xs sm:text-sm mt-0.5">
            {formatRupiah(halfAmount)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTransferAmountChange(totalAmount)}
          className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
            transferAmount === totalAmount
              ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
          }`}
        >
          <span className="block text-[10px] text-stone-500">Bayar Lunas</span>
          <span className="block font-black text-xs sm:text-sm mt-0.5">
            {formatRupiah(totalAmount)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTransferAmountChange(0)}
          className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
            transferAmount === 0
              ? "border-stone-500 bg-stone-100 text-stone-900 ring-2 ring-stone-400/20"
              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
          }`}
        >
          <span className="block text-[10px] text-stone-500">Bayar Nanti</span>
          <span className="block font-black text-xs sm:text-sm mt-0.5">
            Rp 0
          </span>
        </button>
      </div>

      {/* Input Manual Nominal Rupiah */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-stone-600">
          Atau Ketik Nominal Transfer Manual (Rp):
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-500">
            Rp
          </span>
          <input
            type="number"
            min={0}
            max={totalAmount * 2}
            value={transferAmount === 0 ? "" : transferAmount}
            onChange={(e) =>
              onTransferAmountChange(Math.max(0, Number(e.target.value) || 0))
            }
            placeholder="Misal: 15000 atau 30000"
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-black text-stone-900 focus:ring-2 focus:ring-[#FF5524]"
          />
        </div>
      </div>

      {/* Ringkasan Status Pembayaran & Sisa Tagihan */}
      <div
        className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all ${
          isLunas
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : isDp
            ? "bg-blue-50 border-blue-200 text-blue-900"
            : "bg-stone-100 border-stone-200 text-stone-700"
        }`}
      >
        <div className="flex justify-between items-center font-bold">
          <span>Status Pembayaran Terdata:</span>
          <span className="font-black uppercase">
            {isLunas
              ? "✓ LUNAS"
              : isDp
              ? "✓ DP (UANG MUKA)"
              : "BELUM TRANSFER"}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-stone-600">
          <span>Nominal Ditransfer:</span>
          <span className="font-extrabold text-stone-900">
            {formatRupiah(transferAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-stone-600 border-t border-stone-200/60 pt-1">
          <span>Sisa yang Dibayar saat Ambil Alat:</span>
          <span
            className={`font-black ${
              remainingAmount === 0 ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {formatRupiah(remainingAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
