import Anthropic from "@anthropic-ai/sdk";
import { DASSAULT, JD } from "./content";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

function client() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function askText(
  system: string,
  content: string | Anthropic.ContentBlockParam[],
  maxTokens = 2000,
) {
  const r = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
  });
  return r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

export async function askJson<T>(
  system: string,
  content: string | Anthropic.ContentBlockParam[],
  maxTokens = 2000,
): Promise<T> {
  const text = await askText(
    `${system}\n\nRespond with ONE valid JSON object only. No markdown fences, no commentary.`,
    content,
    maxTokens,
  );
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b < 0) throw new Error("Model did not return JSON");
  return JSON.parse(text.slice(a, b + 1)) as T;
}

// The merge the app is built around: Dassault + JD + resume profile in one context block.
export function buildContext(profile: unknown | null) {
  return `=== DASSAULT SYSTEMES ===\n${DASSAULT}\n\n=== JOB DESCRIPTION ===\n${JD}\n\n=== CANDIDATE (parsed from resume) ===\n${
    profile ? JSON.stringify(profile, null, 1) : "No resume uploaded yet."
  }`;
}
