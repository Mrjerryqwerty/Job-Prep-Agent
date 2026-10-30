// Rubric scoring with no AI. Each question lists the key points a strong answer covers; an answer
// is scored on how many of them it hits, plus a concrete example and enough detail.
// This is a checklist, not a judge of quality: it rewards covering the right ground, so always read the model answer too.

export type KP = { label: string; any: string[] }; // a key point is "covered" if ANY keyword appears

export type Evaluation = {
  score: number; // 1-10 (0 if skipped)
  covered: string[];
  missed: string[];
  words: number;
  hasExample: boolean;
  feedback: string; // short, written to be read aloud
  strengths: string[];
  improvements: string[];
};

// Speech-to-text often splits technical terms, so fold the common ones back together.
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/people\s+soft/g, "peoplesoft")
    .replace(/\bp\.?\s?s\.?\s+query\b/g, "ps query")
    .replace(/\bb\.?\s?i\.?\s+publisher\b/g, "bi publisher")
    .replace(/\bs\.?\s?q\.?\s?l\b/g, "sql")
    .replace(/\bapp\s+engine\b/g, "application engine")
    .replace(/\bp\s?l\s?sql\b/g, "plsql")
    .replace(/[-_/]/g, " ")
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(text: string, raw: string) {
  const kw = normalize(raw);
  if (!kw) return false;
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pre = /^\w/.test(kw) ? "\\b" : "";
  // short keywords (ar, gl, po) must match whole words; longer ones also match plurals and endings
  const post = kw.length <= 3 && /\w$/.test(kw) ? "\\b" : "";
  return new RegExp(pre + esc + post).test(text);
}

const speakable = (label: string) => label.replace(/\s*\(.*?\)/g, "");

export function evaluate(answer: string, points: KP[], minWords = 45): Evaluation {
  const text = normalize(answer || "");
  const words = text ? text.split(" ").length : 0;

  if (words === 0) {
    return {
      score: 0, covered: [], missed: points.map((p) => p.label), words: 0, hasExample: false,
      feedback: "You skipped this one. Read the model answer and try it again aloud.",
      strengths: [],
      improvements: points.map((p) => `Cover ${p.label}`),
    };
  }

  const covered = points.filter((p) => p.any.some((k) => hasKeyword(text, k))).map((p) => p.label);
  const missed = points.filter((p) => !covered.includes(p.label)).map((p) => p.label);
  const coverage = points.length ? covered.length / points.length : 0;

  const hasExample =
    /\d/.test(text) ||
    /\b(for example|for instance|in my project|i built|i led|i developed|i designed|i implemented|i created|i wrote|at accenture|my client)\b/.test(text);

  let score = 1 + 7 * coverage; // 1..8 from coverage
  if (hasExample) score += 1;
  if (words >= minWords) score += 1;
  if (words < minWords / 2) score = Math.min(score, 4); // too thin to be a real answer
  score = Math.max(1, Math.min(10, Math.round(score)));

  const improvements = missed.map((m) => `Cover ${m}`);
  if (!hasExample) improvements.push("Back it with a concrete example or a number from your own work");
  if (words < minWords) improvements.push(`Give more detail: aim for around ${minWords} words or more`);

  const band = coverage >= 0.75 ? "strong" : coverage >= 0.5 ? "decent" : "thin";
  let feedback = `You covered ${covered.length} of ${points.length} key points. `;
  if (band === "strong") feedback += "That is a strong answer. ";
  else if (band === "decent") feedback += "A decent answer, with gaps. ";
  else feedback += "This needs more substance. ";
  if (missed.length) feedback += `You did not mention ${missed.slice(0, 2).map(speakable).join(", or ")}. `;
  if (!hasExample) feedback += "Add a real example or number.";

  return { score, covered, missed, words, hasExample, feedback: feedback.trim(), strengths: covered.map((c) => `Covered ${c}`), improvements };
}

export const bandVerdict = (avg10: number) =>
  avg10 >= 8 ? "Strong performance: you covered most of what a panel expects."
  : avg10 >= 6 ? "Solid, with clear gaps to close before the real interview."
  : avg10 >= 4 ? "Partly there: several expected points were missing."
  : "Needs significant preparation: revisit the study notes and model answers.";
