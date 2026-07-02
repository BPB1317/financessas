import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client Supabase avec la clé service_role : bypass RLS, ne doit jamais être
// importé depuis un composant client. Le paquet "server-only" fait planter le
// build si ce fichier finit par être inclus dans un bundle client par erreur.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis (voir .env.example)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
