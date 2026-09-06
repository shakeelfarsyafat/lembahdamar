"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mountain, Lock, User, ArrowRight, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk. Username atau kata sandi Anda salah.");
      }

      setSuccessMsg("Autentikasi Berhasil! Mengalihkan ke Dashboard...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 150);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Toast Notification Top Bar */}
      {successMsg && (
        <div className="fixed top-6 z-50 bg-emerald-950 border border-emerald-600 text-emerald-100 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm font-extrabold animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-6 z-50 bg-rose-950 border border-rose-700 text-rose-100 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm font-extrabold">
          <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D96C3F]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#D96C3F] text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl ring-4 ring-[#D96C3F]/20">
            <Mountain className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Portal Admin Lembah Damar
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Silakan masuk dengan kredensial admin Anda untuk mengelola sistem.
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#242424] border border-[#333333] p-8 rounded-3xl shadow-2xl space-y-6">
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300">Username / Email Admin</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D96C3F] transition-all placeholder:text-stone-600"
                  placeholder="Masukkan username atau email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl pl-10 pr-11 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D96C3F] transition-all placeholder:text-stone-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#D96C3F]" />
                  ) : (
                    <Eye className="h-4 w-4 text-stone-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#D96C3F] hover:bg-[#c25a2e] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>{loading ? "Memverifikasi..." : "Masuk ke Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
