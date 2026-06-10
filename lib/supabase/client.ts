import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * Browser Supabase client. Only call when `isSupabaseConfigured()` is true —
 * callers (AuthButton/PublishButton) guard on that.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
