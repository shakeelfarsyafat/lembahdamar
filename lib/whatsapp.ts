export interface WhatsAppBookingPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  startDateStr: string;
  endDateStr: string;
  durationDays: number;
  items: {
    productName: string;
    quantity: number;
    pricePerDay: number;
    subtotal: number;
  }[];
  totalAmount: number;
  adminWaNumber: string;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppLink(payload: WhatsAppBookingPayload): string {
  const cleanWaNumber = payload.adminWaNumber.replace(/[^0-9]/g, "");

  const itemLines = payload.items
    .map((item) => `- ${item.productName} × ${item.quantity} (${formatRupiah(item.pricePerDay)}/hari)`)
    .join("\n");

  let message = `Halo, saya ingin melakukan penyewaan alat camping.\n\n`;
  message += `*Nama:* ${payload.customerName}\n`;
  message += `*No. WhatsApp:* ${payload.customerPhone}\n`;
  if (payload.customerAddress) {
    message += `*Alamat:* ${payload.customerAddress}\n`;
  }
  message += `\n*Tanggal Sewa:* ${payload.startDateStr}\n`;
  message += `*Tanggal Kembali:* ${payload.endDateStr}\n`;
  message += `*Durasi:* ${payload.durationDays} Hari\n\n`;
  message += `*Pesanan:*\n${itemLines}\n\n`;
  message += `*Estimasi Total:* ${formatRupiah(payload.totalAmount)}\n`;
  if (payload.customerNotes) {
    message += `*Catatan:* ${payload.customerNotes}\n`;
  }
  message += `\nMohon konfirmasi ketersediaan dan proses selanjutnya. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanWaNumber}?text=${encodedMessage}`;
}
