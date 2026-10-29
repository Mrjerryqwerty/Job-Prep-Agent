import { createClient } from "@supabase/supabase-js";

// Server-only. Uses the service role key; tables have RLS on with no public policies.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function latestResume() {
  const { data, error } = await db()
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; resume_text: string; profile: any; created_at: string } | null;
}
