import { Footer } from "@/components/storefront/footer";
import { BookingClient } from "@/components/storefront/booking-client";
import { SubpageHeader } from "@/components/storefront/subpage-header";

export const metadata = {
  title: "Checkout & Pembayaran Sewa - Lembah Damar Outdoor",
  description: "Lengkapi data penyewaan alat camping, pilih metode pembayaran, dan konfirmasi order via WhatsApp.",
};

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SubpageHeader title="CHECKOUT & PEMBAYARAN" />
      <main className="flex-1 bg-[#fcfdfc]">
        <BookingClient />
      </main>
      <Footer />
    </div>
  );
}
