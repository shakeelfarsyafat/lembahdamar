"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Mountain,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render children cleanly without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pesanan", href: "/admin/bookings", icon: ShoppingBag },
    { name: "Katalog Produk", href: "/admin/products", icon: Package },
    { name: "Kategori", href: "/admin/categories", icon: Layers },
    { name: "Customer", href: "/admin/customers", icon: Users },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
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
        className={`fixed lg:sticky top-0 h-screen z-50 w-64 bg-[#1C1C1C] text-white flex flex-col justify-between transition-transform duration-300 transform border-r border-[#282828] print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="bg-[#D96C3F] p-2 rounded-xl text-white">
                <Mountain className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white block leading-tight">
                  Lembah Damar
                </span>
                <span className="text-[10px] font-semibold text-[#D96C3F] tracking-wider uppercase block">
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#D96C3F] text-white shadow-md font-bold"
                      : "text-[#F7F5F0]/80 hover:bg-[#282828] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#D96C3F]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-[#282828] bg-[#1C1C1C]">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Admin Lembah Damar
              </span>
              <span className="text-[10px] text-[#D96C3F] block truncate">
                admin@lembahdamar.com
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 rounded-xl transition-colors"
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
        <header className="bg-white border-b border-[#EFECE6] px-4 sm:px-8 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-sm font-bold text-stone-600 hidden sm:block">
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
