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

export async function latestResume(candidate: string) {
  const { data, error } = await db()
    .from("resumes")
    .select("*")
    .eq("candidate_id", candidate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as ResumeRow | null;
}
