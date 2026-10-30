import { DASSAULT, JD } from "./content";

// OpenRouter (OpenAI-compatible). OPENROUTER_MODELS is a comma-separated fallback list, tried in order.
// Free models are often rate-limited, and most free models that respond are "reasoning" models that
// think for 15-40s first. Fast non-reasoning models (Gemma) go first: a rate-limit rejection costs <1s.
const DEFAULT_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "recursive/flint-v1.0:free",
  "openrouter/free",
];

// Vercel stops a function at maxDuration (120s on our routes), so one request gets a total time budget.
const BUDGET_MS = 100_000;

function models() {
  const m = (process.env.OPENROUTER_MODELS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return m.length ? m : DEFAULT_MODELS;
}

export async function askText(
  system: string,
  input: string,
  maxTokens = 2000,
  timeoutMs = 55_000,
  deadline = Date.now() + BUDGET_MS,
) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const errors: string[] = [];
  for (const model of models()) {
    // Free models sometimes return an empty reply; retry the same model once before moving on.
    for (let attempt = 0; attempt < 2; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 8_000) {
        errors.push("time budget used up");
        throw new Error(`All models failed or were too slow. ${errors.join(" | ")}`);
      }
      const started = Date.now();
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
              { role: "user", content: input },
            ],
          }),
          signal: AbortSignal.timeout(Math.min(timeoutMs, remaining - 1_000)),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
        const out = body?.choices?.[0]?.message?.content;
        if (!out || typeof out !== "string") {
          const finish = body?.choices?.[0]?.finish_reason ?? "?";
          throw new Error(`empty response (finish: ${finish})`);
        }
        console.log(`[ai] ${model} ok ${Date.now() - started}ms`);
        return out;
      } catch (e: any) {
        console.log(`[ai] ${model} failed ${Date.now() - started}ms: ${e.message}`);
        errors.push(`${model}: ${e.message}`);
        // Retry only transient empties. "finish: length" means the model ran out of tokens thinking: same result again.
        if (!/empty response/.test(e.message) || /finish: length/.test(e.message)) break;
      }
    }
  }
  throw new Error(`All models failed. ${errors.join(" | ")}`);
}

export async function askJson<T>(system: string, input: string, maxTokens = 2000, timeoutMs = 55_000): Promise<T> {
  const sys = `${system}\n\nRespond with ONE valid JSON object only. No markdown fences, no commentary before or after.`;
  const deadline = Date.now() + BUDGET_MS;
  let last = "";
  for (let attempt = 0; attempt < 3 && deadline - Date.now() > 8_000; attempt++) {
    const text = await askText(sys, input, maxTokens, timeoutMs, deadline);
    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    if (a >= 0 && b > a) {
      const body = text.slice(a, b + 1);
      try {
        return JSON.parse(body) as T;
      } catch {
        // Free models often put raw line breaks/tabs inside strings, which is invalid JSON.
        try {
          return JSON.parse(body.replace(/[\u0000-\u001F]+/g, " ")) as T;
        } catch {}
      }
    }
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

// Shorter context for resume analysis: fit scoring needs the JD, not the company background.
// A smaller prompt means less thinking time on reasoning models.
export function buildJdContext() {
  return `=== JOB DESCRIPTION ===\n${JD}`;
}
