import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { BookingClient } from "@/components/storefront/booking-client";

export const metadata = {
  title: "Keranjang & Booking Sewa",
  description: "Lengkapi data penyewaan alat camping dan konfirmasi order via WhatsApp.",
};

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fcfdfc]">
        <BookingClient />
      </main>
      <Footer />
    </div>
  );
}
