import { NextResponse } from "next/server";
import { assignmentFor } from "@/lib/bank-assignments";
import { db } from "@/lib/db";
import { evaluate } from "@/lib/rubric";
import { candidateId, fail } from "@/lib/session";

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
    const bank = assignmentFor(a.day, a.slot);
    if (!bank) return NextResponse.json({ error: "Assignment is not in the bank" }, { status: 500 });

    const ev = evaluate(String(answer), bank.points, bank.minWords);
    const fb = {
      score: ev.score,
      verdict: ev.feedback,
      strengths: ev.strengths,
      improvements: ev.improvements,
      model_answer_outline: bank.outline,
      resume_link: bank.resumeTie,
    };
    const { data, error } = await sb
      .from("submissions")
      .insert({ assignment_id: assignmentId, answer, score: ev.score, feedback: fb })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ submission: data });
  } catch (e) {
    return fail(e);
  }
}
