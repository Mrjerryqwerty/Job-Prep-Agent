import { createClient } from "@supabase/supabase-js";

// Server-only. Uses the service role key; tables have RLS on with no public policies.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

export type ResumeRow = {
  id: string;
  candidate_id: string;
  resume_text: string;
  profile: any;
  file_path: string | null;
  file_name: string | null;
  created_at: string;
};

// The one fixed resume (candidate_id is null) that every question and assignment is built from.
// It is seeded into Supabase by hand and never uploaded through the app.
export async function referenceResume() {
  const { data, error } = await db()
    .from("resumes")
    .select("*")
    .is("candidate_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as ResumeRow | null;
}
