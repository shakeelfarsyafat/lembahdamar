import { NextRequest, NextResponse } from "next/server";
import { deleteAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  try {
    await deleteAdminSession();
  } catch (e) {
    console.error("Logout delete session error:", e);
  }

  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar dari sesi admin.",
  });

  // Explicitly invalidate and clear admin cookie in response headers
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
