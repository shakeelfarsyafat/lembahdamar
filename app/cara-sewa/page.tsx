import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import Link from "next/link";
import { Tent, Calendar, PhoneCall, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Cara Sewa Alat Camping",
  description: "Tata cara dan aturan penyewaan peralatan gunung di Lembah Damar Outdoor.",
};

export default function CaraSewaPage() {
  const steps = [
    {
      step: "01",
      title: "Pilih Barang & Tanggal",
      desc: "Pilih produk yang ingin kamu sewa melalui Katalog Online. Tentukan tanggal mulai sewa dan pengembalian.",
    },
    {
      step: "02",
      title: "Kirim Ringkasan via WA",
      desc: "Isi data nama dan nomor WhatsApp di form booking. Sistem akan otomatis memformat pesan sewa ke WhatsApp CS kami.",
    },
    {
      step: "03",
      title: "Konfirmasi & Bayar DP",
      desc: "CS akan mengonfirmasi stok dan memberikan instruksi pembayaran DP 50% melalui Transfer Bank atau QRIS.",
    },
    {
      step: "04",
      title: "Ambil Barang di Basecamp",
      desc: "Ambil barang di Lembah Damar Basecamp Puncak Bogor. Tunjukkan 1 e-KTP/SIM asli penanggung jawab sewa.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0]">
      <Navbar />
      <main className="flex-1 bg-[#F7F5F0] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
              Panduan Penyewa
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
              Tata Cara Penyewaan Alat Camping
            </h1>
            <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
              Proses sewa alat outdoor yang praktis, cepat, dan terjamin aman untuk perjalanan gunungmu.
            </p>
          </div>

          {/* Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-3 relative overflow-hidden"
              >
                <span className="text-4xl font-extrabold text-[#D96C3F]/25 block">
                  {s.step}
                </span>
                <h3 className="font-extrabold text-lg text-[#1C1C1C]">{s.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Terms Card */}
          <div className="bg-[#1C1C1C] text-white p-8 rounded-3xl space-y-6 border border-[#282828]">
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
              <ShieldCheck className="h-6 w-6 text-[#D96C3F]" />
              <span>Syarat & Ketentuan Umum</span>
            </h2>
            <ul className="space-y-3 text-sm text-[#F7F5F0]/90 divide-y divide-[#282828]">
              <li className="pt-3 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                <span>
                  Wajib menyerahkan 1 e-KTP / SIM ASLI penanggung jawab sewa saat pengambilan barang di toko.
                </span>
              </li>
              <li className="pt-3 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                <span>
                  Pembayaran DP minimal 50% wajib dilakukan untuk mengunci ketersediaan stok barang.
                </span>
              </li>
              <li className="pt-3 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                <span>
                  Peralatan dihitung per hari (24 Jam). Keterlambatan pengembalian dikenakan denda per hari.
                </span>
              </li>
              <li className="pt-3 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                <span>
                  Pemeriksaan kelengkapan dan fungsi alat dilakukan bersama petugas saat serah terima barang.
                </span>
              </li>
            </ul>

            <div className="pt-4 text-center">
              <Link
                href="/katalog"
                className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all"
              >
                <span>Mulai Sewa Alat Sekarang</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
