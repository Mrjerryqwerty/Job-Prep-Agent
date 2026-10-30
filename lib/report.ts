import { db } from "./db";
import { computeReadiness, type Readiness } from "./score";

export type Candidate = { id: string; name: string; email: string; created_at: string; last_seen: string };

type SubRow = { assignment_id: string; score: number | null; created_at: string };
type IvRow = { round: number; status: string; overall_score: number | string | null; created_at: string };

// Rows must arrive newest-first, so the first one seen per key is the latest attempt.
function readinessFor(profile: any, assignmentIds: string[], subs: SubRow[], interviews: IvRow[]): Readiness {
  const mine = new Set(assignmentIds);
  const latestSub = new Map<string, number>();
  for (const s of subs) {
    if (mine.has(s.assignment_id) && s.score != null && !latestSub.has(s.assignment_id)) latestSub.set(s.assignment_id, s.score);
  }
  const latestRound = new Map<number, number>();
  for (const iv of interviews) {
    if (iv.status === "done" && iv.overall_score != null && !latestRound.has(iv.round)) {
      latestRound.set(iv.round, Number(iv.overall_score));
    }
  }
  const fit = typeof profile?.fit_score === "number" ? profile.fit_score : null;
  return computeReadiness({ fit, assignmentScores: [...latestSub.values()], roundScores: [...latestRound.values()] });
}

export async function loadSummaries() {
  const sb = db();
  const [c, r, a, s, i] = await Promise.all([
    sb.from("candidates").select("*").order("last_seen", { ascending: false }),
    // One fixed reference resume (candidate_id is null) is used for everyone.
    sb.from("resumes").select("id,candidate_id,file_name,file_path,profile,created_at").is("candidate_id", null).order("created_at", { ascending: false }).limit(1),
    sb.from("assignments").select("id,candidate_id"),
    sb.from("submissions").select("assignment_id,score,created_at").order("created_at", { ascending: false }),
    sb.from("interviews").select("candidate_id,round,status,overall_score,created_at").order("created_at", { ascending: false }),
  ]);
  for (const x of [c, r, a, s, i]) if (x.error) throw x.error;

  return (c.data as Candidate[]).map((cand) => {
    const resumes = r.data ?? [];
    const resume = resumes[0] ?? null;
    const aIds = (a.data ?? []).filter((x) => x.candidate_id === cand.id).map((x) => x.id);
    const ivs = (i.data ?? []).filter((x) => x.candidate_id === cand.id) as IvRow[];
    return {
      candidate: cand,
      resume,
      resumeCount: resumes.length,
      interviewCount: ivs.length,
      readiness: readinessFor(resume?.profile, aIds, (s.data ?? []) as SubRow[], ivs),
    };
  });
}

export async function loadCandidate(id: string) {
  const sb = db();
  const { data: cand } = await sb.from("candidates").select("*").eq("id", id).maybeSingle();
  if (!cand) return null;

  const [r, a, iv, rep] = await Promise.all([
    sb.from("resumes").select("*").is("candidate_id", null).order("created_at", { ascending: false }).limit(1),
    sb.from("assignments").select("*").eq("candidate_id", id).order("day").order("slot"),
    sb.from("interviews").select("*").eq("candidate_id", id).order("created_at", { ascending: false }),
    sb.from("reports").select("*").eq("candidate_id", id).order("created_at", { ascending: false }).limit(1),
  ]);
  for (const x of [r, a, iv, rep]) if (x.error) throw x.error;

  const aIds = (a.data ?? []).map((x) => x.id);
  const ivIds = (iv.data ?? []).map((x) => x.id);
  const [subs, turns] = await Promise.all([
    aIds.length
      ? sb.from("submissions").select("*").in("assignment_id", aIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[], error: null }),
    ivIds.length
      ? sb.from("interview_turns").select("*").in("interview_id", ivIds).order("idx")
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);
  if (subs.error) throw subs.error;
  if (turns.error) throw turns.error;

  const resumes = r.data ?? [];
  return {
    candidate: cand as Candidate,
    resumes,
    assignments: a.data ?? [],
    submissions: subs.data ?? [],
    interviews: iv.data ?? [],
    turns: turns.data ?? [],
    report: rep.data?.[0] ?? null,
    readiness: readinessFor(resumes[0]?.profile, aIds, (subs.data ?? []) as SubRow[], (iv.data ?? []) as IvRow[]),
  };
}

// Short-lived links so the admin can play recordings and open resume files from private buckets.
export async function signedUrls(bucket: "answers" | "resumes", paths: string[]) {
  const clean = paths.filter(Boolean);
  const out = new Map<string, string>();
  if (!clean.length) return out;
  const { data } = await db().storage.from(bucket).createSignedUrls(clean, 3600);
  for (const d of data ?? []) if (d.path && d.signedUrl) out.set(d.path, d.signedUrl);
  return out;
}
