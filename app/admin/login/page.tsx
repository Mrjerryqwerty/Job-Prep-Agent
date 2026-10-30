"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode: pass }),
    });
    if (r.ok) window.location.href = "/admin";
    else setErr(r.status === 404 ? "Admin is not enabled on this deployment" : "Wrong admin passcode");
  }
  return (
    <form onSubmit={go} className="card mx-auto mt-16 max-w-sm space-y-3">
      <h1 className="text-lg font-bold">Admin sign in</h1>
      <input type="password" placeholder="Admin passcode" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
      {err && <p style={{ color: "var(--warn)" }} className="text-sm">{err}</p>}
      <button className="btn w-full">Enter</button>
    </form>
  );
}
