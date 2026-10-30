import { NextResponse } from "next/server";
import { askJson, buildContext } from "@/lib/ai";
import { CURRICULUM } from "@/lib/content";
import { db, latestResume } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

export const maxDuration = 120;

const SYSTEM = `You write interview-prep assignments for a candidate preparing for a Business Process Analyst role (PeopleSoft OTC/P2P/ESA/T&E) at Dassault Systèmes Pune.
Merge three things: (1) Dassault context, (2) the JD, (3) the candidate's actual resume. Reference the candidate's real projects/skills by name where it helps, and target their gaps versus the JD.
For SQL assignments give a small simplified schema (say it is illustrative, not the exact PeopleSoft record layout), sample rows if useful, and 3 numbered tasks.
For scenario/written assignments give a realistic situation, what to produce, and 3-5 grading criteria. Keep each prompt under 350 words, plain text with line breaks, no markdown headers.
Return JSON: {"assignments":[{"title":string,"prompt":string},{"title":string,"prompt":string}]} in the same order as the seeds.`;

// Returns (and lazily generates + stores) the two assignments for a day, with latest submissions.
export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const { day } = await req.json();
    const d = CURRICULUM.find((x) => x.n === Number(day));
    if (!d) return NextResponse.json({ error: "Bad day" }, { status: 400 });

    const sb = db();
    let { data: rows } = await sb.from("assignments").select("*").eq("candidate_id", cid).eq("day", d.n).order("slot");
    if (!rows || rows.length < 2) {
      const resume = await latestResume(cid);
      if (!resume) return NextResponse.json({ error: "no_resume" }, { status: 409 });
      const seeds = d.slots.map((s, i) => `${i + 1}. [${s.type}] ${s.title}: ${s.seed}`).join("\n");
      const out = await askJson<{ assignments: { title: string; prompt: string }[] }>(
        SYSTEM,
        `${buildContext(resume.profile)}\n\nDay ${d.n}: ${d.theme}\nSeeds:\n${seeds}`,
        3500,
      );
      const ins = d.slots.map((s, i) => ({
        candidate_id: cid,
        day: d.n,
        slot: i + 1,
        type: s.type,
        title: out.assignments[i]?.title ?? s.title,
        prompt: out.assignments[i]?.prompt ?? s.seed,
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
