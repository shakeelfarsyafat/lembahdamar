import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SubpageHeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export function SubpageHeader({
  title = "LEMBAH DAMAR OUTDOOR",
  backHref = "/",
  backLabel = "Kembali ke Beranda",
}: SubpageHeaderProps) {
  return (
    <header className="bg-[#1c1c1e] text-white py-3.5 px-4 sm:px-6 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-stone-300 hover:text-white text-xs font-bold transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF5524] group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </Link>

        {title && (
          <span className="text-xs font-black tracking-widest text-orange-400 uppercase hidden sm:inline-block">
            {title}
          </span>
        )}
      </div>
    </header>
  );
}
