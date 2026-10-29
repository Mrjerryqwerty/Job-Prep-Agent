"use client";
import { useState } from "react";

export default function Login() {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode: pass }),
    });
    if (r.ok) window.location.href = "/";
    else setErr("Wrong passcode");
  }
  return (
    <form onSubmit={go} className="card mx-auto mt-16 max-w-sm space-y-3">
      <h1 className="text-lg font-bold">Enter passcode</h1>
      <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
      {err && <p style={{ color: "var(--warn)" }}>{err}</p>}
      <button className="btn w-full">Enter</button>
    </form>
  );
}
