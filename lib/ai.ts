import { DASSAULT, JD } from "./content";

// OpenRouter (OpenAI-compatible). OPENROUTER_MODELS is a comma-separated fallback list,
// tried in order, because free models are often rate-limited or temporarily offline.
const DEFAULT_MODELS = [
  "recursive/flint-v1.0:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "openrouter/free",
];

export type Input = string | { text: string; pdf?: { base64: string; filename: string } };

function models() {
  const m = (process.env.OPENROUTER_MODELS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return m.length ? m : DEFAULT_MODELS;
}

export async function askText(system: string, input: Input, maxTokens = 2000) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const text = typeof input === "string" ? input : input.text;
  const pdf = typeof input === "string" ? undefined : input.pdf;
  const userContent = pdf
    ? [
        { type: "text", text },
        { type: "file", file: { filename: pdf.filename, file_data: `data:application/pdf;base64,${pdf.base64}` } },
      ]
    : text;

  const errors: string[] = [];
  for (const model of models()) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Title": "Dassault Interview Prep",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent },
          ],
          // free text-extraction engine for PDFs, works with any model
          ...(pdf ? { plugins: [{ id: "file-parser", pdf: { engine: "pdf-text" } }] } : {}),
        }),
        signal: AbortSignal.timeout(55_000),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      const out = body?.choices?.[0]?.message?.content;
      if (!out || typeof out !== "string") throw new Error("empty response");
      return out;
    } catch (e: any) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error(`All models failed. ${errors.join(" | ")}`);
}

export async function askJson<T>(system: string, input: Input, maxTokens = 2000): Promise<T> {
  const sys = `${system}\n\nRespond with ONE valid JSON object only. No markdown fences, no commentary before or after.`;
  let last = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await askText(sys, input, maxTokens);
    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    try {
      if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1)) as T;
    } catch {}
    last = text.slice(0, 120);
  }
  throw new Error(`Model did not return valid JSON (${last})`);
}

// The merge the app is built around: Dassault + JD + resume profile in one context block.
export function buildContext(profile: unknown | null) {
  return `=== DASSAULT SYSTEMES ===\n${DASSAULT}\n\n=== JOB DESCRIPTION ===\n${JD}\n\n=== CANDIDATE (parsed from resume) ===\n${
    profile ? JSON.stringify(profile, null, 1) : "No resume uploaded yet."
  }`;
}
