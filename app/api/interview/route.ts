import { NextResponse } from "next/server";
import { askJson, buildContext } from "@/lib/ai";
import { ROUNDS, type RoundNo } from "@/lib/content";
import { db, latestResume } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

export const maxDuration = 120;

function system(round: RoundNo) {
  const r = ROUNDS[round];
  return `You are ${r.persona}, conducting ${r.name} for a Business Process Analyst role (PeopleSoft OTC/P2P/ESA/T&E) at Dassault Systèmes Pune. This is a SPOKEN interview: keep every question to 1-3 sentences, natural, no lists, no markdown.
Each question must merge three sources: Dassault context, the JD, and the candidate's real resume. Round focus: ${r.focus}
Mix: roughly 40% JD-driven, 40% probing specific resume items by name (claims, projects, gaps), 20% company/behavioural. Never repeat a question. Adapt follow-ups to the previous answer.`;
}

export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const body = await req.json();
    const sb = db();

    if (body.action === "start") {
      const round = Number(body.round) as RoundNo;
      if (!ROUNDS[round]) return NextResponse.json({ error: "Bad round" }, { status: 400 });
      const resume = await latestResume(cid);
      if (!resume) return NextResponse.json({ error: "no_resume" }, { status: 409 });
      const out = await askJson<{ question: string }>(
        system(round),
        `${buildContext(resume.profile)}\n\nGreet the candidate briefly in one sentence and ask question 1 of ${ROUNDS[round].questions}. Return {"question": "..."} (greeting included in the same string).`,
        600,
      );
      const { data: iv, error } = await sb
        .from("interviews")
        .insert({ candidate_id: cid, round, total: ROUNDS[round].questions })
        .select()
        .single();
      if (error) throw error;
      await sb.from("interview_turns").insert({ interview_id: iv.id, idx: 1, question: out.question });
      return NextResponse.json({ interviewId: iv.id, idx: 1, total: iv.total, question: out.question });
    }

    if (body.action === "answer") {
      const { interviewId, answer } = body;
      const { data: iv } = await sb
        .from("interviews")
        .select("*")
        .eq("id", interviewId)
        .eq("candidate_id", cid)
        .maybeSingle();
      if (!iv) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
      const { data: turns } = await sb
        .from("interview_turns")
        .select("*")
        .eq("interview_id", interviewId)
        .order("idx");
      const cur = turns![turns!.length - 1];
      const isLast = cur.idx >= iv.total;
      const resume = await latestResume(cid);

      const history = turns!
        .slice(0, -1)
        .map((t) => `Q${t.idx}: ${t.question}\nA: ${t.answer ?? "(skipped)"}\n(score ${t.score ?? "-"})`)
        .join("\n\n");

      const out = await askJson<{
        score: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
        sample_answer: string;
        next_question?: string;
        summary?: { overall_score: number; verdict: string; strengths: string[]; weaknesses: string[]; next_steps: string[] };
      }>(
        system(iv.round),
        `${buildContext(resume?.profile ?? null)}\n\nPrevious turns:\n${history || "(none)"}\n\nCurrent question (Q${cur.idx} of ${iv.total}): ${cur.question}\nCandidate's spoken answer (speech-to-text, may have small recognition errors): ${answer || "(skipped)"}\n\nEvaluate the answer: "score" 1-10, "feedback" = 2-3 spoken sentences addressed to the candidate, "strengths", "improvements" (short lists), "sample_answer" = a concise strong answer in first person.\n${
          isLast
            ? 'This was the LAST question: also include "summary" {overall_score (1-10, whole interview), verdict, strengths[], weaknesses[], next_steps[]} using all turns. No next_question.'
            : `Also include "next_question": question ${cur.idx + 1} of ${iv.total}, 1-3 spoken sentences.`
        }`,
        2500,
      );

      await sb
        .from("interview_turns")
        .update({
          answer,
          score: out.score,
          feedback: { feedback: out.feedback, strengths: out.strengths, improvements: out.improvements, sample_answer: out.sample_answer },
        })
        .eq("id", cur.id);

      if (isLast || !out.next_question) {
        await sb
          .from("interviews")
          .update({ status: "done", summary: out.summary ?? null, overall_score: out.summary?.overall_score ?? out.score })
          .eq("id", interviewId);
        return NextResponse.json({ done: true, evaluation: out, summary: out.summary ?? null });
      }
      await sb.from("interview_turns").insert({ interview_id: interviewId, idx: cur.idx + 1, question: out.next_question });
      return NextResponse.json({ done: false, evaluation: out, idx: cur.idx + 1, total: iv.total, question: out.next_question });
    }

    return NextResponse.json({ error: "Bad action" }, { status: 400 });
  } catch (e) {
    return fail(e);
  }
}
