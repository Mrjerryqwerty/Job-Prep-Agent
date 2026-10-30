import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, CAND_COOKIE, COOKIE, tokenFor } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const deny = () =>
    isApi
      ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL(pathname.startsWith("/admin") ? "/admin/login" : "/login", req.url));

  // Admin area: its own passcode. If ADMIN_PASSCODE is not set the area is switched off.
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();
    const adminPass = process.env.ADMIN_PASSCODE;
    if (!adminPass) return new NextResponse("Admin is not enabled", { status: 404 });
    if (req.cookies.get(ADMIN_COOKIE)?.value === (await tokenFor(adminPass, "admin"))) return NextResponse.next();
    return deny();
  }

  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();

  // Candidate area: shared passcode (if set) AND a candidate identity.
  const pass = process.env.APP_PASSCODE;
  const passOk = !pass || req.cookies.get(COOKIE)?.value === (await tokenFor(pass));
  const hasCandidate = !!req.cookies.get(CAND_COOKIE)?.value;
  if (passOk && hasCandidate) return NextResponse.next();
  return deny();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
