import Link from "next/link";
import { redirect } from "next/navigation";
import { CURRICULUM } from "@/lib/content";
import { db, referenceResume } from "@/lib/db";
import { candidateId } from "@/lib/session";

export const dynamic = "force-dynamic";

function List({ title, items, tone }: { title: string; items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="font-semibold" style={{ color: tone }}>{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export default async function Home() {
  let cid: string;
  try { cid = await candidateId(); } catch { redirect("/login"); }

  let profile: any = null;
  let name = "";
  const done = new Map<number, number>();
  let setupError = "";
  try {
    const sb = db();
    profile = (await referenceResume())?.profile ?? null;
    const { data: c } = await sb.from("candidates").select("name").eq("id", cid).maybeSingle();
    name = c?.name ?? "";
    const { data: a } = await sb.from("assignments").select("id,day").eq("candidate_id", cid);
    const ids = (a ?? []).map((x) => x.id);
    const { data: s } = ids.length
      ? await sb.from("submissions").select("assignment_id").in("assignment_id", ids)
      : { data: [] as { assignment_id: string }[] };
    const submitted = new Set((s ?? []).map((x) => x.assignment_id));
    for (const row of a ?? []) if (submitted.has(row.id)) done.set(row.day, (done.get(row.day) ?? 0) + 1);
  } catch (e: any) {
    setupError = e.message;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Business Process Analyst, Dassault Systèmes Pune</h1>
        <p className="muted mt-1">
          {name ? `Welcome, ${name}. ` : ""}PeopleSoft OTC, P2P, ESA and Travel &amp; Expense. Every question is built from Dassault context + the JD + the reference resume.
        </p>
      </section>

      {setupError && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          Setup needed: {setupError}
        </div>
      )}

      {profile && (
        <details className="card text-sm">
          <summary className="cursor-pointer font-semibold">
            Reference resume: {profile.name} · fit with the JD {profile.fit_score}/100
          </summary>
          <div className="mt-3 space-y-3">
            <p className="muted">{profile.headline}</p>
            <List title="Strengths for this role" items={profile.strengths_for_role} tone="var(--good)" />
            <List title="Gaps versus the JD (expect these to be probed)" items={profile.gaps_vs_jd} tone="var(--warn)" />
            <List title="Resume items the interviewers will dig into" items={profile.story_hooks} />
          </div>
        </details>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        {CURRICULUM.map((d) => (
          <Link key={d.n} href={`/day/${d.n}`} className="card hover:opacity-90">
            <div className="flex items-center justify-between">
              <span className="muted text-xs font-semibold uppercase">Day {d.n}</span>
              <span className="text-xs" style={{ color: (done.get(d.n) ?? 0) === 2 ? "var(--good)" : "var(--muted)" }}>
                {done.get(d.n) ?? 0}/2 done
              </span>
            </div>
            <p className="mt-1 font-semibold">{d.theme}</p>
          </Link>
        ))}
      </section>

      <section className="card">
        <p className="font-semibold">Mock interviews (voice)</p>
        <p className="muted text-sm">Round 1 technical, Round 2 leads (30 min), Round 3 manager.</p>
        <Link href="/interview" className="btn mt-3 inline-block">Open interview room</Link>
      </section>
    </div>
  );
}
