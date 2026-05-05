import { getSupabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Clase {
  id: number;
  name: string;
  description: string | null;
  catechist_id: string;
  course_id: number | null;
  invite_code: string;
  status: "active" | "archived" | "deleted";
  created_at: string;
}

export interface ClassStudent {
  id: number;
  class_id: number;
  student_id: string;
  child_profile_id: number | null;
  joined_at: string;
  // Campos unidos de profiles
  student_name?: string;
  student_email?: string;
  // Progreso
  completed?: number;
  quizAvg?: number;
  time?: string;
  streak?: number;
}

export interface ClassCatechist {
  class_id: number;
  catechist_id: string;
  assigned_by: string | null;
  assigned_at: string;
  // Campos unidos de profiles
  full_name?: string;
  email?: string;
  role?: string;
}

export interface ClassAssignment {
  id: number;
  class_id: number;
  lesson_slug: string;
  lesson_title: string;
  assignment_type: "lesson" | "workbook" | "guide" | "video" | "quiz";
  notes: string | null;
  status: "active" | "archived";
  sort_order: number | null;
  due_date: string | null;
  section_name: string | null;
  created_at: string;
}

export interface LessonManifestEntry {
  slug: string;
  title: string;
  course: string;
  section: string;
  lang: string;
}

export interface CatechistProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  lessons_completed: number;
  streak_days: number;
  last_active: string;
  created_at: string;
}

export interface CreateClassInput {
  name: string;
  description?: string;
  course_id?: number;
}

export interface UpdateClassInput {
  name?: string;
  description?: string;
  course_id?: number;
  status?: "active" | "archived" | "deleted";
}

export interface CreateAssignmentInput {
  class_id: number;
  lesson_slug: string;
  lesson_title: string;
  assignment_type?: "lesson" | "workbook" | "guide" | "video" | "quiz";
  notes?: string;
  sort_order?: number;
  due_date?: string;
  section_name?: string;
}

export interface UpdateAssignmentInput {
  lesson_title?: string;
  assignment_type?: "lesson" | "workbook" | "guide" | "video" | "quiz";
  notes?: string;
  status?: "active" | "archived";
  sort_order?: number;
}

// ─── Singleton helper with null check ────────────────────────────────────────

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error("No supabase configured");
  return client;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Genera un código de invitación alfanumérico de 6 caracteres */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin I,O,0,1 para evitar confusión
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Obtiene el perfil del usuario autenticado actual */
async function getCurrentProfile(): Promise<{
  id: string;
  role: string;
  full_name: string;
  email: string;
} | null> {
  const sb = requireSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .single();

  return data || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las clases según visibilidad del usuario:
 * - super_admin: ve todas
 * - catechist/admin: ve las propias (owner) + las que es co-catechist
 * - estudiante: ve las clases donde está inscrito
 */
export async function getClasses(): Promise<Clase[]> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // super_admin ve todas
  if (profile.role === "super_admin") {
    const { data } = await sb
      .from("classes")
      .select("*")
      .neq("status", "deleted")
      .order("created_at", { ascending: false });
    return (data || []) as Clase[];
  }

  // catechist / admin / co-catechist: ve las propias + donde es co-catechist
  if (["catechist", "admin", "super_admin"].includes(profile.role)) {
    // Query 1: clases donde es owner
    const { data: owned } = await sb
      .from("classes")
      .select("*")
      .eq("catechist_id", profile.id)
      .neq("status", "deleted");

    // Query 2: clases donde es co-catechist (vía class_catechists)
    const { data: coClassRows } = await sb
      .from("class_catechists")
      .select("class_id")
      .eq("catechist_id", profile.id);

    const coClassIds = (coClassRows || []).map((r: any) => r.class_id);

    let coClasses: Clase[] = [];
    if (coClassIds.length > 0) {
      const { data: coData } = await sb
        .from("classes")
        .select("*")
        .in("id", coClassIds)
        .neq("status", "deleted");
      coClasses = (coData || []) as Clase[];
    }

    // Unir ambas listas, eliminando duplicados por id
    const ownedList = (owned || []) as Clase[];
    const merged = new Map<number, Clase>();
    for (const c of ownedList) merged.set(c.id, c);
    for (const c of coClasses) {
      if (!merged.has(c.id)) merged.set(c.id, c);
    }

    return Array.from(merged.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // estudiante: ve las clases donde está inscrito
  const { data: studentRows } = await sb
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile.id);

  const classIds = (studentRows || []).map((r: any) => r.class_id);
  if (classIds.length === 0) return [];

  const { data } = await sb
    .from("classes")
    .select("*")
    .in("id", classIds)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return (data || []) as Clase[];
}

/**
 * Obtiene una clase por ID con todos sus datos:
 * clase, catequista owner, estudiantes, y curso asociado
 */
export async function getClassById(classId: number): Promise<{
  class: Clase | null;
  catechist: CatechistProfile | null;
  students: ClassStudent[];
  course: any;
}> {
  const sb = requireSupabase();
  // Obtener la clase
  const { data: classData } = await sb
    .from("classes")
    .select("*")
    .eq("id", classId)
    .single();

  const clase = (classData || null) as Clase | null;
  if (!clase) {
    return { class: null, catechist: null, students: [], course: null };
  }

  // Obtener catequista owner
  const { data: catechistData } = await sb
    .from("profiles")
    .select("*")
    .eq("id", clase.catechist_id)
    .single();

  // Obtener estudiantes con progreso
  const students = await getClassStudents(classId);

  // Obtener curso si tiene course_id
  let course = null;
  if (clase.course_id) {
    const { data: courseData } = await sb
      .from("courses")
      .select("*")
      .eq("id", clase.course_id)
      .single();
    course = courseData || null;
  }

  return {
    class: clase,
    catechist: (catechistData || null) as CatechistProfile | null,
    students,
    course,
  };
}

/**
 * Crea una nueva clase con verificación de unicidad de nombre,
 * auto-asignación del catechist_id del usuario actual, y
 * generación de código de invitación de 6 caracteres.
 */
export async function createClass(input: CreateClassInput): Promise<Clase> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");
  if (!["catechist", "admin", "super_admin"].includes(profile.role)) {
    throw new Error("No tienes permisos para crear clases");
  }

  // Verificar unicidad de nombre para este catequista
  const { data: existing } = await sb
    .from("classes")
    .select("id")
    .eq("catechist_id", profile.id)
    .eq("name", input.name)
    .neq("status", "deleted");

  if (existing && existing.length > 0) {
    throw new Error(`Ya tienes una clase con el nombre "${input.name}"`);
  }

  // Generar código único de 6 caracteres
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: codeCheck } = await sb
      .from("classes")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
    if (!codeCheck) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const { data, error } = await (sb.from("classes") as any)
    .insert({
      name: input.name,
      description: input.description || null,
      catechist_id: profile.id,
      course_id: input.course_id || null,
      invite_code: inviteCode,
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Clase;
}

/**
 * Actualiza los datos de una clase existente.
 * Solo el owner (catechist_id) o super_admin pueden actualizar.
 */
export async function updateClass(
  classId: number,
  input: UpdateClassInput
): Promise<Clase> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Verificar propiedad
  const { data: clase } = await (sb.from("classes") as any)
    .select("catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");
  if ((clase as any).catechist_id !== profile.id && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para editar esta clase");
  }

  const { data, error } = await (sb.from("classes") as any)
    .update(input)
    .eq("id", classId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Clase;
}

/**
 * Soft-delete: cambia el status a "deleted" en lugar de eliminar el registro.
 */
export async function deleteClass(classId: number): Promise<void> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Verificar propiedad
  const { data: clase } = await (sb.from("classes") as any)
    .select("catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");
  if ((clase as any).catechist_id !== profile.id && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para eliminar esta clase");
  }

  const { error } = await (sb.from("classes") as any)
    .update({ status: "deleted" })
    .eq("id", classId);

  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTUDIANTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene los estudiantes de una clase con estadísticas de progreso:
 * completed (lecciones completadas), quizAvg (promedio quiz), time (tiempo total), streak (racha de días)
 */
export async function getClassStudents(
  classId: number
): Promise<ClassStudent[]> {
  const sb = requireSupabase();
  // Obtener registros de class_students
  const { data: rows } = await sb
    .from("class_students")
    .select("*")
    .eq("class_id", classId);

  const studentRows = (rows || []) as any[];
  if (studentRows.length === 0) return [];

  // Obtener perfiles de los estudiantes
  const studentIds = studentRows.map((r: any) => r.student_id);
  const { data: profiles } = await (sb.from("profiles") as any)
    .select("id, email, full_name, lessons_completed, streak_days")
    .in("id", studentIds);

  const profileMap = new Map<string, any>();
  for (const p of (profiles || [])) {
    profileMap.set(p.id, p);
  }

  // Obtener progreso (quiz scores) de la tabla lesson_progress
  const { data: progress } = await (sb.from("lesson_progress") as any)
    .select("user_id, quiz_score")
    .in("user_id", studentIds);

  // Calcular promedios de quiz por estudiante
  const quizScores = new Map<string, number[]>();
  for (const p of (progress || [])) {
    if (!quizScores.has(p.user_id)) quizScores.set(p.user_id, []);
    quizScores.get(p.user_id)!.push(p.quiz_score);
  }

  const quizAvgMap = new Map<string, number>();
  const quizEntries = Array.from(quizScores.entries());
  for (let i = 0; i < quizEntries.length; i++) {
    const [uid, scores] = quizEntries[i];
    quizAvgMap.set(
      uid,
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
    );
  }

  // Armar resultado
  return studentRows.map((row: any) => {
    const prof = profileMap.get(row.student_id) || {};
    return {
      ...row,
      student_name: prof.full_name || "Desconocido",
      student_email: prof.email || "",
      completed: prof.lessons_completed || 0,
      quizAvg: quizAvgMap.get(row.student_id) || 0,
      time: "—", // se podría calcular si hubiera campo time_spent en progress
      streak: prof.streak_days || 0,
    } as ClassStudent;
  });
}

/**
 * Agrega un estudiante a la clase.
 * Busca el perfil por email. Si no existe, crea una invitación (class_invitations).
 */
export async function addStudentToClass(
  classId: number,
  email: string
): Promise<{ student?: ClassStudent; invitation?: any }> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Verificar que la clase existe y el usuario tiene permisos
  const { data: clase } = await (sb.from("classes") as any)
    .select("id, catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");

  // Verificar si es el owner o co-catechist
  const isOwner = (clase as any).catechist_id === profile.id;
  let isCoCatechist = false;
  if (!isOwner) {
    const { data: coCheck } = await (sb.from("class_catechists") as any)
      .select("catechist_id")
      .eq("class_id", classId)
      .eq("catechist_id", profile.id)
      .maybeSingle();
    isCoCatechist = !!coCheck;
  }

  if (!isOwner && !isCoCatechist && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para agregar estudiantes a esta clase");
  }

  // Buscar perfil por email
  const { data: studentProfile } = await (sb.from("profiles") as any)
    .select("id, email, full_name")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (studentProfile) {
    // El estudiante existe: insertar directamente en class_students
    const { data, error } = await (sb.from("class_students") as any)
      .upsert(
        {
          class_id: classId,
          student_id: (studentProfile as any).id,
          joined_at: new Date().toISOString(),
        },
        { onConflict: "class_id,student_id" }
      )
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("El estudiante ya está en esta clase");
      }
      throw new Error(error.message);
    }

    return {
      student: {
        ...data,
        student_name: (studentProfile as any).full_name,
        student_email: (studentProfile as any).email,
      } as ClassStudent,
    };
  }

  // El estudiante no existe: crear invitación
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

  const { data: invitation, error: invError } = await (
    sb.from("class_invitations") as any
  )
    .insert({
      class_id: classId,
      email: email.toLowerCase().trim(),
      token,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      accepted: false,
    })
    .select()
    .single();

  if (invError) throw new Error(invError.message);

  return { invitation };
}

/**
 * Elimina un estudiante de la clase (soft-delete de la relación).
 */
export async function removeStudentFromClass(
  classId: number,
  studentId: string
): Promise<void> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Verificar permisos (owner, co-catechist, o super_admin)
  const { data: clase } = await (sb.from("classes") as any)
    .select("catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");

  const isOwner = (clase as any).catechist_id === profile.id;
  let isCoCatechist = false;
  if (!isOwner) {
    const { data: coCheck } = await (sb.from("class_catechists") as any)
      .select("catechist_id")
      .eq("class_id", classId)
      .eq("catechist_id", profile.id)
      .maybeSingle();
    isCoCatechist = !!coCheck;
  }

  if (!isOwner && !isCoCatechist && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para remover estudiantes de esta clase");
  }

  const { error } = await (sb.from("class_students") as any)
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
}

/**
 * Lado del estudiante: unirse a una clase usando el código de invitación.
 */
export async function joinClassByCode(
  inviteCode: string
): Promise<ClassStudent> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Buscar clase por código de invitación
  const { data: clase } = await (sb.from("classes") as any)
    .select("*")
    .eq("invite_code", inviteCode.toUpperCase().trim())
    .neq("status", "deleted")
    .single();

  if (!clase) throw new Error("Código de invitación inválido o clase no encontrada");

  // Verificar que no esté ya en la clase
  const { data: existing } = await (sb.from("class_students") as any)
    .select("id")
    .eq("class_id", (clase as any).id)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (existing) throw new Error("Ya estás en esta clase");

  // Insertar en class_students
  const { data, error } = await (sb.from("class_students") as any)
    .insert({
      class_id: (clase as any).id,
      student_id: profile.id,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    student_name: profile.full_name,
    student_email: profile.email,
  } as ClassStudent;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEQUISTAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los perfiles con rol de catechist, admin o super_admin.
 */
export async function getCatechists(): Promise<CatechistProfile[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .in("role", ["catechist", "admin", "super_admin"])
    .order("full_name", { ascending: true });

  return (data || []) as CatechistProfile[];
}

/**
 * Obtiene los catequistas de una clase usando MANUAL two-query join via Map.
 * NO usa PostgREST embedding (!catechist_id).
 *
 * Query 1: class_catechists donde class_id = X
 * Query 2: profiles donde id IN (catechist_ids de query 1)
 * Se unen manualmente con Map.
 */
export async function getClassCatechists(
  classId: number
): Promise<ClassCatechist[]> {
  const sb = requireSupabase();
  // Query 1: relaciones de la tabla class_catechists
  const { data: relations } = await sb
    .from("class_catechists")
    .select("*")
    .eq("class_id", classId);

  const relationRows = (relations || []) as any[];
  if (relationRows.length === 0) return [];

  // Query 2: perfiles de esos catequistas
  const catechistIds = relationRows.map((r: any) => r.catechist_id);
  const { data: profiles } = await (sb.from("profiles") as any)
    .select("id, email, full_name, role")
    .in("id", catechistIds);

  // Unir manualmente vía Map
  const profileMap = new Map<string, any>();
  for (const p of (profiles || [])) {
    profileMap.set(p.id, p);
  }

  return relationRows.map((row: any) => {
    const prof = profileMap.get(row.catechist_id) || {};
    return {
      ...row,
      full_name: prof.full_name || "Desconocido",
      email: prof.email || "",
      role: prof.role || "",
    } as ClassCatechist;
  });
}

/**
 * Agrega un catequista como co-catechist de una clase.
 * Inserta en class_catechists. Captura error 23505 (unique violation).
 */
export async function addCatechistToClass(
  classId: number,
  catechistId: string
): Promise<ClassCatechist> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Solo el owner o super_admin pueden agregar catequistas
  const { data: clase } = await (sb.from("classes") as any)
    .select("catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");
  if ((clase as any).catechist_id !== profile.id && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para agregar catequistas a esta clase");
  }

  const { data, error } = await (sb.from("class_catechists") as any)
    .insert({
      class_id: classId,
      catechist_id: catechistId,
      assigned_by: profile.id,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este catequista ya está asignado a esta clase");
    }
    throw new Error(error.message);
  }

  // Obtener datos del perfil para enriquecer
  const { data: catechistProfile } = await (sb.from("profiles") as any)
    .select("full_name, email, role")
    .eq("id", catechistId)
    .single();

  return {
    ...data,
    full_name: (catechistProfile as any)?.full_name || "",
    email: (catechistProfile as any)?.email || "",
    role: (catechistProfile as any)?.role || "",
  } as ClassCatechist;
}

/**
 * Remueve un catequista de la clase (de la tabla class_catechists).
 */
export async function removeCatechistFromClass(
  classId: number,
  catechistId: string
): Promise<void> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  // Solo el owner o super_admin pueden remover
  const { data: clase } = await (sb.from("classes") as any)
    .select("catechist_id")
    .eq("id", classId)
    .single();

  if (!clase) throw new Error("Clase no encontrada");
  if ((clase as any).catechist_id !== profile.id && profile.role !== "super_admin") {
    throw new Error("No tienes permisos para remover catequistas de esta clase");
  }

  const { error } = await (sb.from("class_catechists") as any)
    .delete()
    .eq("class_id", classId)
    .eq("catechist_id", catechistId);

  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASIGNACIONES (TAREAS)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las asignaciones de una clase.
 */
export async function getClassAssignments(
  classId: number
): Promise<ClassAssignment[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from("class_assignments")
    .select("*")
    .eq("class_id", classId)
    .order("sort_order", { ascending: true });

  return (data || []) as ClassAssignment[];
}

/**
 * Agrega una asignación a una clase.
 */
export async function addAssignment(
  input: CreateAssignmentInput
): Promise<ClassAssignment> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  const { data, error } = await (sb.from("class_assignments") as any)
    .insert({
      class_id: input.class_id,
      lesson_slug: input.lesson_slug,
      lesson_title: input.lesson_title,
      assignment_type: input.assignment_type || "lesson",
      notes: input.notes || null,
      status: "active",
      sort_order: input.sort_order || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Esta lección ya está asignada a esta clase");
    }
    throw new Error(error.message);
  }

  return data as ClassAssignment;
}

/**
 * Actualiza una asignación existente.
 */
export async function updateAssignment(
  assignmentId: number,
  input: UpdateAssignmentInput
): Promise<ClassAssignment> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  const { data, error } = await (sb.from("class_assignments") as any)
    .update(input)
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ClassAssignment;
}

/**
 * Elimina una asignación (hard delete del registro).
 */
export async function removeAssignment(assignmentId: number): Promise<void> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  const { error } = await sb
    .from("class_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANUNCIOS DE CLASE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ClassAnnouncement {
  id: string;
  class_id: number;
  author_id: string;
  content: string;
  pinned: boolean;
  created_at: string;
  author_name?: string;
  author_email?: string;
}

export async function getClassAnnouncements(
  classId: number
): Promise<ClassAnnouncement[]> {
  const sb = requireSupabase();
  const { data: rows, error } = await sb
    .from("class_announcements")
    .select("*")
    .eq("class_id", classId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const announcements = (rows || []) as any[];

  if (announcements.length > 0) {
    const authorIds = [...new Set(announcements.map((a) => a.author_id))];
    const { data: profiles } = await (sb
      .from("profiles") as any)
      .select("id, full_name, email")
      .in("id", authorIds);

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) profileMap.set(p.id, p);

    for (const ann of announcements) {
      const prof = profileMap.get(ann.author_id) || {};
      ann.author_name = prof.full_name || "";
      ann.author_email = prof.email || "";
    }
  }

  return announcements as ClassAnnouncement[];
}

export async function addAnnouncement(
  classId: number,
  content: string
): Promise<ClassAnnouncement> {
  const sb = requireSupabase();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autenticado");

  const { data, error } = await (sb
    .from("class_announcements") as any)
    .insert({
      class_id: classId,
      author_id: profile.id,
      content: content.trim(),
      pinned: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    author_name: profile.full_name,
    author_email: profile.email,
  } as ClassAnnouncement;
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("class_announcements")
    .delete()
    .eq("id", announcementId);

  if (error) throw new Error(error.message);
}

export async function togglePinAnnouncement(
  announcementId: string,
  pinned: boolean
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await (sb as any)
    .from("class_announcements")
    .update({ pinned })
    .eq("id", announcementId);

  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADEBOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface GradebookEntry {
  student_id: string;
  student_name: string;
  assignment_id: number;
  completed: boolean;
  score: number | null;
}

export async function getGradebook(classId: number): Promise<{
  students: ClassStudent[];
  assignments: ClassAssignment[];
  grades: Record<string, Record<number, { completed: boolean; score: number | null }>>;
}> {
  const sb = requireSupabase();
  const [students, assignments] = await Promise.all([
    getClassStudents(classId),
    getClassAssignments(classId),
  ]);

  const grades: Record<string, Record<number, { completed: boolean; score: number | null }>> = {};

  if (students.length > 0) {
    const studentIds = students.map((s) => s.student_id);
    const { data: progressRows } = await (sb
      .from("lesson_progress") as any)
      .select("user_id, lesson_slug, quiz_score, status")
      .in("user_id", studentIds);

    for (const student of students) {
      grades[student.student_id] = {};
    }

    const assignmentMap = new Map<string, number>();
    for (const a of assignments) {
      if (a.lesson_slug) assignmentMap.set(a.lesson_slug, a.id);
    }

    for (const p of progressRows || []) {
      const assignmentId = assignmentMap.get(p.lesson_slug);
      if (assignmentId && grades[p.user_id]) {
        grades[p.user_id][assignmentId] = {
          completed: p.status === "completed",
          score: p.quiz_score ?? null,
        };
      }
    }
  }

  return { students, assignments, grades };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LECCIONES DISPONIBLES
// ═══════════════════════════════════════════════════════════════════════════════

let _cachedManifest: LessonManifestEntry[] | null = null;

/**
 * Obtiene las lecciones disponibles desde el manifest JSON público.
 * Usa caché en memoria para evitar múltiples fetches.
 */
export async function getAvailableLessons(
  lang: string = "es"
): Promise<LessonManifestEntry[]> {
  if (_cachedManifest) {
    return _cachedManifest.filter((l) => l.lang === lang && l.slug !== "index");
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(`${baseUrl}/content-lessons/lesson-manifest.json`);

  if (!res.ok) {
    throw new Error(`Error al cargar el manifest de lecciones: ${res.status}`);
  }

  const manifest = await res.json();
  const allEntries =
    (manifest[lang] as LessonManifestEntry[]) ||
    ([] as LessonManifestEntry[]);

  // Guardar en caché las entradas del idioma solicitado
  // Nota: guardamos todas las entradas de todos los idiomas para futuros accesos
  _cachedManifest = [];
  for (const l of Object.keys(manifest)) {
    for (const entry of manifest[l]) {
      _cachedManifest.push(entry);
    }
  }

  return allEntries.filter((l) => l.slug !== "index");
}