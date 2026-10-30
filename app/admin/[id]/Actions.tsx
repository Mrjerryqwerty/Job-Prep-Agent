"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Actions({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function generate() {
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ candidateId }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Failed");
    router.refresh();
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button className="btn" onClick={generate} disabled={busy}>{busy ? "Building…" : "Generate assessment"}</button>
      <button className="btn-ghost" onClick={() => window.print()}>Print / save as PDF</button>
      {err && <span className="text-sm" style={{ color: "var(--warn)" }}>{err}</span>}
    </div>
  );
}
