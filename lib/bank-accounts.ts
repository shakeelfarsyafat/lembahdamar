export interface BankAccount {
  id: "bsi" | "bca" | "bri" | "mandiri";
  name: string;
  fullName: string;
  accountNumber: string;
  formattedNumber: string;
  accountHolder: string;
  cardColor: {
    bgGradient: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    textColor: string;
    subTextColor: string;
    chipColor: string;
  };
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bsi",
    name: "BSI",
    fullName: "Bank Syariah Indonesia",
    accountNumber: "7214567890",
    formattedNumber: "7214 5678 9012",
    accountHolder: "LEMBAH DAMAR OUTDOOR",
    cardColor: {
      // Hitam ke abu-abuan (Charcoal/Zinc/Slate gradient)
      bgGradient: "from-[#222428] via-[#1A1C1E] to-[#0F1012]",
      border: "border-stone-600/50",
      badgeBg: "bg-stone-700/80",
      badgeText: "text-stone-200",
      textColor: "text-white",
      subTextColor: "text-stone-400",
      chipColor: "#EAB308",
    },
  },
  {
    id: "bca",
    name: "BCA",
    fullName: "Bank Central Asia",
    accountNumber: "872012345678",
    formattedNumber: "8720 1234 5678",
    accountHolder: "LEMBAH DAMAR OUTDOOR",
    cardColor: {
      // Warna Biru (BCA Signature Blue)
      bgGradient: "from-[#0066AE] via-[#00528C] to-[#003B64]",
      border: "border-blue-400/40",
      badgeBg: "bg-blue-900/60",
      badgeText: "text-blue-100",
      textColor: "text-white",
      subTextColor: "text-blue-200",
      chipColor: "#FACC15",
    },
  },
  {
    id: "bri",
    name: "BRI",
    fullName: "Bank Rakyat Indonesia",
    accountNumber: "012301000456508",
    formattedNumber: "0123 0100 0456 508",
    accountHolder: "LEMBAH DAMAR OUTDOOR",
    cardColor: {
      // Warna Biru Tua (Deep Navy Blue)
      bgGradient: "from-[#072448] via-[#041B3B] to-[#021024]",
      border: "border-blue-500/30",
      badgeBg: "bg-blue-950/80",
      badgeText: "text-blue-200",
      textColor: "text-white",
      subTextColor: "text-blue-300/80",
      chipColor: "#FACC15",
    },
  },
  {
    id: "mandiri",
    name: "Mandiri",
    fullName: "Bank Mandiri",
    accountNumber: "1330098765432",
    formattedNumber: "1330 0987 6543 2",
    accountHolder: "LEMBAH DAMAR OUTDOOR",
    cardColor: {
      // Warna Kuning Orange (Mandiri Gold/Yellow-Orange)
      bgGradient: "from-[#E58A13] via-[#D97706] to-[#92400E]",
      border: "border-amber-300/50",
      badgeBg: "bg-amber-950/40",
      badgeText: "text-amber-100",
      textColor: "text-white",
      subTextColor: "text-amber-100/80",
      chipColor: "#FEF08A",
    },
  },
];
