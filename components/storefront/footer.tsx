import Link from "next/link";
import { Mountain, Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#183327] text-white border-t border-[#234737] mt-auto text-xs font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <div className="bg-white px-3 py-1.5 rounded-xl inline-flex items-center shadow-sm">
                <img
                  src="/logo-hero.png"
                  alt="DAMARRENT - Lembah Damar Outdoor"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Penyewaan perlengkapan camping dan outdoor terlengkap di Bogor. Siap menemani setiap petualangan gunung dan alam bebasmu dengan alat berkualitas.
            </p>
          </div>

          {/* Col 2 & 3: Navigasi & Kategori Alat (Berdampingan di HP agar hemat ruang) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:contents">
            {/* Navigasi */}
            <div className="space-y-3">
              <h3 className="text-white font-extrabold text-sm tracking-wide">Navigasi</h3>
              <ul className="space-y-1.5 text-stone-300 text-[11px] font-medium">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/katalog" className="hover:text-white transition-colors">
                    Katalog Peralatan
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link href="/cara-sewa" className="hover:text-white transition-colors">
                    Cara Penyewaan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kategori Alat */}
            <div className="space-y-3">
              <h3 className="text-white font-extrabold text-sm tracking-wide">Kategori Alat</h3>
              <ul className="space-y-1.5 text-stone-300 text-[11px] font-medium">
                <li>
                  <Link href="/katalog?category=tenda" className="hover:text-white transition-colors">
                    Tenda Dome & Family
                  </Link>
                </li>
                <li>
                  <Link href="/katalog?category=carrier" className="hover:text-white transition-colors">
                    Carrier & Ransel
                  </Link>
                </li>
                <li>
                  <Link href="/katalog?category=sleeping-bag" className="hover:text-white transition-colors">
                    Sleeping Bag & Matras
                  </Link>
                </li>
                <li>
                  <Link href="/katalog?category=kompor" className="hover:text-white transition-colors">
                    Kompor & Cooking Set
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-sm tracking-wide">Kontak & Lokasi</h3>
            <ul className="space-y-2 text-stone-300 text-[11px] font-medium">
              <li className="flex items-start space-x-2">
                <MapPin className="h-3.5 w-3.5 text-[#FF5524] shrink-0 mt-0.5" />
                <a
                  href="https://share.google/C7mmyRQMOk1CrN6MX"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors underline decoration-[#FF5524]/50"
                  title="Lihat di Google Maps"
                >
                  Jl. Raya Puncak KM 77, Cisarua, Bogor
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-[#FF5524] shrink-0" />
                <span>+62 815-6310-5682</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-[#FF5524] shrink-0" />
                <span>info@lembahdamaroutdoor.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5 text-[#FF5524] shrink-0" />
                <span>07.00 - 21.00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#234737] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-400 font-medium gap-2">
          <span>© {new Date().getFullYear()} Lembah Damar Outdoor. All rights reserved.</span>
          <Link href="/admin/login" className="hover:text-white transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
