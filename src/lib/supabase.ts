import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Admin-only: create a user via GoTrue Admin API.
 * Uses service_role key to bypass RLS and avoid signing out the current admin.
 * Only callable from the browser (exposed in NEXT_PUBLIC_ env).
 */
export async function adminCreateUser(opts: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}): Promise<{ id: string; email: string }> {
  if (!supabaseUrl) throw new Error("No supabase URL configured");
  if (!supabaseServiceKey) throw new Error("No service key configured");

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apiKey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      password: opts.password,
      email_confirm: true,
      user_metadata: {
        full_name: opts.full_name,
        role: opts.role,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ msg: "Unknown error" }));
    throw new Error(err.msg || err.message || `Error ${response.status}`);
  }

  const data = await response.json();
  return { id: data.id, email: data.email };
}

/**
 * Admin-only: delete a user via GoTrue Admin API.
 */
export async function adminDeleteUser(userId: string): Promise<void> {
  if (!supabaseUrl) throw new Error("No supabase URL configured");
  if (!supabaseServiceKey) throw new Error("No service key configured");

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apiKey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const err = await response.json().catch(() => ({ msg: "Unknown error" }));
    throw new Error(err.msg || err.message || `Error ${response.status}`);
  }
}