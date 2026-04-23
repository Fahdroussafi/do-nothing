import { createClient } from "@supabase/supabase-js";

// Frontend-only Supabase client (uses the public anon key)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
