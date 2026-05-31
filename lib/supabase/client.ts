"use client";

import { createBrowserClient } from "@supabase/ssr";

// Types générés par `supabase gen types typescript` quand le projet est connecté.
// En attendant, le client est non-typé — les types seront ajoutés après setup Supabase.
export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
