import { NextResponse } from "next/server";
import { COOKIE, tokenFor } from "@/lib/auth";

export async function POST(req: Request) {
  const { passcode } = await req.json();
  const expected = process.env.APP_PASSCODE;
  if (!expected || passcode !== expected) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await tokenFor(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
