import { PrismaClient } from "@prisma/client";

// Ensure Neon pooled connection has pgbouncer=true & connect_timeout to avoid idle connection drops
const defaultUrl =
  "postgresql://neondb_owner:npg_p1zTRaw3dWEv@ep-royal-silence-b3o5qexv-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultUrl;
} else if (
  process.env.DATABASE_URL.includes("-pooler") &&
  !process.env.DATABASE_URL.includes("pgbouncer=true")
) {
  const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL += `${separator}pgbouncer=true&connect_timeout=15`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
