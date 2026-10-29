"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSpeech } from "@/lib/useSpeech";

type A = { id: string; slot: number; title: string; type: string; prompt: string };
type S = { id: string; assignment_id: string; answer: string; score: number; feedback: any };

function Card({ a, last, onDone }: { a: A; last?: S; onDone: (s: S) => void }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sp = useSpeech();
  const [base, setBase] = useState("");

  useEffect(() => { if (sp.listening) setAnswer((base ? base + " " : "") + sp.transcript); }, [sp.transcript, sp.listening, base]);

  async function submit() {
    sp.stop(); setBusy(true); setErr("");
    const r = await fetch("/api/grade", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ assignmentId: a.id, answer }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Failed");
    onDone(d.submission);
  }

  const fb = last?.feedback;
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Assignment {a.slot}: {a.title}</p>
        <span className="muted text-xs uppercase">{a.type}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{a.prompt}</p>
      <textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer, or use the mic to dictate." />
      <div className="flex flex-wrap items-center gap-2">
        {sp.supported && (
          sp.listening
            ? <button className="btn-ghost" onClick={sp.stop}>Stop mic</button>
            : <button className="btn-ghost" onClick={() => { setBase(answer); sp.start(); }}>Dictate</button>
        )}
        <button className="btn" onClick={submit} disabled={busy || answer.trim().length < 20}>
          {busy ? "Grading…" : last ? "Resubmit for feedback" : "Submit for feedback"}
        </button>
        {err && <span style={{ color: "var(--warn)" }} className="text-sm">{err}</span>}
      </div>
      {fb && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--line)" }}>
          <p className="font-semibold">Score {last!.score}/10 <span className="muted font-normal">{fb.verdict}</span></p>
          {fb.strengths?.length > 0 && <><p className="mt-2 font-semibold" style={{ color: "var(--good)" }}>Strengths</p><ul className="list-disc pl-5">{fb.strengths.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></>}
          {fb.improvements?.length > 0 && <><p className="mt-2 font-semibold" style={{ color: "var(--warn)" }}>Improve</p><ul className="list-disc pl-5">{fb.improvements.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></>}
          {fb.model_answer_outline && <><p className="mt-2 font-semibold">Strong answer outline</p><p className="whitespace-pre-wrap">{fb.model_answer_outline}</p></>}
          {fb.resume_link && <p className="muted mt-2">Tie to your resume: {fb.resume_link}</p>}
        </div>
      )}
    </div>
  );
}

export default function Assignments({ day }: { day: number }) {
  const [items, setItems] = useState<A[] | null>(null);
  const [subs, setSubs] = useState<S[]>([]);
  const [err, setErr] = useState("");
  const [noResume, setNoResume] = useState(false);

  useEffect(() => {
    fetch("/api/day", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ day }) })
      .then(async (r) => ({ r, d: await r.json() }))
      .then(({ r, d }) => {
        if (r.status === 409) return setNoResume(true);
        if (!r.ok) return setErr(d.error ?? "Failed");
        setItems(d.assignments); setSubs(d.submissions);
      })
      .catch((e) => setErr(String(e)));
  }, [day]);

  if (noResume) return <div className="card">Upload your resume first so today&apos;s assignments can be built around it. <Link href="/resume" className="btn ml-2 inline-block">Upload</Link></div>;
  if (err) return <div className="card" style={{ color: "var(--warn)" }}>{err}</div>;
  if (!items) return <div className="card muted">Building today&apos;s two assignments from the JD, Dassault context and your resume…</div>;
  return (
    <div className="space-y-4">
      {items.map((a) => (
        <Card key={a.id} a={a} last={subs.find((s) => s.assignment_id === a.id)} onDone={(s) => setSubs((p) => [s, ...p])} />
      ))}
    </div>
  );
}
