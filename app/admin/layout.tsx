"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Image as ImageIcon,
  Settings,
  LogOut,
  Mountain,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Newspaper,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If on login page, render children cleanly without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pesanan", href: "/admin/bookings", icon: ShoppingBag },
    { name: "Katalog Produk", href: "/admin/products", icon: Package },
    { name: "Berita", href: "/admin/articles", icon: Newspaper },
    { name: "Galeri & Mitra", href: "/admin/gallery", icon: ImageIcon },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    // Hard redirect to clear browser cache and session state completely
    window.location.href = "/admin/login";
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F7F5F0] flex font-sans print:h-auto print:overflow-visible">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs z-40 lg:hidden print:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 bg-[#1C1C1C] text-white flex flex-col justify-between transition-all duration-300 border-r border-[#282828] print:hidden ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3 min-w-0">
              <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-xs">
                <img
                  src="/logo-hero.png"
                  alt="DAMARRENT"
                  className="h-7 w-auto object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-sm text-white block leading-tight truncate">
                    Lembah Damar
                  </span>
                  <span className="text-[9px] font-semibold text-[#FF5524] tracking-wider uppercase block truncate">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 text-stone-400 hover:text-white hover:bg-[#282828] rounded-lg transition-colors"
                title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5 text-[#D96C3F]" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-stone-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center space-x-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isCollapsed ? "justify-center px-0" : "px-3.5"
                  } ${
                    isActive
                      ? "bg-[#D96C3F] text-white shadow-md font-bold"
                      : "text-[#F7F5F0]/80 hover:bg-[#282828] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#D96C3F]" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-3 border-t border-[#282828] bg-[#1C1C1C]">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-white block truncate">
                  Admin Lembah Damar
                </span>
                <span className="text-[10px] text-[#D96C3F] block truncate">
                  admin@lembahdamar.com
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible">
        {/* Top Navbar */}
        <header className="bg-white border-b border-[#EFECE6] px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center space-x-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-all"
              title={isCollapsed ? "Buka Sidebar Navigation" : "Tutup Sidebar Navigation"}
            >
              {isCollapsed ? (
                <>
                  <PanelLeftOpen className="h-4 w-4 text-[#D96C3F]" />
                  <span>Buka Menu</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 text-stone-600" />
                  <span>Tutup Menu</span>
                </>
              )}
            </button>

            <h2 className="text-xs sm:text-sm font-bold text-stone-600 hidden md:block">
              Sistem Manajemen Rental Outdoor
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-[#D96C3F] bg-[#FDF3EE] hover:bg-[#FBE8DE] border border-[#D96C3F]/20 px-3.5 py-2 rounded-xl transition-all"
            >
              Lihat Customer Website ↗
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  );
}
