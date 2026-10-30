import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, CAND_COOKIE, tokenFor } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The proxy has already gated the request; this reads which candidate it is.
export async function candidateId(): Promise<string> {
  const v = (await cookies()).get(CAND_COOKIE)?.value;
  if (!v || !UUID.test(v)) throw new HttpError(401, "Please sign in again");
  return v;
}

export async function isAdmin(): Promise<boolean> {
  const pass = process.env.ADMIN_PASSCODE;
  if (!pass) return false;
  return (await cookies()).get(ADMIN_COOKIE)?.value === (await tokenFor(pass, "admin"));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new HttpError(401, "Admin only");
}

export function fail(e: any) {
  return NextResponse.json({ error: e?.message ?? "Failed" }, { status: e?.status ?? 500 });
}
