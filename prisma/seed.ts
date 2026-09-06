import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // 2. Admin User
  const hashedPassword = await bcrypt.hash("lembahdamar1", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin",
      passwordHash: hashedPassword,
      name: "admin",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // 3. Settings
  await prisma.setting.create({
    data: {
      id: "default",
      storeName: "Lembah Damar Outdoor",
      description: "Penyewaan alat camping & outdoor terpercaya di Bogor - Gunung Gede Pangrango",
      address: "Jl. Raya Puncak KM 77, Cisarua, Bogor, Jawa Barat",
      waNumber: "6281563105682",
      email: "info@lembahdamaroutdoor.com",
      instagram: "@lembahdamar_outdoor",
      operationalHours: "Setiap Hari: 07.00 - 21.00 WIB",
      bankDetails: "BCA: 7890-1234-56 a/n Lembah Damar Outdoor\nMandiri: 133-00-9876543-2 a/n Lembah Damar Outdoor\nBRI: 0123-01-000456-50-8 a/n Lembah Damar Outdoor",
      qrisImage: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&q=80",
      rentalTerms: "1. Wajib menyerahkan 1 e-KTP/SIM ASLI penanggung jawab sewa saat pengambilan barang.\n2. Pembayaran DP minimal 50% untuk kepastian booking.\n3. Cek kondisi & kelengkapan alat bersama petugas saat serah terima barang.\n4. Pengembalian barang tepat waktu sesuai durasi sewa.",
      cancellationPolicy: "H-3: DP dikembalikan 100%\nH-1: DP dikembalikan 50%\nHari H: DP Hangus",
      lateFeePerDay: 25000,
      damageFeeTerms: "Kerusakan ringan (sobek kecil/tali putus) dikenakan biaya perbaikan Rp 30.000 - Rp 100.000. Hilang/rusak total mengganti barang sejenis atau membayar seharga barang baru.",
    },
  });
  console.log("Created store settings.");

  // 4. Categories
  const categoriesData = [
    { name: "Tenda", slug: "tenda", icon: "Tent", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80" },
    { name: "Sleeping Bag", slug: "sleeping-bag", icon: "Bed", image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80" },
    { name: "Carrier & Ransel", slug: "carrier", icon: "Backpack", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" },
    { name: "Kompor & Cooking Set", slug: "kompor", icon: "Flame", image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80" },
    { name: "Matras & Air Bed", slug: "matras", icon: "Layers", image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80" },
    { name: "Lampu Camping", slug: "lampu-camping", icon: "Lightbulb", image: "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&q=80" },
    { name: "Peralatan Masak", slug: "peralatan-masak", icon: "Utensils", image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80" },
    { name: "Kursi & Meja", slug: "kursi-meja", icon: "Armchair", image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80" },
    { name: "Peralatan Outdoor Lainnya", slug: "peralatan-outdoor", icon: "Compass", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }
  console.log("Created categories.");

  // 5. Products
  const productsData = [
    {
      name: "Tenda Dome Eiger Big Dome 4 Person",
      slug: "tenda-dome-eiger-4-person",
      categorySlug: "tenda",
      pricePerDay: 45000,
      stock: 8,
      isPopular: true,
      description: "Tenda dome kapasitas 4 orang dengan double layer waterproof frame aluminium tahan angin kencang dan hujan lebat.",
      capacity: "4 Orang + Barang",
      weight: "3.8 kg",
      packageItems: "1x Outer Tent, 1x Inner Tent, 2x Frame Set, 12x Pasak Pasir, 4x Tali Guylines, 1x Tas Carry",
      terms: "Pastikan tenda tidak didirikan di dekat sumber api terbuka.",
      images: [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80"
      ]
    },
    {
      name: "Tenda Great Outdoor Camp 2 Person",
      slug: "tenda-great-outdoor-2-person",
      categorySlug: "tenda",
      pricePerDay: 30000,
      stock: 10,
      isPopular: true,
      description: "Tenda ringan ultralight cocok untuk pendakian solo atau 2 orang dengan vestibul luas.",
      capacity: "2 Orang",
      weight: "2.2 kg",
      packageItems: "1x Tenda Frame, 1x Flysheet PU 3000mm, Pasak, Tas Tenda",
      terms: "Pengeringan sebelum pengembalian sangat dianjurkan.",
      images: [
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80"
      ]
    },
    {
      name: "Tenda Kapasitas 6 Person Family Deluxe",
      slug: "tenda-kapasitas-6-person",
      categorySlug: "tenda",
      pricePerDay: 75000,
      stock: 5,
      isPopular: false,
      description: "Tenda keluarga besar 2 ruangan tinggi 180cm nyaman untuk camper ceria bersama keluarga.",
      capacity: "6-8 Orang",
      weight: "7.5 kg",
      packageItems: "1x Tenda Utama, Frame Steel & Fiber, Pasak Besi, Tas Roda",
      terms: "Bersihkan tanah di bagian bawah sebelum dipack.",
      images: [
        "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80"
      ]
    },
    {
      name: "Sleeping Bag Polar Thermal Consina",
      slug: "sleeping-bag-polar-consina",
      categorySlug: "sleeping-bag",
      pricePerDay: 15000,
      stock: 20,
      isPopular: true,
      description: "Sleeping bag dengan bahan lapis polar hangat nyaman untuk suhu hingga 5°C.",
      capacity: "1 Orang (Model Mumi)",
      weight: "900 gram",
      packageItems: "1x Sleeping Bag, 1x Stuff Sack Kompresi",
      terms: "Menggunakan kain inner yang dicuci higienis setiap selesai sewa.",
      images: [
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80"
      ]
    },
    {
      name: "Carrier Deuter Aircontact 65+10L",
      slug: "carrier-deuter-aircontact-65L",
      categorySlug: "carrier",
      pricePerDay: 40000,
      stock: 6,
      isPopular: true,
      description: "Tas gunung premium dengan sistem sirkulasi udara backsystem ergonomis mengurangi beban pundak.",
      capacity: "65 + 10 Liter",
      weight: "2.4 kg",
      packageItems: "1x Tas Carrier, 1x Raincover Deuter",
      terms: "Dilarang memuat barang tajam tanpa pelindung.",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
      ]
    },
    {
      name: "Carrier Eiger Rhinos 45L Ultralight",
      slug: "carrier-eiger-rhinos-45L",
      categorySlug: "carrier",
      pricePerDay: 30000,
      stock: 8,
      isPopular: false,
      description: "Carrier medium cocok untuk tek-tok pendakian 2 hari 1 malam.",
      capacity: "45 Liter",
      weight: "1.6 kg",
      packageItems: "1x Carrier Eiger 45L, Raincover",
      terms: "Setel adjuster sesuai tinggi badan.",
      images: [
        "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80"
      ]
    },
    {
      name: "Kompor Portable Mini Windproof Kovar",
      slug: "kompor-portable-mini-windproof",
      categorySlug: "kompor",
      pricePerDay: 15000,
      stock: 15,
      isPopular: true,
      description: "Kompor gas kaleng dengan pelindung angin mawar otomatis mekar, api membara efisien.",
      capacity: "Daya tampung panci hingga 5 kg",
      weight: "450 gram",
      packageItems: "1x Kompor Mini, 1x Box Penyimpanan Plastik",
      terms: "Gas kaleng tidak termasuk dalam sewa kompor.",
      images: [
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80"
      ]
    },
    {
      name: "Nesting Cooking Set DS-308 (4 In 1)",
      slug: "nesting-cooking-set-ds308",
      categorySlug: "peralatan-masak",
      pricePerDay: 20000,
      stock: 12,
      isPopular: true,
      description: "Set peralatan masak aluminium anoda tahan gores lengkap panci, wajan, teko mini, dan mangkok.",
      capacity: "3-4 Orang",
      weight: "800 gram",
      packageItems: "1x Panci Besar, 1x Panci Kecil, 1x Wajan, 1x Teko Mini, 3x Mangkok Plastik, 1x Centong Wood, 1x Busa Cuci, 1x Tas Jaring",
      terms: "Kembalikan dalam kondisi cuci bersih.",
      images: [
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80"
      ]
    },
    {
      name: "Matras Aluminium Foil Double Layer",
      slug: "matras-aluminium-foil-double",
      categorySlug: "matras",
      pricePerDay: 8000,
      stock: 25,
      isPopular: false,
      description: "Matras isolator dingin lapisan aluminium foil bolak-balik menahan dingin tanah gunung.",
      capacity: "190cm x 100cm",
      weight: "300 gram",
      packageItems: "1x Matras Alumunium, Tali Pengikat",
      terms: "Hindari tertusuk batu tajam.",
      images: [
        "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80"
      ]
    },
    {
      name: "Lampu Lentera Camping Rechargeable USB",
      slug: "lampu-lentera-camping-usb",
      categorySlug: "lampu-camping",
      pricePerDay: 12000,
      stock: 15,
      isPopular: true,
      description: "Lampu lentera LED terang 1000 Lumens dilengkapi fitur powerbank untuk cas HP.",
      capacity: "Baterai 4400 mAh (Tahan hingga 12 jam)",
      weight: "350 gram",
      packageItems: "1x Lampu Lentera, 1x Kabel USB Type-C, Hook Gantungan",
      terms: "Isi penuh baterai sebelum berangkat.",
      images: [
        "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&q=80"
      ]
    },
    {
      name: "Kursi Lipat Camping Portable Naturehike",
      slug: "kursi-lipat-camping-naturehike",
      pricePerDay: 15000,
      categorySlug: "kursi-meja",
      stock: 12,
      isPopular: true,
      description: "Kursi santai lipat paduan aluminium kuat menahan beban hingga 120 kg.",
      capacity: "Maksimal 120 kg",
      weight: "1.1 kg",
      packageItems: "1x Frame Kursi, 1x Kain Dudukan Cordura, Tas Penyimpanan",
      terms: "Gunakan pada permukaan tanah rata.",
      images: [
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80"
      ]
    },
    {
      name: "Meja Lipat Aluminium Naturehike Roll",
      slug: "meja-lipat-aluminium-naturehike",
      pricePerDay: 20000,
      categorySlug: "kursi-meja",
      stock: 8,
      isPopular: false,
      description: "Meja camping aluminium gulung ringan dan kokoh untuk area masak & santai.",
      capacity: "Dimensi 57x42x38 cm",
      weight: "1.4 kg",
      packageItems: "1x Meja Roll, 1x Frame Lipat, Tas Meja",
      terms: "Bersihkan tumpahan makanan sebelum dilipat.",
      images: [
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80"
      ]
    },
    {
      name: "Flysheet 3x4 Meter Waterproof PU 3000mm",
      slug: "flysheet-3x4-meter-waterproof",
      pricePerDay: 15000,
      categorySlug: "peralatan-outdoor",
      stock: 14,
      isPopular: false,
      description: "Atap tambahan peneduh terpal parasit tebal dengan 19 loop gantungan pasak.",
      capacity: "Peneduh untuk 6-8 orang",
      weight: "750 gram",
      packageItems: "1x Flysheet 3x4m, Tas Pouch",
      terms: "Ikat tali dengan kencang di pasak.",
      images: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
      ]
    }
  ];

  for (const prod of productsData) {
    const { images, categorySlug, ...prodInfo } = prod;
    const createdProd = await prisma.product.create({
      data: {
        ...prodInfo,
        categoryId: categoriesMap[categorySlug],
      },
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          url: images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }
  }
  console.log("Created products & images.");

  // 6. Sample Customer & Booking for demonstration
  const customer = await prisma.customer.create({
    data: {
      name: "Budi Santoso",
      phone: "6285712345678",
      email: "budi.santoso@gmail.com",
      address: "Jl. Margonda Raya No. 45, Depok, Jawa Barat",
    },
  });

  const tendaProd = await prisma.product.findFirst({ where: { slug: "tenda-dome-eiger-4-person" } });
  const komporProd = await prisma.product.findFirst({ where: { slug: "kompor-portable-mini-windproof" } });

  if (tendaProd && komporProd) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const booking = await prisma.booking.create({
      data: {
        bookingCode: "BK-20260905-0001",
        customerId: customer.id,
        startDate: startDate,
        endDate: endDate,
        durationDays: 2,
        subtotal: (tendaProd.pricePerDay * 1 + komporProd.pricePerDay * 1) * 2,
        totalAmount: (tendaProd.pricePerDay * 1 + komporProd.pricePerDay * 1) * 2,
        status: "DIKONFIRMASI",
        paymentStatus: "DP",
        notes: "Pengambilan barang Sabtu jam 09.00 WIB",
        items: {
          create: [
            {
              productId: tendaProd.id,
              quantity: 1,
              pricePerDay: tendaProd.pricePerDay,
              subtotal: tendaProd.pricePerDay * 2,
            },
            {
              productId: komporProd.id,
              quantity: 1,
              pricePerDay: komporProd.pricePerDay,
              subtotal: komporProd.pricePerDay * 2,
            },
          ],
        },
        payments: {
          create: [
            {
              amount: 60000,
              paymentMethod: "TRANSFER_BANK",
              paymentType: "DP",
              status: "LUNAS",
              notes: "DP Transfer BCA via m-banking",
            },
          ],
        },
        invoice: {
          create: {
            invoiceNumber: "INV-20260905-0001",
            totalAmount: 120000,
            dpAmount: 60000,
            remainingAmount: 60000,
            status: "ISSUED",
          },
        },
        statusHistories: {
          create: [
            {
              status: "MENUNGGU",
              notes: "Booking dibuat via WhatsApp",
            },
            {
              status: "DIKONFIRMASI",
              notes: "DP Rp 60.000 telah diverifikasi admin",
            },
          ],
        },
      },
    });
    console.log("Created sample booking:", booking.bookingCode);
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
