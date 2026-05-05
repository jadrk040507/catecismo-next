import { getSupabase } from "@/lib/supabase";

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error("No supabase configured");
  return client;
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
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("parishes")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Parish[];
}

export async function getParish(parishId: string): Promise<Parish | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
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
  const sb = requireSupabase();
  const { data, error } = await (sb.from("parishes") as any)
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
  const sb = requireSupabase();
  const { data, error } = await (sb.from("parishes") as any)
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
  const sb = requireSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get parish_users for this user
  const { data: memberships, error: memError } = await (sb
    .from("parish_users") as any)
    .select("parish_id, role")
    .eq("user_id", user.id);

  if (memError) throw new Error(memError.message);

  const parishIds = (memberships || []).map((m: any) => m.parish_id);
  if (parishIds.length === 0) return [];

  // Get parish details
  const { data: parishes, error: pError } = await sb
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
  const sb = requireSupabase();
  const { data, error } = await sb
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
  const sb = requireSupabase();
  const { data, error } = await (sb
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

// ─── Parish Users (Catechists & Staff) ───────────────────────────────────────

export async function getParishUsers(parishId: string): Promise<ParishUser[]> {
  const sb = requireSupabase();
  const { data, error } = await (sb
    .from("parish_users") as any)
    .select("id, parish_id, user_id, role, created_at, profiles(full_name, email)")
    .eq("parish_id", parishId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    parish_id: row.parish_id,
    user_id: row.user_id,
    role: row.role,
    created_at: row.created_at,
    full_name: row.profiles?.full_name || "",
    email: row.profiles?.email || "",
  }));
}

export async function addParishUser(
  parishId: string,
  input: { user_id: string; role: ParishUser["role"] }
): Promise<ParishUser> {
  const sb = requireSupabase();
  const { data, error } = await (sb
    .from("parish_users") as any)
    .insert({
      parish_id: parishId,
      user_id: input.user_id,
      role: input.role,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ParishUser;
}

export async function updateParishUserRole(
  parishUserId: string,
  newRole: ParishUser["role"]
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await (sb
    .from("parish_users") as any)
    .update({ role: newRole })
    .eq("id", parishUserId);

  if (error) throw new Error(error.message);
}

export async function removeParishUser(parishUserId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await (sb
    .from("parish_users") as any)
    .delete()
    .eq("id", parishUserId);

  if (error) throw new Error(error.message);
}

export async function inviteParishUser(
  parishId: string,
  email: string,
  role: ParishUser["role"]
): Promise<{ user?: ParishUser; invited?: boolean }> {
  const sb = requireSupabase();
  // Look up the user profile by email
  const { data: profile }: { data: { id: string; full_name: string; email: string } | null } = await sb
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email)
    .single();

  if (!profile) {
    // User doesn't exist yet — store a pending invitation
    const { data, error } = await (sb
      .from("parish_invitations") as any)
      .insert({ parish_id: parishId, email, role, status: "pending" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { invited: true };
  }

  // User exists — add directly to parish_users
  const result = await addParishUser(parishId, {
    user_id: profile.id,
    role,
  });
  return { user: { ...result, full_name: profile.full_name, email: profile.email } };
}

// ─── Parish Stats ────────────────────────────────────────────────────────────

export interface ParishStats {
  totalStudents: number;
  totalClasses: number;
  activePrograms: number;
  totalCatechists: number;
}

export async function getParishStats(parishId: string): Promise<ParishStats> {
  const sb = requireSupabase();
  const [programs, users] = await Promise.all([
    getParishPrograms(parishId),
    getParishUsers(parishId),
  ]);

  // Count catechists
  const catechists = users.filter(
    (u) => u.role === "catechist" || u.role === "dre" || u.role === "parish_admin"
  ).length;

  // Count classes via programs (best effort)
  let totalClasses = 0;
  try {
    const { count } = await sb
      .from("classes")
      .select("*", { count: "exact", head: true });
    totalClasses = count || 0;
  } catch {
    totalClasses = 0;
  }

  // Count students (best effort)
  let totalStudents = 0;
  try {
    const { data: studentRows } = await sb
      .from("class_students")
      .select("student_id");
    const uniqueStudents = new Set((studentRows || []).map((r: any) => r.student_id));
    totalStudents = uniqueStudents.size;
  } catch {
    totalStudents = 0;
  }

  return {
    totalStudents,
    totalClasses,
    activePrograms: programs.length,
    totalCatechists: catechists,
  };
}