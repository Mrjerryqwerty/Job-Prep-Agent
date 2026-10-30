import { NextResponse } from "next/server";
import { askJson, buildJdContext } from "@/lib/ai";
import { db, latestResume } from "@/lib/db";
import { pdfToText } from "@/lib/pdf";
import { candidateId, fail } from "@/lib/session";

export const maxDuration = 120;

// The model only produces the short profile. The resume text is read locally,
// because making a free model retype a whole resume was the slow part.
const SYSTEM = `You are an interview coach and recruiter for Dassault Systèmes. You are given the company context, the job description, and the candidate's resume text.
Analyse how the candidate fits THIS role. Be honest: do not invent experience the resume does not show. Be concise: short phrases, at most 4 items per list, at most 3 projects. Do not over-think this: extract and judge quickly.
Return JSON:
{
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
}`;

const MAX_RESUME_CHARS = 12000;

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

    let text = "";
    let upload: { buf: Buffer; name: string; type: string } | null = null;
    if (file && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File over 8 MB" }, { status: 400 });
      const lower = file.name.toLowerCase();
      if (/\.(docx?|rtf|odt)$/.test(lower)) {
        return NextResponse.json({ error: "Word files are not supported. Save as PDF, or paste the text." }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
      upload = { buf, name: file.name || "resume", type: file.type || (isPdf ? "application/pdf" : "text/plain") };
      if (isPdf) {
        try {
          text = await pdfToText(buf);
        } catch {
          return NextResponse.json({ error: "Could not read this PDF. Paste the text instead." }, { status: 400 });
        }
        if (text.length < 150) {
          return NextResponse.json(
            { error: "This PDF has no readable text (it may be a scan). Paste the text instead." },
            { status: 400 },
          );
        }
      } else {
        text = buf.toString("utf8").trim();
      }
    } else if (pasted) {
      text = pasted;
    } else {
      return NextResponse.json({ error: "Upload a PDF/text file or paste your resume" }, { status: 400 });
    }
    text = text.slice(0, MAX_RESUME_CHARS);

    // 40s per model attempt (the default is 55s) so a stuck free model fails over sooner.
    const profile = await askJson<any>(
      SYSTEM,
      `${buildJdContext()}\n\nRESUME:\n${text}`,
      3500, // reasoning models spend part of this on thinking before the JSON
      40_000,
    );

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
      .insert({ candidate_id: cid, resume_text: text, profile, file_path, file_name });
    if (error) throw error;
    return NextResponse.json({ ok: true, profile });
  } catch (e) {
    return fail(e);
  }
}
