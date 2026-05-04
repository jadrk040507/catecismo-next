import { getSupabase } from "@/lib/supabase";

function supabase() {
  return getSupabase();
}


// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  parent_id: string;
  full_name: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  sacramental_status: {
    baptized?: boolean;
    baptism_date?: string;
    baptism_church?: string;
    first_communion?: boolean;
    first_communion_date?: string;
    confirmed?: boolean;
    confirmation_date?: string;
    [key: string]: unknown;
  };
  created_at: string;
  // Joined
  classes_count?: number;
}

export interface ParentChildLink {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: "father" | "mother" | "guardian" | "godparent";
  is_primary: boolean;
  created_at: string;
}

export interface ChildDocument {
  id: string;
  child_id: string;
  type: string;
  title: string;
  file_url: string | null;
  signed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ChildProgress {
  lessons_completed: number;
  xp: number;
  streak_days: number;
  quizzes_taken: number;
  avg_quiz_score: number;
  total_time_minutes: number;
}

// ─── Child Profiles ─────────────────────────────────────────────────────────

export async function getChildProfiles(
  parentId: string
): Promise<ChildProfile[]> {
  
  const { data, error } = await supabase()
    .from("child_profiles")
    .select("*")
    .eq("parent_id", parentId)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  const children = (data || []) as ChildProfile[];

  // Enrich with class count
  for (const child of children) {
    const { count } = await supabase()
      .from("class_students")
      .select("*", { count: "exact", head: true })
      .eq("child_profile_id", child.id);
    child.classes_count = count || 0;
  }

  return children;
}

export async function addChildProfile(
  parentId: string,
  input: {
    full_name: string;
    date_of_birth?: string;
    sacramental_status?: Record<string, unknown>;
  }
): Promise<ChildProfile> {
  
  const { data, error } = await (supabase().from("child_profiles") as any)
    .insert({
      parent_id: parentId,
      full_name: input.full_name.trim(),
      date_of_birth: input.date_of_birth || null,
      sacramental_status: input.sacramental_status || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChildProfile;
}

export async function updateChildProfile(
  childId: string,
  input: Partial<ChildProfile>
): Promise<ChildProfile> {
  
  const { data, error } = await (supabase().from("child_profiles") as any)
    .update(input)
    .eq("id", childId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChildProfile;
}

export async function deleteChildProfile(childId: string): Promise<void> {
  
  const { error } = await supabase()
    .from("child_profiles")
    .delete()
    .eq("id", childId);

  if (error) throw new Error(error.message);
}

export async function getChildProgress(
  childId: string
): Promise<ChildProgress> {
  
  // Get progress entries for this child via class_students
  const { data: enrollments } = await supabase()
    .from("class_students")
    .select("student_id")
    .eq("child_profile_id", childId);

  // Default empty progress for child profiles
  // (child_profile_id enrollment means they don't have their own auth user yet)
  return {
    lessons_completed: 0,
    xp: 0,
    streak_days: 0,
    quizzes_taken: 0,
    avg_quiz_score: 0,
    total_time_minutes: 0,
  };
}

// ─── Documents ──────────────────────────────────────────────────────────────

export async function getDocuments(childId: string): Promise<ChildDocument[]> {
  
  const { data, error } = await supabase()
    .from("documents")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as ChildDocument[];
}

export async function addDocument(input: {
  child_id: string;
  type: string;
  title: string;
  file_url?: string;
  signed_at?: string;
  expires_at?: string;
}): Promise<ChildDocument> {
  
  const { data, error } = await (supabase().from("documents") as any)
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChildDocument;
}

// ─── Link child to class ─────────────────────────────────────────────────────

export async function linkChildToClass(
  childId: string,
  classId: number
): Promise<void> {
  
  // For now, linking a child profile to a class requires that the parent be
  // a student in that class. We insert with child_profile_id set.
  // In the future, we can support children attending independently.
  const { error } = await (supabase().from("class_students") as any).insert({
    class_id: classId,
    child_profile_id: childId,
    joined_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("This child is already in this class");
    }
    throw new Error(error.message);
  }
}
