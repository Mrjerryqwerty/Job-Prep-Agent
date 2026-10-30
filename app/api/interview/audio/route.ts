import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidateId, fail } from "@/lib/session";

const MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit

// Stores the recording of one spoken answer against its interview turn.
export async function POST(req: Request) {
  try {
    const cid = await candidateId();
    const form = await req.formData();
    const interviewId = String(form.get("interviewId") ?? "");
    const idx = Number(form.get("idx"));
    const audio = form.get("audio") as File | null;
    if (!interviewId || !idx || !audio || audio.size === 0) {
      return NextResponse.json({ error: "Missing audio" }, { status: 400 });
    }
    if (audio.size > MAX_BYTES) return NextResponse.json({ error: "Recording too large" }, { status: 413 });

    const sb = db();
    const { data: iv } = await sb.from("interviews").select("id").eq("id", interviewId).eq("candidate_id", cid).maybeSingle();
    if (!iv) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    const ext = audio.type.includes("mp4") ? "m4a" : audio.type.includes("ogg") ? "ogg" : "webm";
    const path = `${cid}/${interviewId}/${idx}.${ext}`;
    const { error: ue } = await sb.storage
      .from("answers")
      .upload(path, Buffer.from(await audio.arrayBuffer()), { contentType: audio.type || "audio/webm", upsert: true });
    if (ue) throw ue;
    await sb
      .from("interview_turns")
      .update({ audio_path: path, audio_bytes: audio.size })
      .eq("interview_id", interviewId)
      .eq("idx", idx);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
