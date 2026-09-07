"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Tent,
  Images,
  PhoneCall,
  BookOpen,
  Mountain,
  User,
} from "lucide-react";

interface HeroNavigationProps {
  // Tempat jika ada custom image / element kata nanti
  heroGraphicUrl?: string;
}

export function HeroNavigation({ heroGraphicUrl }: HeroNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  const menuItems = [
    {
      name: "Katalog",
      href: "/katalog",
      icon: Tent,
    },
    {
      name: "Galeri",
      href: "/galeri",
      icon: Images,
    },
    {
      name: "Kontak",
      href: "/kontak",
      icon: PhoneCall,
    },
    {
      name: "Edukasi",
      href: "/edukasi",
      icon: BookOpen,
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. TOP BAR: Dark Bar with Centered Search */}
      <header className="w-full bg-[#1c1c1e] text-white py-2.5 px-4 sm:px-6 shadow-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo Resmi (Kiri) */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="bg-white px-2.5 py-1 rounded-xl flex items-center shadow-xs">
              <img
                src="/logo-hero.png"
                alt="DAMARRENT - Lembah Damar Outdoor"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full bg-white rounded-full overflow-hidden shadow-sm border border-white/20 focus-within:ring-2 focus-within:ring-[#FF5500] transition-all"
            >
              <div className="pl-3.5 pr-2 text-stone-400 flex items-center justify-center pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tenda, carrier, atau alat camping lainnya..."
                className="w-full bg-transparent text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm py-2 pr-2 focus:outline-none font-medium"
              />
              <button
                type="submit"
                className="bg-[#3a3a3c] hover:bg-[#2c2c2e] text-white text-xs font-bold px-4 sm:px-5 py-2 my-0.5 mr-0.5 rounded-full transition-colors shrink-0 cursor-pointer"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Admin Icon (Kanan) */}
          <div className="flex items-center shrink-0">
            <Link
              href="/admin/login"
              title="Admin Panel"
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION: Vibrant Orange & Simpel */}
      <section className="relative w-full bg-[#FF5500] text-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 flex items-center justify-center overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
          {/* Logo DAMARRENT dari user */}
          <div className="flex flex-col items-center select-none group cursor-default">
            <img
              src={heroGraphicUrl || "/logo-hero.png"}
              alt="DAMARRENT - Rental Alat Camping Lembah Damar"
              className="max-h-32 sm:max-h-44 md:max-h-52 lg:max-h-60 w-auto object-contain mx-auto drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* 3. MENU NAVIGASI DI BAWAH HERO: 4 Menu (Katalog, Galeri, Kontak, Info) */}
      <nav
        aria-label="Pilihan Menu Utama"
        className="w-full bg-white border-b border-stone-200 shadow-sm sticky top-0 z-20"
      >
        <div className="max-w-4xl mx-auto px-2 sm:px-6">
          <div className="grid grid-cols-4 divide-x divide-stone-100 sm:divide-x-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center justify-center py-3 sm:py-3.5 px-2 hover:bg-orange-50/50 transition-all text-stone-700 hover:text-[#FF5500]"
                >
                  {/* Icon */}
                  <div className="p-1.5 rounded-xl group-hover:scale-110 group-hover:bg-orange-100/60 transition-all text-stone-700 group-hover:text-[#FF5500]">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                  </div>

                  {/* Label */}
                  <span className="text-xs sm:text-sm font-bold tracking-tight mt-0.5 text-stone-800 group-hover:text-[#FF5500] transition-colors">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
