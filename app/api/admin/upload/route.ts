import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized / Sesi login telah berakhir" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Tidak ada file gambar yang diunggah" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract & sanitize extension
    let ext = path.extname(file.name).toLowerCase();
    if (!ext || ext === ".") {
      ext = file.type === "image/webp" ? ".webp" : file.type === "image/png" ? ".png" : ".jpg";
    }

    const safeBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 30);

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${safeBase ? safeBase + "-" : ""}${Date.now()}-${randomSuffix}${ext}`;

    // Ensure upload directory exists inside public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      size: buffer.length,
      filename,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan file gambar di server" },
      { status: 500 }
    );
  }
}
