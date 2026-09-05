import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { InvoicePrintable } from "@/components/admin/invoice-printable";

export const revalidate = 0;

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInvoiceDetailPage({ params }: InvoicePageProps) {
  const { id } = await params;

  const [invoice, setting] = await Promise.all([
    db.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    }),
    db.setting.findUnique({ where: { id: "default" } }),
  ]);

  if (!invoice) {
    notFound();
  }

  return <InvoicePrintable invoice={{ ...invoice, setting }} />;
}
