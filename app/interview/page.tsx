import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUNDS } from "@/lib/content";
import { db } from "@/lib/db";
import { candidateId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InterviewHome() {
  let cid: string;
  try { cid = await candidateId(); } catch { redirect("/login"); }

  let past: any[] = [];
  try {
    const { data } = await db()
      .from("interviews")
      .select("*")
      .eq("candidate_id", cid)
      .eq("status", "done")
      .order("created_at", { ascending: false })
      .limit(10);
    past = data ?? [];
  } catch {}
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Voice interview room</h1>
      <p className="muted text-sm">The interviewer speaks, you answer out loud, then you get feedback and a score. Use Chrome or Edge and allow the microphone. Your spoken answers are recorded and visible to the admin.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {([1, 2, 3] as const).map((n) => (
          <Link key={n} href={`/interview/${n}`} className="card hover:opacity-90">
            <p className="font-semibold">{ROUNDS[n].name}</p>
            <p className="muted mt-1 text-sm">{ROUNDS[n].questions} questions</p>
          </Link>
        ))}
      </div>
      {past.length > 0 && (
        <div className="card">
          <p className="font-semibold">Past sessions</p>
          <ul className="mt-2 space-y-1 text-sm">
            {past.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{ROUNDS[p.round as 1 | 2 | 3]?.name} <span className="muted">{new Date(p.created_at).toLocaleString()}</span></span>
                <b>{p.overall_score ?? "-"}/10</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
