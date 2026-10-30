// Interview-readiness estimate from a candidate's real practice results.
// This is NOT a hiring probability: it cannot know the other applicants or what the panel decides.

export const TOTAL_ASSIGNMENTS = 14; // 7 days x 2
export const TOTAL_ROUNDS = 3;

export type Outlook = "High" | "Moderate" | "Low" | "Not enough data";

export type Readiness = {
  score: number; // 0-100
  outlook: Outlook;
  fit: number | null; // resume vs JD, 0-100
  assignmentAvg: number | null; // 0-100
  interviewAvg: number | null; // 0-100
  assignmentsDone: number;
  roundsDone: number;
  completion: number; // 0-100
};

export function computeReadiness(i: {
  fit: number | null;
  assignmentScores: number[]; // latest score per assignment, 1-10
  roundScores: number[]; // latest finished interview per round, 1-10
}): Readiness {
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  const assignmentAvg = i.assignmentScores.length ? avg(i.assignmentScores) * 10 : null;
  const interviewAvg = i.roundScores.length ? avg(i.roundScores) * 10 : null;

  const parts = [
    { w: 25, v: i.fit },
    { w: 40, v: interviewAvg },
    { w: 25, v: assignmentAvg },
  ].filter((p): p is { w: number; v: number } => p.v != null);

  const completion =
    ((i.assignmentScores.length / TOTAL_ASSIGNMENTS + i.roundScores.length / TOTAL_ROUNDS) / 2) * 100;

  const base = parts.length ? parts.reduce((s, p) => s + p.w * p.v, 0) / parts.reduce((s, p) => s + p.w, 0) : 0;
  const score = Math.round(0.9 * base + 0.1 * completion);

  // Without at least one finished interview the number is provisional, so don't call an outlook.
  const outlook: Outlook = !i.roundScores.length
    ? "Not enough data"
    : score >= 75
      ? "High"
      : score >= 55
        ? "Moderate"
        : "Low";

  return {
    score,
    outlook,
    fit: i.fit,
    assignmentAvg: assignmentAvg == null ? null : Math.round(assignmentAvg),
    interviewAvg: interviewAvg == null ? null : Math.round(interviewAvg),
    assignmentsDone: i.assignmentScores.length,
    roundsDone: i.roundScores.length,
    completion: Math.round(completion),
  };
}

export const OUTLOOK_COLOR: Record<Outlook, string> = {
  High: "var(--good)",
  Moderate: "var(--warn)",
  Low: "#dc2626",
  "Not enough data": "var(--muted)",
};
