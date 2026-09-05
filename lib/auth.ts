import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "lembahdamar-super-secret-key-2026"
);

const COOKIE_NAME = "admin_session";

export async function createAdminSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email, role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return token;
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "ADMIN") return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}
