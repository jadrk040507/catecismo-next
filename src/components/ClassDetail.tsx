"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Trash2,
  UserPlus,
  Plus,
  Flame,
  BookOpen,
  Users,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Pin,
  PinOff,
  Copy,
  Check,
  Calendar,
  Clock,
  Send,
} from "lucide-react";
import {
  getClassById,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass,
  getClassCatechists,
  addCatechistToClass,
  removeCatechistFromClass,
  getClassAssignments,
  addAssignment,
  removeAssignment,
  getAvailableLessons,
  getCatechists,
  getClassAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
  getGradebook,
  type Clase,
  type ClassStudent,
  type ClassCatechist,
  type ClassAssignment,
  type LessonManifestEntry,
  type CatechistProfile,
  type ClassAnnouncement,
} from "@/lib/classes";

type Tab = "stream" | "announcements" | "assignments" | "gradebook" | "students" | "catechists";

interface Props {
  classId: number;
  onBack: () => void;
}

export default function ClassDetail({ classId, onBack }: Props) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const [tab, setTab] = useState<Tab>("stream");
  const [clase, setClase] = useState<Clase | null>(null);
  const [ownerCatechist, setOwnerCatechist] = useState<CatechistProfile | null>(null);
  const [course, setCourse] = useState<any>(null);

  // Students
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Catechists
  const [classCatechists, setClassCatechists] = useState<ClassCatechist[]>([]);
  const [allCatechists, setAllCatechists] = useState<CatechistProfile[]>([]);
  const [selectedCatechistId, setSelectedCatechistId] = useState("");
  const [addingCatechist, setAddingCatechist] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [lessons, setLessons] = useState<LessonManifestEntry[]>([]);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignmentLesson, setNewAssignmentLesson] = useState("");
  const [newAssignmentType, setNewAssignmentType] = useState<ClassAssignment["assignment_type"]>("lesson");
  const [newAssignmentNotes, setNewAssignmentNotes] = useState("");
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState("");
  const [newAssignmentSection, setNewAssignmentSection] = useState("");
  const [addingAssignment, setAddingAssignment] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Gradebook
  const [gradebook, setGradebook] = useState<{
    students: ClassStudent[];
    assignments: ClassAssignment[];
    grades: Record<string, Record<number, { completed: boolean; score: number | null }>>;
  } | null>(null);
  const [loadingGradebook, setLoadingGradebook] = useState(false);

  // Join code
  const [copiedCode, setCopiedCode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const loadClassData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClassById(classId);
      if (!result.class) {
        showToast(isEn ? "Class not found." : "Clase no encontrada.");
        onBack();
        return;
      }
      setClase(result.class);
      setOwnerCatechist(result.catechist);
      setCourse(result.course);
      setStudents(result.students);
    } catch (e: any) {
      showToast(e.message || "Error al cargar la clase.");
    } finally {
      setLoading(false);
    }
  }, [classId, onBack, isEn]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  async function loadStudents() {
    try {
      const data = await getClassStudents(classId);
      setStudents(data);
    } catch (e: any) {
      showToast(e.message || "Error al cargar estudiantes.");
    }
  }

  async function loadCatechists() {
    try {
      const [classCats, allCats] = await Promise.all([
        getClassCatechists(classId),
        getCatechists(),
      ]);
      setClassCatechists(classCats);
      setAllCatechists(allCats);
    } catch (e: any) {
      showToast(e.message || "Error al cargar catequistas.");
    }
  }

  async function loadAssignments() {
    try {
      const [asgns, lsnData] = await Promise.all([
        getClassAssignments(classId),
        getAvailableLessons(isEn ? "en" : "es"),
      ]);
      setAssignments(asgns);
      setLessons(lsnData);
    } catch (e: any) {
      showToast(e.message || "Error al cargar asignaciones.");
    }
  }

  async function loadAnnouncements() {
    try {
      const data = await getClassAnnouncements(classId);
      setAnnouncements(data);
    } catch (e: any) {
      showToast(e.message || "Error al cargar anuncios.");
    }
  }

  async function loadGradebookData() {
    setLoadingGradebook(true);
    try {
      const data = await getGradebook(classId);
      setGradebook(data);
    } catch (e: any) {
      showToast(e.message || "Error al cargar calificaciones.");
    } finally {
      setLoadingGradebook(false);
    }
  }

  useEffect(() => {
    if (tab === "students") loadStudents();
    else if (tab === "catechists") loadCatechists();
    else if (tab === "assignments") loadAssignments();
    else if (tab === "announcements") loadAnnouncements();
    else if (tab === "gradebook") loadGradebookData();
  }, [tab]);

  // ─── Actions ────────────────────────────────────────────────────────

  async function handleInviteStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await addStudentToClass(classId, inviteEmail.trim());
      showToast(result.invitation
        ? (isEn ? "Invitation sent." : "Invitación enviada.")
        : (isEn ? "Student added." : "Estudiante agregado."));
      setInviteEmail("");
      await loadStudents();
    } catch (e: any) {
      showToast(e.message || "Error al invitar estudiante.");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveStudent(studentId: string) {
    if (!confirm(isEn ? "Remove this student?" : "¿Remover este estudiante?")) return;
    try {
      await removeStudentFromClass(classId, studentId);
      showToast(isEn ? "Student removed." : "Estudiante removido.");
      await loadStudents();
    } catch (e: any) {
      showToast(e.message || "Error al remover estudiante.");
    }
  }

  async function handleAddCatechist() {
    if (!selectedCatechistId) return;
    setAddingCatechist(true);
    try {
      await addCatechistToClass(classId, selectedCatechistId);
      showToast(isEn ? "Catechist added." : "Catequista agregado.");
      setSelectedCatechistId("");
      await loadCatechists();
    } catch (e: any) {
      showToast(e.message || "Error al agregar catequista.");
    } finally {
      setAddingCatechist(false);
    }
  }

  async function handleRemoveCatechist(catechistId: string) {
    if (!confirm(isEn ? "Remove this catechist?" : "¿Remover este catequista?")) return;
    try {
      await removeCatechistFromClass(classId, catechistId);
      showToast(isEn ? "Catechist removed." : "Catequista removido.");
      await loadCatechists();
    } catch (e: any) {
      showToast(e.message || "Error al remover catequista.");
    }
  }

  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssignmentLesson) return;
    setAddingAssignment(true);
    const lesson = lessons.find((l) => l.slug === newAssignmentLesson);
    if (!lesson) { setAddingAssignment(false); return; }
    try {
      await addAssignment({
        class_id: classId,
        lesson_slug: lesson.slug,
        lesson_title: lesson.title,
        assignment_type: newAssignmentType,
        notes: newAssignmentNotes || undefined,
        due_date: newAssignmentDueDate || undefined,
        section_name: newAssignmentSection || undefined,
      });
      showToast(isEn ? "Assignment created." : "Asignación creada.");
      setNewAssignmentLesson("");
      setNewAssignmentType("lesson");
      setNewAssignmentNotes("");
      setNewAssignmentDueDate("");
      setNewAssignmentSection("");
      setShowAddAssignment(false);
      await loadAssignments();
    } catch (e: any) {
      showToast(e.message || "Error al crear asignación.");
    } finally {
      setAddingAssignment(false);
    }
  }

  async function handleRemoveAssignment(assignmentId: number) {
    if (!confirm(isEn ? "Remove this assignment?" : "¿Eliminar esta asignación?")) return;
    try {
      await removeAssignment(assignmentId);
      showToast(isEn ? "Assignment removed." : "Asignación eliminada.");
      await loadAssignments();
    } catch (e: any) {
      showToast(e.message || "Error al eliminar asignación.");
    }
  }

  async function handlePostAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setPostingAnnouncement(true);
    try {
      await addAnnouncement(classId, newAnnouncement.trim());
      setNewAnnouncement("");
      await loadAnnouncements();
      showToast(isEn ? "Announcement posted." : "Anuncio publicado.");
    } catch (e: any) {
      showToast(e.message || "Error al publicar anuncio.");
    } finally {
      setPostingAnnouncement(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm(isEn ? "Delete this announcement?" : "¿Eliminar este anuncio?")) return;
    try {
      await deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (e: any) {
      showToast(e.message || "Error al eliminar anuncio.");
    }
  }

  async function handleTogglePin(id: string, pinned: boolean) {
    try {
      await togglePinAnnouncement(id, !pinned);
      await loadAnnouncements();
    } catch (e: any) {
      showToast(e.message || "Error.");
    }
  }

  function copyInviteCode() {
    if (!clase) return;
    navigator.clipboard.writeText(clase.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  function typeBadgeClass(t: string) {
    const map: Record<string, string> = { lesson: "accent", workbook: "accent", guide: "gold", video: "green", quiz: "red" };
    return map[t] || "";
  }

  function typeLabel(t: string) {
    const map: Record<string, { es: string; en: string }> = {
      lesson: { es: "Lección", en: "Lesson" },
      workbook: { es: "Cuaderno", en: "Workbook" },
      guide: { es: "Guía", en: "Guide" },
      video: { es: "Video", en: "Video" },
      quiz: { es: "Examen", en: "Quiz" },
    };
    return map[t]?.[isEn ? "en" : "es"] || t;
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(isEn ? "en-US" : "es-ES", { month: "short", day: "numeric", year: "numeric" });
  }

  function isOverdue(iso: string | null) {
    if (!iso) return false;
    return new Date(iso) < new Date();
  }

  // ─── i18n ────────────────────────────────────────────────────────────

  const t = (key: string) =>
    (({
      stream: { es: "Inicio", en: "Stream" },
      announcements: { es: "Anuncios", en: "Announcements" },
      assignments: { es: "Asignaciones", en: "Assignments" },
      gradebook: { es: "Calificaciones", en: "Gradebook" },
      students: { es: "Estudiantes", en: "Students" },
      catechists: { es: "Catequistas", en: "Catechists" },
      back: { es: "Volver", en: "Back" },
      inviteCode: { es: "Código de invitación", en: "Invite Code" },
      copyCode: { es: "Copiar código", en: "Copy code" },
      copied: { es: "¡Copiado!", en: "Copied!" },
      shareCode: { es: "Comparte este código con tus estudiantes para que se unan", en: "Share this code with your students to join" },
      catechistOwner: { es: "Catequista titular", en: "Lead Catechist" },
      course: { es: "Curso", en: "Course" },
      none: { es: "Ninguno", en: "None" },
      loading: { es: "Cargando…", en: "Loading…" },
      inviteStudent: { es: "Invitar estudiante", en: "Invite student" },
      emailPlaceholder: { es: "correo@ejemplo.com", en: "email@example.com" },
      invite: { es: "Invitar", en: "Invite" },
      remove: { es: "Remover", en: "Remove" },
      studentName: { es: "Nombre", en: "Name" },
      studentEmail: { es: "Correo", en: "Email" },
      completedLessons: { es: "Completadas", en: "Completed" },
      quizAvg: { es: "Promedio", en: "Quiz Avg" },
      streak: { es: "Racha", en: "Streak" },
      addCatechist: { es: "Agregar catequista", en: "Add catechist" },
      selectCatechist: { es: "Seleccionar catequista…", en: "Select catechist…" },
      add: { es: "Agregar", en: "Add" },
      noCatechists: { es: "No hay catequistas adicionales.", en: "No additional catechists." },
      newAssignment: { es: "Nueva asignación", en: "New assignment" },
      createAssignment: { es: "Crear asignación", en: "Create assignment" },
      lessonLabel: { es: "Lección", en: "Lesson" },
      selectLesson: { es: "Seleccionar lección…", en: "Select lesson…" },
      typeLabel: { es: "Tipo", en: "Type" },
      notesLabel: { es: "Notas (opcional)", en: "Notes (optional)" },
      dueDateLabel: { es: "Fecha límite", en: "Due date" },
      sectionLabel: { es: "Sección", en: "Section" },
      notesPlaceholder: { es: "Instrucciones adicionales…", en: "Additional instructions…" },
      sectionPlaceholder: { es: "Ej: Parte I, Unidad 2…", en: "E.g. Part I, Unit 2…" },
      cancel: { es: "Cancelar", en: "Cancel" },
      create: { es: "Crear", en: "Create" },
      noAssignments: { es: "No hay asignaciones.", en: "No assignments." },
      noDescription: { es: "Sin descripción.", en: "No description." },
      postAnnouncement: { es: "Publicar anuncio", en: "Post announcement" },
      announcementPlaceholder: { es: "Escribe un anuncio para la clase…", en: "Write a class announcement…" },
      noAnnouncements: { es: "Sin anuncios todavía.", en: "No announcements yet." },
      pin: { es: "Fijar", en: "Pin" },
      unpin: { es: "Desfijar", en: "Unpin" },
      due: { es: "Vence", en: "Due" },
      overdue: { es: "Vencida", en: "Overdue" },
      noGradebook: { es: "Sin datos de calificaciones.", en: "No gradebook data." },
      score: { es: "Puntaje", en: "Score" },
      completed: { es: "Completada", en: "Completed" },
      pending: { es: "Pendiente", en: "Pending" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  const tabIcon: Record<Tab, React.ReactNode> = {
    stream: <LayoutDashboard size={14} aria-hidden="true" />,
    announcements: <Megaphone size={14} aria-hidden="true" />,
    assignments: <ClipboardList size={14} aria-hidden="true" />,
    gradebook: <BarChart3 size={14} aria-hidden="true" />,
    students: <Users size={14} aria-hidden="true" />,
    catechists: <BookOpen size={14} aria-hidden="true" />,
  };

  const tabs: Tab[] = ["stream", "announcements", "assignments", "gradebook", "students", "catechists"];

  // ─── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <button className="db-btn ghost" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft size={14} aria-hidden="true" /> {t("back")}
        </button>
        <div className="db-empty" style={{ marginTop: 24 }}><p>{t("loading")}</p></div>
      </div>
    );
  }

  if (!clase) {
    return (
      <div>
        <button className="db-btn ghost" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft size={14} aria-hidden="true" /> {t("back")}
        </button>
        <div className="db-empty" style={{ marginTop: 24 }}>
          <p>{isEn ? "Class not found." : "Clase no encontrada."}</p>
        </div>
      </div>
    );
  }

  const existingCatechistIds = new Set(classCatechists.map((c) => c.catechist_id));
  const availableCatechists = allCatechists.filter((c) => !existingCatechistIds.has(c.id));

  return (
    <div>
      {/* ─── Back + Header ─── */}
      <button className="db-btn ghost" onClick={onBack} aria-label={t("back")} style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} aria-hidden="true" /> {t("back")}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, flex: 1 }}>{clase.name}</h1>
        <button
          className="db-btn ghost"
          onClick={copyInviteCode}
          title={t("copyCode")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <KeyRound size={14} aria-hidden="true" />
          <span className="db-badge accent" style={{ fontSize: 14, padding: "4px 10px", fontFamily: "monospace" }}>
            {clase.invite_code}
          </span>
          {copiedCode ? <Check size={14} style={{ color: "var(--color-success, #16a34a)" }} /> : <Copy size={14} />}
        </button>
      </div>

      {clase.description && <p className="db-subtitle">{clase.description}</p>}

      {/* ─── Tabs ─── */}
      <nav className="db-subtabs" role="tablist" aria-label={isEn ? "Class sections" : "Secciones de clase"}>
        {tabs.map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            aria-controls={`panel-${tb}`}
            onClick={() => setTab(tb)}
            className={`db-subtab${tab === tb ? " active" : ""}`}
          >
            {tabIcon[tb]} {t(tb)}
          </button>
        ))}
      </nav>

      {/* ═══════ TAB: STREAM ═══════ */}
      {tab === "stream" && (
        <div role="tabpanel" id="panel-stream" style={{ marginTop: 24, maxWidth: 640 }}>
          {/* Join code card */}
          <div className="db-card" style={{ cursor: "default", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <KeyRound size={18} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              <span style={{ fontWeight: 600 }}>{t("inviteCode")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="db-badge accent" style={{ fontSize: 18, padding: "6px 16px", fontFamily: "monospace", letterSpacing: 2 }}>
                {clase.invite_code}
              </span>
              <button className="db-btn sm" onClick={copyInviteCode}>
                {copiedCode ? <><Check size={14} /> {t("copied")}</> : <><Copy size={14} /> {t("copyCode")}</>}
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-secondary)", marginTop: 8 }}>{t("shareCode")}</p>
          </div>

          {/* Class info card */}
          <div className="db-card" style={{ cursor: "default" }}>
            {ownerCatechist && (
              <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
                <div className="db-stat-lbl">{t("catechistOwner")}</div>
                <div style={{ color: "var(--color-secondary)" }}>{ownerCatechist.full_name}</div>
              </div>
            )}
            {course && (
              <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
                <div className="db-stat-lbl">{t("course")}</div>
                <div style={{ color: "var(--color-secondary)" }}>{course.name}</div>
              </div>
            )}
            <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
              <div className="db-stat-lbl">{isEn ? "Students" : "Estudiantes"}</div>
              <div style={{ color: "var(--color-secondary)" }}>{students.length}</div>
            </div>
          </div>

          {/* Recent announcements preview */}
          {announcements.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Megaphone size={14} aria-hidden="true" /> {isEn ? "Recent Announcements" : "Anuncios recientes"}
              </h3>
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="db-card" style={{ cursor: "default", marginBottom: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, color: "var(--color-secondary)", marginBottom: 4 }}>
                    {a.author_name} · {formatDate(a.created_at)}
                    {a.pinned && <Pin size={11} style={{ marginLeft: 6, verticalAlign: "text-bottom", color: "var(--color-accent)" }} />}
                  </div>
                  <div style={{ fontSize: 14 }}>{a.content}</div>
                </div>
              ))}
              <button className="db-btn ghost" onClick={() => setTab("announcements")} style={{ marginTop: 4, fontSize: 13 }}>
                {isEn ? "View all announcements →" : "Ver todos los anuncios →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: ANNOUNCEMENTS ═══════ */}
      {tab === "announcements" && (
        <div role="tabpanel" id="panel-announcements" style={{ marginTop: 24, maxWidth: 640 }}>
          {/* New announcement form */}
          <form onSubmit={handlePostAnnouncement} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="db-search"
                type="text"
                placeholder={t("announcementPlaceholder")}
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                aria-label={t("postAnnouncement")}
                style={{ flex: 1 }}
              />
              <button
                className="db-btn primary"
                disabled={postingAnnouncement || !newAnnouncement.trim()}
                aria-label={t("postAnnouncement")}
              >
                <Send size={14} aria-hidden="true" /> {postingAnnouncement ? "…" : (isEn ? "Post" : "Publicar")}
              </button>
            </div>
          </form>

          {announcements.length === 0 ? (
            <div className="db-empty"><p>{t("noAnnouncements")}</p></div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="db-card" style={{ cursor: "default", marginBottom: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12, color: "var(--color-secondary)" }}>
                      <span style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.author_name || "—"}</span>
                      <span>·</span>
                      <Clock size={11} aria-hidden="true" />
                      <span>{formatDate(a.created_at)}</span>
                      {a.pinned && <Pin size={11} style={{ color: "var(--color-accent)" }} aria-hidden="true" />}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>{a.content}</div>
                  </div>
                  <div className="db-btn-group" style={{ gap: 2, marginLeft: 8, flexShrink: 0 }}>
                    <button
                      className="db-btn sm ghost"
                      onClick={() => handleTogglePin(a.id, a.pinned)}
                      title={a.pinned ? t("unpin") : t("pin")}
                      aria-label={a.pinned ? t("unpin") : t("pin")}
                    >
                      {a.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                    <button
                      className="db-btn sm danger ghost"
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      aria-label={t("remove")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════ TAB: ASSIGNMENTS (with due dates) ═══════ */}
      {tab === "assignments" && (
        <div role="tabpanel" id="panel-assignments" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <button className="db-btn primary" onClick={() => setShowAddAssignment(true)} aria-label={t("newAssignment")}>
              <Plus size={14} aria-hidden="true" /> {t("newAssignment")}
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="db-empty"><p>{t("noAssignments")}</p></div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table" aria-label={isEn ? "Assignments" : "Asignaciones"}>
                <thead>
                  <tr>
                    <th>{isEn ? "Title" : "Título"}</th>
                    <th>{isEn ? "Section" : "Sección"}</th>
                    <th>{isEn ? "Type" : "Tipo"}</th>
                    <th>{isEn ? "Due Date" : "Fecha límite"}</th>
                    <th><span className="sr-only">{t("remove")}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td data-label={isEn ? "Title" : "Título"} style={{ fontWeight: 500 }}>{a.lesson_title}</td>
                      <td data-label={isEn ? "Section" : "Sección"} style={{ color: "var(--color-secondary)" }}>
                        {a.section_name || "—"}
                      </td>
                      <td data-label={isEn ? "Type" : "Tipo"}>
                        <span className={`db-badge ${typeBadgeClass(a.assignment_type)}`}>
                          {typeLabel(a.assignment_type)}
                        </span>
                      </td>
                      <td data-label={isEn ? "Due Date" : "Fecha límite"}>
                        {a.due_date ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: isOverdue(a.due_date) ? "var(--color-danger, #dc2626)" : "var(--color-secondary)" }}>
                            <Calendar size={12} aria-hidden="true" />
                            {isOverdue(a.due_date) && <span className="db-badge red" style={{ fontSize: 10, padding: "1px 6px" }}>{t("overdue")}</span>}
                            {!isOverdue(a.due_date) && formatDate(a.due_date)}
                          </span>
                        ) : "—"}
                      </td>
                      <td data-label="">
                        <button className="db-btn sm danger ghost" onClick={() => handleRemoveAssignment(a.id)} aria-label={`${t("remove")} ${a.lesson_title}`}>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: GRADEBOOK ═══════ */}
      {tab === "gradebook" && (
        <div role="tabpanel" id="panel-gradebook" style={{ marginTop: 24 }}>
          {loadingGradebook ? (
            <div className="db-empty"><p>{t("loading")}</p></div>
          ) : !gradebook || gradebook.students.length === 0 ? (
            <div className="db-empty"><p>{t("noGradebook")}</p></div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table" aria-label={isEn ? "Gradebook" : "Calificaciones"}>
                <thead>
                  <tr>
                    <th>{isEn ? "Student" : "Estudiante"}</th>
                    {gradebook.assignments.map((a) => (
                      <th key={a.id} style={{ fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.lesson_title}>
                        {a.lesson_title}
                      </th>
                  ))}
                  </tr>
                </thead>
                <tbody>
                  {gradebook.students.map((s) => (
                    <tr key={s.student_id}>
                      <td data-label={isEn ? "Student" : "Estudiante"} style={{ fontWeight: 500 }}>
                        {s.student_name || "—"}
                      </td>
                      {gradebook.assignments.map((a) => {
                        const g = gradebook.grades[s.student_id]?.[a.id];
                        return (
                          <td key={a.id} data-label={a.lesson_title} style={{ textAlign: "center" }}>
                            {g?.completed ? (
                              <span style={{ color: "var(--color-success, #16a34a)", fontWeight: 600 }}>
                                {g.score !== null ? `${g.score}%` : "✓"}
                              </span>
                            ) : g?.score !== null && g?.score !== undefined ? (
                              <span style={{ color: "var(--color-secondary)" }}>{g.score}%</span>
                            ) : (
                              <span style={{ color: "var(--color-tertiary, #9ca3af)" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: STUDENTS ═══════ */}
      {tab === "students" && (
        <div role="tabpanel" id="panel-students" style={{ marginTop: 24 }}>
          <form className="db-form-row" onSubmit={handleInviteStudent} aria-label={t("inviteStudent")}>
            <input
              className="db-search"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              aria-label={t("emailPlaceholder")}
            />
            <button className="db-btn primary" disabled={inviting || !inviteEmail.trim()} aria-label={t("invite")}>
              <UserPlus size={14} aria-hidden="true" /> {inviting ? "…" : t("invite")}
            </button>
          </form>

          {students.length === 0 ? (
            <div className="db-empty"><p>{isEn ? "No students yet." : "Sin estudiantes todavía."}</p></div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table" aria-label={isEn ? "Students" : "Estudiantes"}>
                <thead>
                  <tr>
                    <th>{t("studentName")}</th>
                    <th>{t("studentEmail")}</th>
                    <th>{t("completedLessons")}</th>
                    <th>{t("quizAvg")}</th>
                    <th>{t("streak")}</th>
                    <th><span className="sr-only">{t("remove")}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id}>
                      <td data-label={t("studentName")} style={{ fontWeight: 500 }}>{s.student_name || "—"}</td>
                      <td data-label={t("studentEmail")}>{s.student_email || "—"}</td>
                      <td data-label={t("completedLessons")}>{s.completed || 0}</td>
                      <td data-label={t("quizAvg")}>{s.quizAvg || 0}%</td>
                      <td data-label={t("streak")}>
                        <Flame size={14} aria-hidden="true" style={{ color: "var(--color-papal, #C9882B)", verticalAlign: "text-bottom" }} /> {s.streak || 0}d
                      </td>
                      <td data-label="">
                        <button className="db-btn sm danger ghost" onClick={() => handleRemoveStudent(s.student_id)} aria-label={`${t("remove")} ${s.student_name || s.student_email}`}>
                          <Trash2 size={14} aria-hidden="true" /> {t("remove")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: CATECHISTS ═══════ */}
      {tab === "catechists" && (
        <div role="tabpanel" id="panel-catechists" style={{ marginTop: 24 }}>
          <div className="db-form-row" style={{ marginBottom: 20 }}>
            <select className="db-inline-select" value={selectedCatechistId} onChange={(e) => setSelectedCatechistId(e.target.value)} aria-label={t("selectCatechist")} style={{ maxWidth: 280 }}>
              <option value="">{t("selectCatechist")}</option>
              {availableCatechists.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
            <button className="db-btn primary" disabled={addingCatechist || !selectedCatechistId} onClick={handleAddCatechist} aria-label={t("add")}>
              <UserPlus size={14} aria-hidden="true" /> {addingCatechist ? "…" : t("add")}
            </button>
          </div>

          {ownerCatechist && (
            <div className="db-card" style={{ cursor: "default", marginBottom: 12 }}>
              <div className="db-card-footer">
                <div>
                  <div className="db-card-title">{ownerCatechist.full_name}</div>
                  <div className="db-card-desc">{ownerCatechist.email}</div>
                </div>
                <span className="db-badge">{isEn ? "Owner" : "Titular"}</span>
              </div>
            </div>
          )}

          {classCatechists.length === 0 && (
            <div className="db-empty" style={{ marginTop: 12 }}><p>{t("noCatechists")}</p></div>
          )}

          {classCatechists.map((c) => (
            <div key={c.catechist_id} className="db-card" style={{ cursor: "default", marginBottom: 8 }}>
              <div className="db-card-footer">
                <div>
                  <div className="db-card-title">{c.full_name || "—"}</div>
                  <div className="db-card-desc">{c.email || "—"}</div>
                </div>
                <div className="db-btn-group">
                  {c.role && <span className="db-badge">{c.role}</span>}
                  <button className="db-btn sm danger ghost" onClick={() => handleRemoveCatechist(c.catechist_id)} aria-label={`${t("remove")} ${c.full_name || c.email}`}>
                    <Trash2 size={14} aria-hidden="true" /> {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ ASSIGNMENT MODAL ═══════ */}
      {showAddAssignment && (
        <div className="db-overlay" onClick={() => setShowAddAssignment(false)} role="dialog" aria-modal="true" aria-label={t("createAssignment")}>
          <form className="db-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAddAssignment}>
            <h2>{t("createAssignment")}</h2>

            <label htmlFor="assignment-lesson">{t("lessonLabel")}</label>
            <select id="assignment-lesson" value={newAssignmentLesson} onChange={(e) => setNewAssignmentLesson(e.target.value)} required>
              <option value="">{t("selectLesson")}</option>
              {lessons.map((l) => (
                <option key={l.slug} value={l.slug}>{l.title} {l.course ? `(${l.course})` : ""}</option>
              ))}
            </select>

            <label htmlFor="assignment-type">{t("typeLabel")}</label>
            <select id="assignment-type" value={newAssignmentType} onChange={(e) => setNewAssignmentType(e.target.value as ClassAssignment["assignment_type"])}>
              <option value="lesson">{typeLabel("lesson")}</option>
              <option value="workbook">{typeLabel("workbook")}</option>
              <option value="guide">{typeLabel("guide")}</option>
              <option value="video">{typeLabel("video")}</option>
              <option value="quiz">{typeLabel("quiz")}</option>
            </select>

            <label htmlFor="assignment-section">{t("sectionLabel")}</label>
            <input
              id="assignment-section"
              type="text"
              value={newAssignmentSection}
              onChange={(e) => setNewAssignmentSection(e.target.value)}
              placeholder={t("sectionPlaceholder")}
            />

            <label htmlFor="assignment-due">{t("dueDateLabel")}</label>
            <input
              id="assignment-due"
              type="date"
              value={newAssignmentDueDate}
              onChange={(e) => setNewAssignmentDueDate(e.target.value)}
            />

            <label htmlFor="assignment-notes">{t("notesLabel")}</label>
            <textarea id="assignment-notes" value={newAssignmentNotes} onChange={(e) => setNewAssignmentNotes(e.target.value)} placeholder={t("notesPlaceholder")} />

            <div className="db-modal-actions">
              <button type="button" className="db-btn" onClick={() => setShowAddAssignment(false)}>{t("cancel")}</button>
              <button type="submit" className="db-btn primary" disabled={addingAssignment || !newAssignmentLesson}>
                {addingAssignment ? "…" : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast && <div className="db-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}