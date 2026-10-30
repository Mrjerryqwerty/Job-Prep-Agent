import { questionById } from "./bank-interview";
import type { loadCandidate } from "./report";

type Data = NonNullable<Awaited<ReturnType<typeof loadCandidate>>>;
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / (a.length || 1);

// Rule-based assessment from the candidate's real scores. No AI involved, so it is the same every time.
export function buildAssessment(data: Data) {
  const r = data.readiness;
  const profile = data.resumes[0]?.profile;

  const tagScores = new Map<string, { scores: number[]; day: number }>();
  for (const t of data.turns) {
    const q = t.qid ? questionById(t.qid) : undefined;
    if (!q || t.score == null) continue;
    const cur = tagScores.get(q.tag) ?? { scores: [], day: q.day };
    cur.scores.push(t.score);
    tagScores.set(q.tag, cur);
  }
  const tags = [...tagScores].map(([tag, v]) => ({ tag, day: v.day, avg: mean(v.scores) }));
  const strongTags = tags.filter((t) => t.avg >= 7).sort((a, b) => b.avg - a.avg);
  const weakTags = tags.filter((t) => t.avg < 5).sort((a, b) => a.avg - b.avg);

  const latest = new Map<string, any>();
  for (const s of data.submissions) if (!latest.has(s.assignment_id)) latest.set(s.assignment_id, s);
  const graded = [...latest.values()].map((s) => {
    const a = data.assignments.find((x: any) => x.id === s.assignment_id);
    return { title: a ? `Day ${a.day}: ${a.title}` : "Assignment", day: a?.day as number | undefined, score: s.score as number };
  });
  const weakAssignments = graded.filter((g) => g.score < 5).sort((a, b) => a.score - b.score);
  const strongAssignments = graded.filter((g) => g.score >= 7).sort((a, b) => b.score - a.score);

  const recommendation =
    r.outlook === "High" ? "Proceed: the practice results show good coverage of what a panel will ask."
    : r.outlook === "Moderate" ? "Proceed with preparation: solid base, but close the gaps below first."
    : r.outlook === "Low" ? "Needs more preparation: several expected topics were not covered."
    : "Not enough practice data yet: finish at least one full interview round before judging readiness.";

  const summary =
    `${data.candidate.name} has finished ${r.roundsDone} of 3 interview rounds and ${r.assignmentsDone} of 14 assignments. ` +
    `Readiness is ${r.score}/100 and the selection outlook is "${r.outlook}". ` +
    `Resume fit with the JD is ${r.fit ?? "n/a"}/100, interviews average ${r.interviewAvg ?? "n/a"}/100 and assignments ${r.assignmentAvg ?? "n/a"}/100. ` +
    (weakTags.length ? `The weakest interview areas are ${weakTags.slice(0, 3).map((t) => t.tag).join(", ")}. ` : "") +
    (strongTags.length ? `The strongest are ${strongTags.slice(0, 3).map((t) => t.tag).join(", ")}.` : "") +
    " This is an estimate of interview readiness from practice results, not a prediction of the hiring decision.";

  const lowestTurns = [...data.turns]
    .filter((t: any) => t.score != null && t.feedback?.missed?.length)
    .sort((a: any, b: any) => a.score - b.score)
    .slice(0, 3);

  return {
    summary,
    recommendation,
    strengths: [
      ...strongTags.slice(0, 3).map((t) => `${t.tag}: average ${t.avg.toFixed(1)}/10 in interviews`),
      ...strongAssignments.slice(0, 2).map((g) => `${g.title}: ${g.score}/10`),
      ...(profile?.strengths_for_role ?? []).slice(0, 2),
    ],
    risks: [
      ...weakTags.slice(0, 3).map((t) => `${t.tag}: average ${t.avg.toFixed(1)}/10 in interviews`),
      ...weakAssignments.slice(0, 2).map((g) => `${g.title}: ${g.score}/10`),
      ...(profile?.gaps_vs_jd ?? []).slice(0, 3).map((g: string) => `Resume gap: ${g}`),
    ],
    focus_areas: [
      ...weakTags.slice(0, 3).map((t) => `Revisit Day ${t.day}: ${t.tag}`),
      ...lowestTurns.map((t: any) => {
        const q = questionById(t.qid);
        return `${q?.tag ?? "Question"}: ${t.feedback.missed[0]}`;
      }),
    ],
    readiness: r,
    generated_at: new Date().toISOString(),
  };
}
