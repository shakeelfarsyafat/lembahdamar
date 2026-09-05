"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, ShoppingBag, Menu, X, PhoneCall } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#1C1C1C]/95 backdrop-blur-md text-white shadow-xl py-3 border-b border-[#282828]"
          : "bg-[#1C1C1C] text-white py-4 border-b border-[#282828]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="bg-[#D96C3F] group-hover:bg-[#C05A2E] text-white p-2 rounded-xl transition-all shadow-md">
              <Mountain className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-tight">
                LEMBAH DAMAR
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-[#D96C3F] uppercase block">
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
                  className={`text-sm font-semibold transition-colors duration-200 hover:text-[#D96C3F] ${
                    isActive ? "text-[#D96C3F] border-b-2 border-[#D96C3F] pb-1" : "text-[#F7F5F0]/90"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/booking"
              className="relative p-2.5 text-[#F7F5F0] hover:text-white bg-[#282828] hover:bg-[#383838] rounded-xl transition-all border border-[#383838]"
              title="Keranjang Sewa"
            >
              <ShoppingBag className="h-5 w-5 text-[#D96C3F]" />
            </Link>

            <Link
              href="/katalog"
              className="inline-flex items-center space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Sewa Sekarang</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-3">
            <Link
              href="/booking"
              className="p-2 text-[#F7F5F0] bg-[#282828] rounded-lg"
            >
              <ShoppingBag className="h-5 w-5 text-[#D96C3F]" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F7F5F0] hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1C1C1C] border-b border-[#282828] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === link.href
                  ? "bg-[#282828] text-[#D96C3F]"
                  : "text-[#F7F5F0] hover:bg-[#282828]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#D96C3F] hover:bg-[#C05A2E] text-white px-4 py-3 rounded-xl font-bold text-center text-sm shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Sewa Sekarang</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
