import { NextResponse } from "next/server";
import { questionById, questionsFor, type Q } from "@/lib/bank-interview";
import { ROUNDS, type RoundNo } from "@/lib/content";
import { db } from "@/lib/db";
import { bandVerdict, evaluate } from "@/lib/rubric";
import { candidateId, fail } from "@/lib/session";

const GREETING = "Hello, thanks for joining. Let's begin. ";

function shuffle<T>(a: T[]) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// Core questions are always asked; the rest are sampled so repeat attempts differ. Bank order is kept.
function pick(round: RoundNo): Q[] {
  const all = questionsFor(round);
  const n = Math.min(ROUNDS[round].questions, all.length);
  const core = all.filter((q) => q.core);
  const extra = shuffle(all.filter((q) => !q.core)).slice(0, Math.max(0, n - core.length));
  const chosen = new Set([...core, ...extra].map((q) => q.id));
  return all.filter((q) => chosen.has(q.id));
}

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / (a.length || 1);

export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const body = await req.json();
    const sb = db();

    if (body.action === "start") {
      const round = Number(body.round) as RoundNo;
      if (!ROUNDS[round]) return NextResponse.json({ error: "Bad round" }, { status: 400 });
      const qs = pick(round);
      const { data: iv, error } = await sb
        .from("interviews")
        .insert({ candidate_id: cid, round, total: qs.length })
        .select()
        .single();
      if (error) throw error;
      const { error: te } = await sb
        .from("interview_turns")
        .insert(qs.map((q, i) => ({ interview_id: iv.id, idx: i + 1, qid: q.id, question: q.q })));
      if (te) throw te;
      return NextResponse.json({ interviewId: iv.id, idx: 1, total: qs.length, question: GREETING + qs[0].q });
    }

    if (body.action === "answer") {
      const { interviewId } = body;
      const answer = String(body.answer ?? "").trim();
      const { data: iv } = await sb
        .from("interviews")
        .select("*")
        .eq("id", interviewId)
        .eq("candidate_id", cid)
        .maybeSingle();
      if (!iv) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
      const { data: turns } = await sb.from("interview_turns").select("*").eq("interview_id", interviewId).order("idx");
      const cur = (turns ?? []).find((t) => t.answer === null);
      if (!cur) return NextResponse.json({ error: "This interview is already finished" }, { status: 409 });
      const q = questionById(cur.qid);
      if (!q) return NextResponse.json({ error: "Question not found in the bank" }, { status: 500 });

      const ev = evaluate(answer, q.points, q.minWords ?? 45);
      const feedbackRow = {
        feedback: ev.feedback,
        strengths: ev.strengths,
        improvements: ev.improvements,
        sample_answer: q.model,
        covered: ev.covered,
        missed: ev.missed,
      };
      await sb.from("interview_turns").update({ answer, score: ev.score, feedback: feedbackRow }).eq("id", cur.id);

      const evaluation = { score: ev.score, feedback: ev.feedback, strengths: ev.strengths, improvements: ev.improvements, sample_answer: q.model };
      const next = (turns ?? []).find((t) => t.idx > cur.idx);
      if (next) {
        return NextResponse.json({ done: false, evaluation, idx: next.idx, total: iv.total, question: next.question });
      }

      // Last question: summarise the whole interview from the stored scores.
      const all = (turns ?? []).map((t) => (t.id === cur.id ? { ...t, score: ev.score, feedback: feedbackRow } : t));
      const overall = Math.max(1, Math.round(mean(all.map((t) => t.score ?? 0))));
      const byTag = new Map<string, number[]>();
      for (const t of all) {
        const tag = questionById(t.qid)?.tag;
        if (tag) byTag.set(tag, [...(byTag.get(tag) ?? []), t.score ?? 0]);
      }
      const tags = [...byTag].map(([tag, s]) => ({ tag, avg: mean(s) }));
      const worst = [...all].sort((a, b) => (a.score ?? 0) - (b.score ?? 0)).slice(0, 3);
      const summary = {
        overall_score: overall,
        verdict: bandVerdict(overall),
        strengths: tags.filter((t) => t.avg >= 7).map((t) => `${t.tag}: you covered what a panel expects`),
        weaknesses: tags.filter((t) => t.avg < 5).map((t) => `${t.tag}: answers were missing key points`),
        next_steps: worst
          .filter((t) => (t.score ?? 0) < 8)
          .map((t) => {
            const bq = questionById(t.qid);
            const missed = t.feedback?.missed?.[0];
            return `Day ${bq?.day} (${bq?.tag}): ${missed ? `work on ${missed}` : "revisit the model answer"}`;
          }),
      };
      await sb.from("interviews").update({ status: "done", summary, overall_score: overall }).eq("id", interviewId);
      return NextResponse.json({ done: true, evaluation, summary });
    }

    return NextResponse.json({ error: "Bad action" }, { status: 400 });
  } catch (e) {
    return fail(e);
  }
}
