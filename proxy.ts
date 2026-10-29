import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE, tokenFor } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const pass = process.env.APP_PASSCODE;
  if (!pass) return NextResponse.next(); // no passcode configured (local dev)
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();
  if (req.cookies.get(COOKIE)?.value === (await tokenFor(pass))) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
