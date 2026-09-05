import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await verifyAdminCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password admin salah" },
        { status: 401 }
      );
    }

    await createAdminSession(user.id, user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Gagal melakukan login" }, { status: 500 });
  }
}
