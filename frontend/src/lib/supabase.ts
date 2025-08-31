import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail loudly during development; in production this will just disable auth gating
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars not set: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey)
  : null;

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

