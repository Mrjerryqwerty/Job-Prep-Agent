import { NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenFor } from "@/lib/auth";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return NextResponse.json({ error: "Admin is not enabled" }, { status: 404 });
  const { passcode } = await req.json();
  if (passcode !== expected) return NextResponse.json({ error: "Wrong admin passcode" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await tokenFor(expected, "admin"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
