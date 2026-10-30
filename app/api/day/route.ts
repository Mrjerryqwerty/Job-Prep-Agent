import { NextResponse } from "next/server";
import { ASSIGNMENTS } from "@/lib/bank-assignments";
import { CURRICULUM } from "@/lib/content";
import { db } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

// Returns the two assignments for a day (created for this candidate on first open), with their submissions.
export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const { day } = await req.json();
    const d = CURRICULUM.find((x) => x.n === Number(day));
    if (!d) return NextResponse.json({ error: "Bad day" }, { status: 400 });

    const sb = db();
    let { data: rows } = await sb.from("assignments").select("*").eq("candidate_id", cid).eq("day", d.n).order("slot");
    if (!rows || rows.length < 2) {
      const ins = ASSIGNMENTS.filter((a) => a.day === d.n).map((a) => ({
        candidate_id: cid, day: a.day, slot: a.slot, type: a.type, title: a.title, prompt: a.prompt,
      }));
      const { error } = await sb
        .from("assignments")
        .upsert(ins, { onConflict: "candidate_id,day,slot", ignoreDuplicates: true });
      if (error) throw error;
      ({ data: rows } = await sb.from("assignments").select("*").eq("candidate_id", cid).eq("day", d.n).order("slot"));
    }
    const ids = (rows ?? []).map((r) => r.id);
    const { data: subs } = await sb
      .from("submissions")
      .select("*")
      .in("assignment_id", ids)
      .order("created_at", { ascending: false });
    return NextResponse.json({ assignments: rows, submissions: subs ?? [] });
  } catch (e) {
    return fail(e);
  }
}
