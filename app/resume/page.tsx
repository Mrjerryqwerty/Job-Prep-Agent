"use client";
import { useEffect, useState } from "react";

type Profile = {
  name?: string; headline?: string; total_years?: number | null; current_role?: string;
  skills?: string[]; peoplesoft?: { has_hands_on: boolean; modules: string[]; evidence: string };
  strengths_for_role?: string[]; gaps_vs_jd?: string[]; story_hooks?: string[];
  projects?: { name: string; what: string; impact: string }[];
};

function List({ title, items, tone }: { title: string; items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div className="card">
      <p className="font-semibold" style={{ color: tone }}>{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("/api/resume").then((r) => r.json()).then((d) => setProfile(d.resume?.profile ?? null)).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    if (text.trim()) fd.set("text", text);
    const r = await fetch("/api/resume", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Failed");
    setProfile(d.profile);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Resume &amp; fit analysis</h1>
      <form onSubmit={submit} className="card space-y-3">
        <p className="muted text-sm">Upload a PDF or text file, or paste the text. Uploading again replaces what questions are based on.</p>
        <input type="file" name="file" accept=".pdf,.txt,.md" className="text-sm" />
        <textarea rows={4} placeholder="...or paste resume text" value={text} onChange={(e) => setText(e.target.value)} />
        {err && <p style={{ color: "var(--warn)" }}>{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Analysing against the JD… (about 20-30 seconds)" : "Analyse resume"}</button>
      </form>

      {profile && (
        <div className="space-y-3">
          <div className="card">
            <p className="text-lg font-semibold">{profile.name} <span className="muted text-sm">{profile.current_role}</span></p>
            <p className="muted text-sm">{profile.headline}</p>
            <p className="mt-2 text-sm">
              PeopleSoft hands-on:{" "}
              <b style={{ color: profile.peoplesoft?.has_hands_on ? "var(--good)" : "var(--warn)" }}>
                {profile.peoplesoft?.has_hands_on ? "Yes" : "Not shown"}
              </b>{" "}
              {profile.peoplesoft?.modules?.join(", ")}
            </p>
            <p className="muted mt-1 text-sm">{profile.peoplesoft?.evidence}</p>
          </div>
          <List title="Strengths for this role" items={profile.strengths_for_role} tone="var(--good)" />
          <List title="Gaps versus the JD (expect these to be probed)" items={profile.gaps_vs_jd} tone="var(--warn)" />
          <List title="Resume items interviewers will dig into" items={profile.story_hooks} />
        </div>
      )}
    </div>
  );
}
