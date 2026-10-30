import { NextResponse } from "next/server";
import { askJson, buildContext } from "@/lib/ai";
import { ROUNDS } from "@/lib/content";
import { db } from "@/lib/db";
import { loadCandidate } from "@/lib/report";
import { fail, requireAdmin } from "@/lib/session";

export const maxDuration = 120;

const SYSTEM = `You are a hiring-panel calibrator for Dassault Systèmes writing a short internal assessment of a practice-interview candidate for a Business Process Analyst role (PeopleSoft OTC/P2P/ESA/T&E).
You are given the computed readiness numbers, the resume profile, assignment results and interview transcripts. Base every statement on that evidence; quote specifics. Do not invent facts.
Be honest that these are practice results: the outlook is an estimate of interview readiness, not a hiring prediction.
Return JSON: {"summary": string (4-6 sentences), "strengths": string[], "risks": string[], "recommendation": string (one of: "Proceed", "Proceed with preparation", "Needs more preparation") plus one sentence why, "focus_areas": string[] (what to practise next)}`;

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { candidateId } = await req.json();
    const data = await loadCandidate(String(candidateId));
    if (!data) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const profile = data.resumes[0]?.profile ?? null;
    const aTitle = new Map(data.assignments.map((a: any) => [a.id, `Day ${a.day}: ${a.title}`]));
    const seen = new Set<string>();
    const assignments = data.submissions
      .filter((s: any) => (seen.has(s.assignment_id) ? false : (seen.add(s.assignment_id), true)))
      .map((s: any) => `${aTitle.get(s.assignment_id)} | score ${s.score}/10 | ${clip(s.feedback?.verdict, 160)} | answer: ${clip(s.answer, 350)}`);
    const interviews = data.interviews
      .filter((iv: any) => iv.status === "done")
      .slice(0, 3)
      .map((iv: any) => {
        const t = data.turns
          .filter((x: any) => x.interview_id === iv.id)
          .map((x: any) => `Q: ${clip(x.question, 200)}\nA: ${clip(x.answer, 450)}\n(score ${x.score ?? "-"})`)
          .join("\n");
        return `${ROUNDS[iv.round as 1 | 2 | 3]?.name} overall ${iv.overall_score}/10\n${t}`;
      });

    const out = await askJson<Record<string, unknown>>(
      SYSTEM,
      `${buildContext(profile)}\n\nREADINESS: ${JSON.stringify(data.readiness)}\n\nASSIGNMENTS:\n${assignments.join("\n") || "(none yet)"}\n\nINTERVIEWS:\n${interviews.join("\n\n") || "(none yet)"}`,
      2000,
    );
    const content = { ...out, readiness: data.readiness, generated_at: new Date().toISOString() };
    const { error } = await db().from("reports").insert({ candidate_id: data.candidate.id, content });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
