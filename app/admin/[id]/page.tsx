import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ROUNDS } from "@/lib/content";
import { loadCandidate, signedUrls } from "@/lib/report";
import { OUTLOOK_COLOR, TOTAL_ASSIGNMENTS, TOTAL_ROUNDS } from "@/lib/score";
import { isAdmin } from "@/lib/session";
import Actions from "./Actions";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function List({ title, items, tone }: { title: string; items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="font-semibold" style={{ color: tone }}>{title}</p>
      <ul className="list-disc pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export default async function CandidateReport({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const data = await loadCandidate(id);
  if (!data) notFound();

  const { candidate: c, resumes, assignments, submissions, interviews, turns, report, readiness: r } = data;
  const resume = resumes[0];
  const profile = resume?.profile;

  const [audio, files] = await Promise.all([
    signedUrls("answers", turns.map((t: any) => t.audio_path).filter(Boolean)),
    signedUrls("resumes", resumes.map((x: any) => x.file_path).filter(Boolean)),
  ]);

  const subsByAssignment = new Map<string, any[]>();
  for (const s of submissions) subsByAssignment.set(s.assignment_id, [...(subsByAssignment.get(s.assignment_id) ?? []), s]);
  const ai = report?.content as any;

  return (
    <div className="space-y-5">
      <div className="no-print"><Link href="/admin" className="muted text-sm hover:underline">← All candidates</Link></div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{c.name}</h1>
            <p className="muted text-sm">{c.email}</p>
            <p className="muted text-xs">Joined {new Date(c.created_at).toLocaleDateString()} · last active {new Date(c.last_seen).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{r.score}<span className="muted text-base">/100</span></p>
            <p className="font-semibold" style={{ color: OUTLOOK_COLOR[r.outlook] }}>Selection outlook: {r.outlook}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
          <div><span className="muted">Resume fit</span><br /><b>{r.fit ?? "-"}/100</b></div>
          <div><span className="muted">Assignments</span><br /><b>{r.assignmentsDone}/{TOTAL_ASSIGNMENTS}</b> · avg {r.assignmentAvg ?? "-"}</div>
          <div><span className="muted">Interviews</span><br /><b>{r.roundsDone}/{TOTAL_ROUNDS} rounds</b> · avg {r.interviewAvg ?? "-"}</div>
          <div><span className="muted">Course completion</span><br /><b>{r.completion}%</b></div>
        </div>
        <p className="muted mt-3 text-xs">
          Readiness = resume fit 25% + interviews 40% + assignments 25%, then 10% completion. The outlook is an estimate of interview readiness from practice results, not a prediction of the hiring decision.
          {r.outlook === "Not enough data" && " No finished interview yet, so the score is provisional."}
        </p>
      </div>

      <Actions candidateId={c.id} />

      {ai && (
        <div className="card space-y-3 text-sm">
          <p className="font-semibold">AI assessment <span className="muted text-xs font-normal">{new Date(ai.generated_at).toLocaleString()}</span></p>
          <p>{ai.summary}</p>
          <p><b>Recommendation:</b> {ai.recommendation}</p>
          <List title="Strengths" items={ai.strengths} tone="var(--good)" />
          <List title="Risks" items={ai.risks} tone="var(--warn)" />
          <List title="Practise next" items={ai.focus_areas} />
        </div>
      )}

      <section className="card space-y-3 text-sm">
        <p className="text-lg font-semibold">Resume</p>
        {resumes.length === 0 && <p className="muted">No resume uploaded.</p>}
        {resumes.map((x: any, i: number) => (
          <div key={x.id} className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {i === 0 ? <b>Current: </b> : "Earlier: "}
              {x.file_name ?? "Pasted text"} <span className="muted text-xs">{new Date(x.created_at).toLocaleString()}</span>
            </span>
            {x.file_path && files.get(x.file_path) && (
              <a className="btn-ghost no-print" href={files.get(x.file_path)} target="_blank" rel="noreferrer">Open original file</a>
            )}
          </div>
        ))}
        {profile && (
          <>
            <p className="muted">{profile.headline} · {profile.total_years ?? "?"} yrs · PeopleSoft hands-on: <b>{profile.peoplesoft?.has_hands_on ? "Yes" : "Not shown"}</b> {profile.peoplesoft?.modules?.join(", ")}</p>
            <List title="Strengths for the role" items={profile.strengths_for_role} tone="var(--good)" />
            <List title="Gaps versus the JD" items={profile.gaps_vs_jd} tone="var(--warn)" />
            <List title="Likely probe areas" items={profile.story_hooks} />
          </>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-lg font-semibold">Voice interviews</p>
        {interviews.length === 0 && <div className="card muted text-sm">No interviews started.</div>}
        {interviews.map((iv: any) => (
          <div key={iv.id} className="card space-y-3 text-sm">
            <div className="flex justify-between">
              <b>{ROUNDS[iv.round as 1 | 2 | 3]?.name}</b>
              <span>
                {iv.status === "done" ? <b>{iv.overall_score}/10</b> : <span className="muted">unfinished</span>}{" "}
                <span className="muted text-xs">{new Date(iv.created_at).toLocaleString()}</span>
              </span>
            </div>
            {iv.summary?.verdict && <p className="muted">{iv.summary.verdict}</p>}
            {turns.filter((t: any) => t.interview_id === iv.id).map((t: any) => (
              <div key={t.id} className="rounded-lg border p-3" style={{ borderColor: "var(--line)" }}>
                <p className="muted text-xs">Q{t.idx} · {t.score != null ? `score ${t.score}/10` : "unanswered"}</p>
                <p className="font-medium">{t.question}</p>
                <p className="mt-1 whitespace-pre-wrap"><span className="muted">Answer (transcript): </span>{t.answer || <i>skipped</i>}</p>
                {t.audio_path && audio.get(t.audio_path) && (
                  <audio className="no-print mt-2 w-full" controls preload="none" src={audio.get(t.audio_path)} />
                )}
                {t.feedback?.feedback && <p className="muted mt-1 text-xs">Feedback given: {t.feedback.feedback}</p>}
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-lg font-semibold">Assignments</p>
        {assignments.length === 0 && <div className="card muted text-sm">No assignments opened.</div>}
        {assignments.map((a: any) => {
          const subs = subsByAssignment.get(a.id) ?? [];
          const last = subs[0];
          return (
            <div key={a.id} className="card space-y-2 text-sm">
              <div className="flex justify-between">
                <b>Day {a.day}.{a.slot}: {a.title}</b>
                <span>{last ? <b>{last.score}/10</b> : <span className="muted">not submitted</span>}{subs.length > 1 && <span className="muted text-xs"> · {subs.length} attempts</span>}</span>
              </div>
              {last && (
                <>
                  <p className="whitespace-pre-wrap"><span className="muted">Answer: </span>{last.answer}</p>
                  {last.feedback?.verdict && <p className="muted">{last.feedback.verdict}</p>}
                </>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
