import { Footer } from "@/components/storefront/footer";
import { SubpageHeader } from "@/components/storefront/subpage-header";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "FAQ - Pertanyaan Populer",
  description: "Pertanyaan yang sering diajukan mengenai sewa alat camping di Lembah Damar Outdoor.",
};

export default function FAQPage() {
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
      <SubpageHeader title="LEMBAH DAMAR FAQ" />
      <main className="flex-1 bg-[#F7F5F0] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D96C3F]">
              Pusat Bantuan
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
              Pertanyaan Sering Diajukan (FAQ)
            </h1>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
