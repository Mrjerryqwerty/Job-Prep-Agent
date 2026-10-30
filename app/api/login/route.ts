import { NextResponse } from "next/server";
import { CAND_COOKIE, COOKIE, tokenFor } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, email, passcode, consent } = await req.json();
    const expected = process.env.APP_PASSCODE;
    if (expected && passcode !== expected) {
      return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
    }
    const cleanName = String(name ?? "").trim().slice(0, 80);
    const cleanEmail = String(email ?? "").trim().toLowerCase().slice(0, 120);
    if (!cleanName) return NextResponse.json({ error: "Enter your name" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Please tick the consent box to continue" }, { status: 400 });
    }

    const sb = db();
    const { data: existing } = await sb.from("candidates").select("id").eq("email", cleanEmail).maybeSingle();
    let id = existing?.id as string | undefined;
    if (id) {
      await sb.from("candidates").update({ last_seen: new Date().toISOString() }).eq("id", id);
    } else {
      const { data, error } = await sb.from("candidates").insert({ name: cleanName, email: cleanEmail }).select("id").single();
      if (error) throw error;
      id = data.id;
    }

    const res = NextResponse.json({ ok: true });
    const opts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    };
    res.cookies.set(CAND_COOKIE, id!, opts);
    if (expected) res.cookies.set(COOKIE, await tokenFor(expected), opts);
    return res;
  } catch (e) {
    return fail(e);
  }
}
