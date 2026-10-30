import { NextResponse } from "next/server";
import { askJson, buildContext, type Input } from "@/lib/ai";
import { db, latestResume } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

export const maxDuration = 120;

const SYSTEM = `You are an interview coach and recruiter for Dassault Systèmes. You are given the company context, the job description, and the candidate's resume.
Transcribe the resume faithfully and then analyse how the candidate fits THIS role. Be honest: do not invent experience the resume does not show.
Return JSON:
{
 "resume_text": "faithful plain-text transcription, max ~1800 words",
 "profile": {
  "name": string, "headline": string, "total_years": number|null, "current_role": string,
  "fit_score": integer 0-100 (how well the resume matches the JD requirements; be strict, 50 = partial match),
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
  try {
    const r = await latestResume(await candidateId());
    return NextResponse.json({ resume: r });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const pasted = (form.get("text") as string | null)?.trim();

    let content: Input;
    let upload: { buf: Buffer; name: string; type: string } | null = null;
    const instruction = `${buildContext(null)}\n\nAnalyse the resume below.`;
    if (file && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File over 8 MB" }, { status: 400 });
      const buf = Buffer.from(await file.arrayBuffer());
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      upload = { buf, name: file.name || "resume", type: file.type || (isPdf ? "application/pdf" : "text/plain") };
      if (isPdf) {
        content = { text: instruction, pdf: { base64: buf.toString("base64"), filename: file.name || "resume.pdf" } };
      } else {
        content = `${instruction}\n\nRESUME:\n${buf.toString("utf8")}`;
      }
    } else if (pasted) {
      content = `${instruction}\n\nRESUME:\n${pasted}`;
    } else {
      return NextResponse.json({ error: "Upload a PDF/text file or paste your resume" }, { status: 400 });
    }

    const out = await askJson<{ resume_text: string; profile: any }>(SYSTEM, content, 6000);

    const sb = db();
    let file_path: string | null = null;
    let file_name: string | null = null;
    if (upload) {
      const safe = upload.name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
      const path = `${cid}/${Date.now()}-${safe}`;
      const { error: ue } = await sb.storage.from("resumes").upload(path, upload.buf, { contentType: upload.type });
      if (!ue) { file_path = path; file_name = upload.name; } // storing the original is best-effort
    }
    const { error } = await sb
      .from("resumes")
      .insert({ candidate_id: cid, resume_text: out.resume_text, profile: out.profile, file_path, file_name });
    if (error) throw error;
    return NextResponse.json({ ok: true, profile: out.profile });
  } catch (e) {
    return fail(e);
  }
}
