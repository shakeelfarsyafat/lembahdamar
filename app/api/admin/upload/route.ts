import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sesi login admin tidak ditemukan atau telah kedaluwarsa. Silakan refresh atau login ulang." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File foto tidak terbaca. Pastikan memilih file gambar yang valid." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    const originalSize = inputBuffer.length;

    // Convert and compress to WebP using Sharp
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(inputBuffer)
        .rotate() // Auto-orient based on EXIF
        .resize({
          width: 1280,
          height: 1280,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
          effort: 4,
        })
        .toBuffer();
    } catch (sharpErr: any) {
      console.warn("Sharp image conversion failed, falling back to original buffer:", sharpErr.message);
      webpBuffer = inputBuffer;
    }

    const safeBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 30);

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${safeBase ? safeBase + "-" : ""}${Date.now()}-${randomSuffix}.webp`;

    // Attempt writing to public/uploads
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, webpBuffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        size: webpBuffer.length,
        originalSize,
        compressed: webpBuffer.length < originalSize,
        format: "webp",
        filename,
      });
    } catch (fsErr: any) {
      // If filesystem is read-only (e.g. Vercel Serverless), fallback to base64 WebP data URL
      console.warn("Server filesystem read-only, falling back to base64 Data URL:", fsErr.message);
      const base64 = webpBuffer.toString("base64");
      const dataUrl = `data:image/webp;base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        size: webpBuffer.length,
        originalSize,
        compressed: true,
        format: "webp",
        filename,
        storage: "base64",
      });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses unggahan foto di server." },
      { status: 500 }
    );
  }
}
