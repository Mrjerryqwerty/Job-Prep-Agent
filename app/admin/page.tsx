import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { loadSummaries } from "@/lib/report";
import { OUTLOOK_COLOR, TOTAL_ASSIGNMENTS, TOTAL_ROUNDS } from "@/lib/score";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const rows = await loadSummaries();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Admin: candidates</h1>
        <p className="muted text-sm">
          Readiness is an estimate from practice results (resume fit 25%, interviews 40%, assignments 25%, completion 10%). It is not a hiring prediction.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card muted">Nobody has signed in yet.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="muted text-xs uppercase">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Resume</th>
                <th className="p-3">Assignments</th>
                <th className="p-3">Interviews</th>
                <th className="p-3">Readiness</th>
                <th className="p-3">Last active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ candidate: c, resume, readiness: r }) => (
                <tr key={c.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="p-3">
                    <Link href={`/admin/${c.id}`} className="font-semibold hover:underline">{c.name}</Link>
                    <div className="muted text-xs">{c.email}</div>
                  </td>
                  <td className="p-3">
                    <div>{resume?.file_name ?? "Reference resume"}</div><div className="muted text-xs">fit {r.fit ?? "-"}/100 (same for everyone)</div>
                  </td>
                  <td className="p-3">
                    {r.assignmentsDone}/{TOTAL_ASSIGNMENTS}
                    <div className="muted text-xs">avg {r.assignmentAvg ?? "-"}/100</div>
                  </td>
                  <td className="p-3">
                    {r.roundsDone}/{TOTAL_ROUNDS} rounds
                    <div className="muted text-xs">avg {r.interviewAvg ?? "-"}/100</div>
                  </td>
                  <td className="p-3">
                    <b className="text-lg">{r.score}</b>
                    <div className="text-xs font-semibold" style={{ color: OUTLOOK_COLOR[r.outlook] }}>{r.outlook}</div>
                  </td>
                  <td className="muted p-3 text-xs">{new Date(c.last_seen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
