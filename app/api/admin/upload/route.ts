import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Attempt writing to public/uploads (works in local dev & persistent VPS)
    try {
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
    } catch (fsErr: any) {
      // If filesystem is read-only (such as Vercel Serverless / AWS Lambda),
      // seamlessly fallback to base64 Data URL so upload NEVER breaks!
      console.warn("Server filesystem read-only (e.g. Vercel), falling back to data URL:", fsErr.message);
      const mime = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        size: buffer.length,
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
