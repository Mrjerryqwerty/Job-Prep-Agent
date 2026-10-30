"use client";
import { useState } from "react";

export default function Login() {
  const [f, setF] = useState({ name: "", email: "", passcode: "" });
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, consent }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) window.location.href = "/";
    else setErr(d.error ?? "Could not sign in");
  }

  return (
    <form onSubmit={go} className="card mx-auto mt-10 max-w-sm space-y-3">
      <h1 className="text-lg font-bold">Sign in</h1>
      <input type="text" placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus />
      <input type="text" placeholder="Email (identifies you across visits)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Access passcode" value={f.passcode} onChange={(e) => setF({ ...f, passcode: e.target.value })} />
      <label className="flex items-start gap-2 text-xs muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>I understand my resume, written answers, interview transcripts, scores and audio recordings of my spoken answers are saved and can be viewed by the app admin.</span>
      </label>
      {err && <p style={{ color: "var(--warn)" }} className="text-sm">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Signing in…" : "Enter"}</button>
    </form>
  );
}
