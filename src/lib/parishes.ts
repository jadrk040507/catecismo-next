import { getSupabase } from "@/lib/supabase";

function supabase() {
  return getSupabase();
}


// ─── Types ──────────────────────────────────────────────────────────────────

export interface Parish {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  pastor_name: string | null;
  dre_name: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface ParishUser {
  id: string;
  parish_id: string;
  user_id: string;
  role: "parish_admin" | "dre" | "catechist" | "volunteer";
  created_at: string;
  // Joined
  full_name?: string;
  email?: string;
}

export interface ParishProgram {
  id: string;
  parish_id: string;
  name: string;
  description: string | null;
  year: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  // Joined
  classes_count?: number;
}

// ─── Parishes ──────────────────────────────────────────────────────────────

export async function getParishes(): Promise<Parish[]> {
  
  const { data, error } = await supabase()
    .from("parishes")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Parish[];
}

export async function getParish(parishId: string): Promise<Parish | null> {
  
  const { data, error } = await supabase()
    .from("parishes")
    .select("*")
    .eq("id", parishId)
    .single();

  if (error) throw new Error(error.message);
  return data as Parish | null;
}

export async function createParish(input: {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  pastor_name?: string;
  dre_name?: string;
}): Promise<Parish> {
  
  const { data, error } = await (supabase().from("parishes") as any)
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Parish;
}

export async function updateParish(
  parishId: string,
  input: Partial<Parish>
): Promise<Parish> {
  
  const { data, error } = await (supabase().from("parishes") as any)
    .update(input)
    .eq("id", parishId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Parish;
}

// ─── My Parishes (for current user) ─────────────────────────────────────────

export async function getMyParishes(): Promise<
  (Parish & { role: string })[]
> {
  
  const {
    data: { user },
  } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get parish_users for this user
  const { data: memberships, error: memError } = await (supabase()
    .from("parish_users") as any)
    .select("parish_id, role")
    .eq("user_id", user.id);

  if (memError) throw new Error(memError.message);

  const parishIds = (memberships || []).map((m: any) => m.parish_id);
  if (parishIds.length === 0) return [];

  // Get parish details
  const { data: parishes, error: pError } = await supabase()
    .from("parishes")
    .select("*")
    .in("id", parishIds);

  if (pError) throw new Error(pError.message);

  // Merge role info
  const roleMap = new Map<string, string>();
  for (const m of memberships || []) {
    roleMap.set(m.parish_id, m.role);
  }

  return (parishes || []).map((p: any) => ({
    ...p,
    role: roleMap.get(p.id) || "volunteer",
  }));
}

// ─── Parish Programs ────────────────────────────────────────────────────────

export async function getParishPrograms(
  parishId: string
): Promise<ParishProgram[]> {
  
  const { data, error } = await supabase()
    .from("parish_programs")
    .select("*")
    .eq("parish_id", parishId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as ParishProgram[];
}

export async function createProgram(
  parishId: string,
  input: {
    name: string;
    description?: string;
    year?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<ParishProgram> {
  
  const { data, error } = await (supabase()
    .from("parish_programs") as any)
    .insert({
      parish_id: parishId,
      ...input,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ParishProgram;
}
