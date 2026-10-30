import { NextResponse } from "next/server";
import { askJson, buildContext } from "@/lib/ai";
import { db, latestResume } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

export const maxDuration = 120;

const SYSTEM = `You are a strict but constructive Dassault Systèmes interviewer grading an assignment answer for a Business Process Analyst (PeopleSoft OTC/P2P/ESA/T&E) role.
Judge against the JD and what a hiring panel would expect, not just correctness. If the answer is vague, say so.
Return JSON: {"score": 1-10 integer, "verdict": one sentence, "strengths": string[], "improvements": string[], "model_answer_outline": string (concise outline of a strong answer; for SQL include a reference query), "resume_link": string (how to tie this to something real in the candidate's resume, or empty)}`;

export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const { assignmentId, answer } = await req.json();
    if (!answer || String(answer).trim().length < 20) {
      return NextResponse.json({ error: "Write a fuller answer first" }, { status: 400 });
    }
    const sb = db();
    const { data: a } = await sb
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .eq("candidate_id", cid)
      .maybeSingle();
    if (!a) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    const resume = await latestResume(cid);
    const fb = await askJson<{ score: number }>(
      SYSTEM,
      `${buildContext(resume?.profile ?? null)}\n\nASSIGNMENT: ${a.title}\n${a.prompt}\n\nCANDIDATE ANSWER:\n${answer}`,
      2500,
    );
    const { data, error } = await sb
      .from("submissions")
      .insert({ assignment_id: assignmentId, answer, score: fb.score, feedback: fb })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ submission: data });
  } catch (e) {
    return fail(e);
  }
}
