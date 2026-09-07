import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "lembahdamar-super-secret-key-2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      const response = NextResponse.next();
      // Cegah caching halaman admin di history browser
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    } catch (err) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("admin_session", "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return response;
    }
  }

  // Redirect logged in admin away from /admin/login to /admin
  if (pathname === "/admin/login") {
    const token = request.cookies.get("admin_session")?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch (err) {
        // Token invalid, allow login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
