import Link from "next/link";
import { CURRICULUM } from "@/lib/content";
import { db, latestResume } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let resume = null as Awaited<ReturnType<typeof latestResume>>;
  const done = new Map<number, number>();
  let setupError = "";
  try {
    resume = await latestResume();
    const sb = db();
    const { data: a } = await sb.from("assignments").select("id,day");
    const { data: s } = await sb.from("submissions").select("assignment_id");
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
          PeopleSoft OTC, P2P, ESA and Travel &amp; Expense. Every question is built from Dassault context + the JD + your resume.
        </p>
      </section>

      {setupError && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          Setup needed: {setupError}
        </div>
      )}

      {!resume && !setupError && (
        <div className="card">
          <p className="font-semibold">Step 1: upload your resume</p>
          <p className="muted text-sm">Assignments and interview questions are generated from it, so this comes first.</p>
          <Link href="/resume" className="btn mt-3 inline-block">Upload resume</Link>
        </div>
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
