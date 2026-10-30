import { NextResponse } from "next/server";
import { askJson, buildContext, type Input } from "@/lib/ai";
import { db, latestResume } from "@/lib/db";

export const maxDuration = 120;

const SYSTEM = `You are an interview coach and recruiter for Dassault Systèmes. You are given the company context, the job description, and the candidate's resume.
Transcribe the resume faithfully and then analyse how the candidate fits THIS role. Be honest: do not invent experience the resume does not show.
Return JSON:
{
 "resume_text": "faithful plain-text transcription, max ~1800 words",
 "profile": {
  "name": string, "headline": string, "total_years": number|null, "current_role": string,
  "skills": string[], "tools": string[],
  "peoplesoft": { "has_hands_on": boolean, "modules": string[], "evidence": string },
  "finance_domains": string[],
  "projects": [{ "name": string, "what": string, "impact": string }],
  "education": string,
  "strengths_for_role": string[],
  "gaps_vs_jd": string[],
  "story_hooks": string[]   // specific resume items an interviewer will probe
 }
}`;

export async function GET() {
  const r = await latestResume();
  return NextResponse.json({ resume: r });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const pasted = (form.get("text") as string | null)?.trim();

    let content: Input;
    const instruction = `${buildContext(null)}\n\nAnalyse the resume below.`;
    if (file && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File over 8 MB" }, { status: 400 });
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (isPdf) {
        const data = Buffer.from(await file.arrayBuffer()).toString("base64");
        content = { text: instruction, pdf: { base64: data, filename: file.name || "resume.pdf" } };
      } else {
        content = `${instruction}\n\nRESUME:\n${await file.text()}`;
      }
    } else if (pasted) {
      content = `${instruction}\n\nRESUME:\n${pasted}`;
    } else {
      return NextResponse.json({ error: "Upload a PDF/text file or paste your resume" }, { status: 400 });
    }

    const out = await askJson<{ resume_text: string; profile: unknown }>(SYSTEM, content, 6000);
    const { error } = await db().from("resumes").insert({ resume_text: out.resume_text, profile: out.profile });
    if (error) throw error;
    return NextResponse.json({ ok: true, profile: out.profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}
