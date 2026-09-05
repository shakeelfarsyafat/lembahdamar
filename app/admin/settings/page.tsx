import { db } from "@/lib/db/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const setting = await db.setting.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Website & Rental
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur nama bisnis, nomor WhatsApp penerima booking, rekening bank, dan kebijakan sewa.
        </p>
      </div>

      <SettingsForm initialData={setting} />
    </div>
  );
}
