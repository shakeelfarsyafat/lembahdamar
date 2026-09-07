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
  bookingCode?: string;
  paymentMethod?: string;
  bankName?: string;
  transferAmount?: number;
  paymentType?: "DP" | "LUNAS" | "BELUM_BAYAR";
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

  let message = `Halo Lembah Damar Outdoor, saya ingin melakukan pemesanan sewa alat camping.\n\n`;
  if (payload.bookingCode) {
    message += `*Kode Booking:* ${payload.bookingCode}\n`;
  }
  message += `*Nama:* ${payload.customerName}\n`;
  message += `*No. WhatsApp:* ${payload.customerPhone}\n`;
  if (payload.customerAddress) {
    message += `*Alamat:* ${payload.customerAddress}\n`;
  }
  message += `\n*Tanggal Sewa:* ${payload.startDateStr}\n`;
  message += `*Tanggal Kembali:* ${payload.endDateStr}\n`;
  message += `*Durasi:* ${payload.durationDays} Hari\n\n`;
  message += `*Daftar Alat:*\n${itemLines}\n\n`;
  message += `*Total Biaya Sewa:* ${formatRupiah(payload.totalAmount)}\n`;

  if (typeof payload.transferAmount === "number") {
    const methodStr = payload.paymentMethod === "QRIS" ? "QRIS" : `Transfer Bank ${payload.bankName || "BCA"}`;
    const typeStr = payload.paymentType === "LUNAS" ? "LUNAS" : payload.paymentType === "DP" ? "DP (Uang Muka)" : "Belum Transfer";
    const sisa = Math.max(0, payload.totalAmount - payload.transferAmount);

    message += `\n*Rincian Pembayaran:*\n`;
    message += `- Metode: ${methodStr}\n`;
    message += `- Jumlah Ditransfer: ${formatRupiah(payload.transferAmount)} (${typeStr})\n`;
    message += `- Sisa Pembayaran: ${formatRupiah(sisa)}\n`;
  }

  if (payload.customerNotes) {
    message += `\n*Catatan:* ${payload.customerNotes}\n`;
  }
  message += `\nMohon konfirmasi dan verifikasi pemesanan saya. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanWaNumber}?text=${encodedMessage}`;
}
