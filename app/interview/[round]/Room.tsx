"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSpeech } from "@/lib/useSpeech";

type Evalu = { score: number; feedback: string; strengths: string[]; improvements: string[]; sample_answer: string };
type Summary = { overall_score: number; verdict: string; strengths: string[]; weaknesses: string[]; next_steps: string[] };
type Phase = "idle" | "asking" | "listening" | "grading" | "feedback" | "done";

export default function Room({ round, name }: { round: number; name: string }) {
  const sp = useSpeech();
  const [phase, setPhase] = useState<Phase>("idle");
  const [id, setId] = useState("");
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [total, setTotal] = useState(0);
  const [ev, setEv] = useState<Evalu | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [answer, setAnswer] = useState("");
  const [err, setErr] = useState("");
  const [spoken, setSpoken] = useState(true);
  const next = useRef<{ q: string; idx: number } | null>(null);

  useEffect(() => { if (phase === "listening") setAnswer(sp.transcript); }, [sp.transcript, phase]);

  async function ask(question: string, i: number) {
    setQ(question); setIdx(i); setEv(null); setAnswer(""); setPhase("asking");
    if (spoken) await sp.speak(question);
    setPhase("listening");
    if (sp.supported) sp.start();
  }

  async function call(body: object) {
    const r = await fetch("/api/interview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error === "no_resume" ? "Upload your resume first (Resume & fit)." : d.error ?? "Failed");
    return d;
  }

  async function start() {
    setErr("");
    try {
      setPhase("grading");
      const d = await call({ action: "start", round });
      setId(d.interviewId); setTotal(d.total);
      await ask(d.question, d.idx);
    } catch (e: any) { setErr(e.message); setPhase("idle"); }
  }

  async function submit(skip = false) {
    sp.stop(); sp.cancelSpeech(); setPhase("grading"); setErr("");
    try {
      const d = await call({ action: "answer", interviewId: id, answer: skip ? "" : answer });
      setEv(d.evaluation);
      if (d.done) setSummary(d.summary); else next.current = { q: d.question, idx: d.idx };
      setPhase("feedback");
      if (spoken) await sp.speak(d.evaluation.feedback);
    } catch (e: any) { setErr(e.message); setPhase("listening"); }
  }

  function proceed() {
    sp.cancelSpeech();
    if (next.current) { const n = next.current; next.current = null; ask(n.q, n.idx); } else setPhase("done");
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/interview" className="muted text-sm hover:underline">← Rounds</Link>
        <h1 className="mt-1 text-2xl font-bold">{name}</h1>
      </div>
      {!sp.supported && <div className="card text-sm" style={{ color: "var(--warn)" }}>This browser has no speech recognition. Use Chrome or Edge for voice; you can still type answers.</div>}
      {err && <div className="card" style={{ color: "var(--warn)" }}>{err}</div>}

      {phase === "idle" && (
        <div className="card space-y-3">
          <p className="text-sm">Questions are built from Dassault context, the JD and your resume. Speak naturally and click <b>Done answering</b> when finished.</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={spoken} onChange={(e) => setSpoken(e.target.checked)} /> Interviewer speaks aloud</label>
          <button className="btn" onClick={start}>Start interview</button>
        </div>
      )}

      {phase !== "idle" && phase !== "done" && (
        <div className="card space-y-3">
          <p className="muted text-xs uppercase">Question {idx} of {total}</p>
          <p className="text-lg font-medium">{q}</p>
          {(phase === "asking") && <p className="muted text-sm">Interviewer speaking…</p>}
          {(phase === "listening" || phase === "grading") && (
            <>
              <textarea rows={6} value={answer} onChange={(e) => { setAnswer(e.target.value); }} placeholder="Your spoken answer appears here (editable)." disabled={phase === "grading"} />
              <div className="flex flex-wrap items-center gap-2">
                {phase === "listening" && <span className="text-sm" style={{ color: sp.listening ? "var(--good)" : "var(--muted)" }}>{sp.listening ? "● Listening" : "Mic off"}</span>}
                {phase === "listening" && (sp.listening
                  ? <button className="btn-ghost" onClick={sp.stop}>Pause mic</button>
                  : <button className="btn-ghost" onClick={() => sp.start(answer)}>Resume mic</button>)}
                <button className="btn-ghost" onClick={() => sp.speak(q)} disabled={phase === "grading"}>Repeat question</button>
                <button className="btn-ghost" onClick={() => submit(true)} disabled={phase === "grading"}>Skip</button>
                <button className="btn" onClick={() => submit()} disabled={phase === "grading" || answer.trim().length < 3}>
                  {phase === "grading" ? "Evaluating…" : "Done answering"}
                </button>
              </div>
            </>
          )}
          {phase === "feedback" && ev && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Score {ev.score}/10</p>
              <p>{ev.feedback}</p>
              <p className="font-semibold" style={{ color: "var(--good)" }}>Strengths</p>
              <ul className="list-disc pl-5">{ev.strengths?.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <p className="font-semibold" style={{ color: "var(--warn)" }}>Improve</p>
              <ul className="list-disc pl-5">{ev.improvements?.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <details><summary className="cursor-pointer font-semibold">Sample strong answer</summary><p className="mt-1">{ev.sample_answer}</p></details>
              <button className="btn" onClick={proceed}>{next.current ? "Next question" : "See summary"}</button>
            </div>
          )}
        </div>
      )}

      {phase === "done" && summary && (
        <div className="card space-y-2 text-sm">
          <p className="text-lg font-semibold">Overall {summary.overall_score}/10</p>
          <p>{summary.verdict}</p>
          <p className="font-semibold" style={{ color: "var(--good)" }}>Strengths</p>
          <ul className="list-disc pl-5">{summary.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="font-semibold" style={{ color: "var(--warn)" }}>Work on</p>
          <ul className="list-disc pl-5">{summary.weaknesses.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="font-semibold">Next steps</p>
          <ul className="list-disc pl-5">{summary.next_steps.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <Link href="/interview" className="btn mt-2 inline-block">Back to rounds</Link>
        </div>
      )}
    </div>
  );
}
