import { Footer } from "@/components/storefront/footer";
import { SubpageHeader } from "@/components/storefront/subpage-header";
import { db } from "@/lib/db/prisma";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2, HelpCircle } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Kontak, Cara Sewa & FAQ - Lembah Damar Outdoor",
  description: "Informasi kontak CS, lokasi basecamp, tata cara penyewaan, serta jawaban pertanyaan populer di Lembah Damar Outdoor.",
};

export default async function KontakPage() {
  const settings = await db.setting.findUnique({ where: { id: "default" } });

  const waNumber = settings?.waNumber || "6281563105682";
  const address = settings?.address || "Jl. Raya Puncak KM 77, Cisarua, Bogor, Jawa Barat";
  const email = settings?.email || "info@lembahdamaroutdoor.com";
  const hours = settings?.operationalHours || "Setiap Hari: 07.00 - 21.00 WIB";

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

  const faqs = [
    {
      q: "Bagaimana cara melakukan sewa alat di Lembah Damar?",
      a: "Pilih produk di halaman katalog, tentukan tanggal sewa & pengembalian, isi data diri singkat, lalu klik tombol 'BOOKING VIA WHATSAPP'. CS kami akan segera mengonfirmasi pesananmu.",
    },
    {
      q: "Apakah ada batas waktu pemesanan (H-berapa)?",
      a: "Pemesanan dapat dilakukan kapan saja. Namun disarankan booking minimal H-3 terutama pada periode akhir pekan (weekend) agar stok perlengkapan aman.",
    },
    {
      q: "Apa jaminan yang harus diserahkan saat mengambil alat?",
      a: "Wajib menyerahkan 1 e-KTP atau SIM asli atas nama penyewa. Identitas akan disimpan aman dan dikembalikan utuh saat semua alat diserahkan kembali.",
    },
    {
      q: "Apakah kondisi tenda dan sleeping bag terjamin bersih?",
      a: "Pasti! Semua tenda, sleeping bag, dan matras selalu kami cuci bersih, sterilkan, dan angin-anginkan secara higienis setiap kali selesai disewa.",
    },
    {
      q: "Bagaimana jika terjadi kerusakan atau alat hilang?",
      a: "Kerusakan ringan karena pemakaian wajar tidak dikenakan biaya. Namun untuk sobek berat/patah/alat hilang, penyewa wajib membayar biaya perbaikan atau mengganti alat sejenis.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0]">
      <SubpageHeader title="LEMBAH DAMAR KONTAK" />
      <main className="flex-1 bg-[#F7F5F0] py-12 space-y-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* SECTION 1: Header & Kontak CS Basecamp */}
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
                Pusat Informasi & Bantuan
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
                Kontak & Lokasi CS Basecamp
              </h1>
              <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
                Kami siap membantu mempersiapkan perlengkapan outdoor untuk petualangan hebatmu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info Cards */}
              <div className="bg-white p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-6">
                <h2 className="font-extrabold text-[#1C1C1C] text-xl border-b border-[#EFECE6] pb-3">
                  Informasi Kontak
                </h2>

                <div className="space-y-4 text-sm text-stone-700">
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1C1C1C] block">Alamat Basecamp:</span>
                      <span>{address}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Phone className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1C1C1C] block">WhatsApp CS:</span>
                      <span>+{waNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Mail className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1C1C1C] block">Email Resmi:</span>
                      <span>{email}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Clock className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1C1C1C] block">Jam Operasional:</span>
                      <span>{hours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WA Action Card */}
              <div className="bg-[#1C1C1C] text-white p-8 rounded-3xl flex flex-col justify-between space-y-6 border border-[#282828]">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#FF5524] uppercase tracking-widest">
                    Respon Cepat
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Tanya CS via WhatsApp</h2>
                  <p className="text-[#F7F5F0]/80 text-sm leading-relaxed">
                    Ingin bertanya ketersediaan stok mendadak, konsultasi kapasitas tenda, atau lokasi penjemputan? Chat kami langsung.
                  </p>
                </div>

                <div>
                  <a
                    href={`https://wa.me/${waNumber}?text=Halo%20Lembah%20Damar%20Outdoor,%20saya%20ingin%20tanya%20sewa%20alat.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-3 bg-[#FF5524] hover:bg-[#E04618] text-white py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all"
                  >
                    <Phone className="h-5 w-5 fill-white" />
                    <span>Kirim Pesan WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Location Embed Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#FF5524]/10 text-[#FF5524] rounded-2xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[#1C1C1C] text-xl">Lokasi Basecamp Lembah Damar</h2>
                    <p className="text-xs text-stone-500">{address}</p>
                  </div>
                </div>
                <a
                  href="https://share.google/C7mmyRQMOk1CrN6MX"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#FF5524] hover:bg-[#E04618] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Buka di Google Maps ↗</span>
                </a>
              </div>

              {/* Interactive Map Embed */}
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative bg-stone-100">
                <iframe
                  title="Lokasi Lembah Damar Outdoor Basecamp"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.284382583852!2d106.9366!3d-6.6116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzYnNDEuOCJTIDEwNsKwNTYnMTEuOCJF!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Tata Cara Penyewaan */}
          <div className="pt-8 border-t border-[#EFECE6] space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
                Panduan Penyewa
              </span>
              <h2 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
                Tata Cara Penyewaan Alat Camping
              </h2>
              <p className="text-stone-600 text-sm max-w-xl mx-auto">
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
              <h3 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
                <ShieldCheck className="h-6 w-6 text-[#D96C3F]" />
                <span>Syarat & Ketentuan Umum</span>
              </h3>
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
            </div>
          </div>

          {/* SECTION 3: FAQ */}
          <div className="pt-8 border-t border-[#EFECE6] space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
                Pusat Bantuan
              </span>
              <h2 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
                Pertanyaan Sering Diajukan (FAQ)
              </h2>
              <p className="text-stone-600 text-sm">
                Temukan jawaban untuk pertanyaan umum seputar layanan rental kami.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-xs space-y-2"
                >
                  <h3 className="font-bold text-[#1C1C1C] text-base flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-[#D96C3F] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-stone-600 pl-8 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/katalog"
                className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all"
              >
                <span>Lihat Katalog & Mulai Sewa</span>
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
