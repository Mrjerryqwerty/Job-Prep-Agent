import { NextResponse } from "next/server";
import { buildAssessment } from "@/lib/assessment";
import { db } from "@/lib/db";
import { loadCandidate } from "@/lib/report";
import { fail, requireAdmin } from "@/lib/session";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { candidateId } = await req.json();
    const data = await loadCandidate(String(candidateId));
    if (!data) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    const { error } = await db().from("reports").insert({ candidate_id: data.candidate.id, content: buildAssessment(data) });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
