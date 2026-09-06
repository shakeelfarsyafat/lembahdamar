"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Menu, X, Search, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Katalog", href: "/katalog" },
    { name: "Galeri", href: "/galeri" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-[#183327] text-white py-3.5 border-b border-[#234737] ${
        isScrolled ? "shadow-xl bg-[#162E24]/95 backdrop-blur-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo - LEMBAH DAMAR */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="bg-[#FF5524] text-white p-2 rounded-xl transition-all group-hover:scale-105 shadow-md">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-tight uppercase">
                LEMBAH DAMAR
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#FF5524] uppercase block">
                Outdoor & Rental
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-extrabold uppercase tracking-wider transition-colors hover:text-[#FF5524] ${
                    isActive ? "text-[#FF5524] border-b-2 border-[#FF5524] pb-0.5" : "text-stone-200"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar & Right Actions */}
          <div className="hidden sm:flex items-center space-x-4 flex-1 max-w-xs ml-auto md:ml-0">
            <form action="/katalog" className="relative w-full">
              <input
                type="text"
                name="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-stone-900 rounded-full pl-4 pr-9 py-1.5 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5524]"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/admin/login"
              className="p-2 text-stone-200 hover:text-white hover:bg-[#234737] rounded-full transition-colors"
              title="Login Admin"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-200 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#162E24] border-t border-[#234737] px-4 pt-3 pb-6 space-y-3 mt-3">
          <form action="/katalog" className="relative w-full mb-3">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="w-full bg-white text-stone-900 rounded-full pl-4 pr-9 py-2 text-xs font-semibold placeholder:text-stone-400 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-stone-200 hover:bg-[#234737] hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
