import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if ((request.nextUrl.pathname === "/api/products" || request.nextUrl.pathname.startsWith("/api/products/")) && request.method === "GET") return NextResponse.next();
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidAdminSession(token)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Debes iniciar sesión como administrador." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/users/:path*", "/api/products/:path*"],
};
