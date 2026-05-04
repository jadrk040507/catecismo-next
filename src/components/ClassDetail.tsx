"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
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
  type Clase,
  type ClassStudent,
  type ClassCatechist,
  type ClassAssignment,
  type LessonManifestEntry,
  type CatechistProfile,
} from "@/lib/classes";

type Tab = "stream" | "students" | "catechists" | "assignments";

interface Props {
  classId: number;
  onBack: () => void;
}

export default function ClassDetail({ classId, onBack }: Props) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";

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
  const [addingAssignment, setAddingAssignment] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // ─── Toast helper ────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ─── Load initial data ───────────────────────────────────────────────
  const loadClassData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClassById(classId);
      if (!result.class) {
        showToast("Clase no encontrada.");
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
  }, [classId, onBack]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  // ─── Load tab-specific data ──────────────────────────────────────────
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
        getAvailableLessons(lang),
      ]);
      setAssignments(asgns);
      setLessons(lsnData);
    } catch (e: any) {
      showToast(e.message || "Error al cargar asignaciones.");
    }
  }

  // ─── Load tab data when tab changes ──────────────────────────────────
  useEffect(() => {
    if (tab === "students") loadStudents();
    else if (tab === "catechists") loadCatechists();
    else if (tab === "assignments") loadAssignments();
  }, [tab]);

  // ─── Student actions ─────────────────────────────────────────────────
  async function handleInviteStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await addStudentToClass(classId, inviteEmail.trim());
      if (result.invitation) {
        showToast("Invitación enviada. El estudiante recibirá un correo.");
      } else {
        showToast("Estudiante agregado exitosamente.");
      }
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
      showToast("Estudiante removido.");
      await loadStudents();
    } catch (e: any) {
      showToast(e.message || "Error al remover estudiante.");
    }
  }

  // ─── Catechist actions ───────────────────────────────────────────────
  async function handleAddCatechist() {
    if (!selectedCatechistId) return;
    setAddingCatechist(true);
    try {
      await addCatechistToClass(classId, selectedCatechistId);
      showToast("Catequista agregado.");
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
      showToast("Catequista removido.");
      await loadCatechists();
    } catch (e: any) {
      showToast(e.message || "Error al remover catequista.");
    }
  }

  // ─── Assignment actions ──────────────────────────────────────────────
  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssignmentLesson) return;
    setAddingAssignment(true);
    const lesson = lessons.find((l) => l.slug === newAssignmentLesson);
    if (!lesson) {
      showToast("Seleccioná una lección válida.");
      setAddingAssignment(false);
      return;
    }
    try {
      await addAssignment({
        class_id: classId,
        lesson_slug: lesson.slug,
        lesson_title: lesson.title,
        assignment_type: newAssignmentType,
        notes: newAssignmentNotes || undefined,
      });
      showToast("Asignación creada.");
      setNewAssignmentLesson("");
      setNewAssignmentType("lesson");
      setNewAssignmentNotes("");
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
      showToast("Asignación eliminada.");
      await loadAssignments();
    } catch (e: any) {
      showToast(e.message || "Error al eliminar asignación.");
    }
  }

  // ─── Type badge color ────────────────────────────────────────────────
  function typeBadgeClass(t: string) {
    const map: Record<string, string> = {
      lesson: "accent",
      workbook: "info",
      guide: "warn",
      video: "good",
      quiz: "bad",
    };
    return map[t] || "default";
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

  // ─── i18n ────────────────────────────────────────────────────────────
  const t = (key: string) =>
    (
      ({
        stream: { es: "Inicio", en: "Stream" },
        students: { es: "Estudiantes", en: "Students" },
        catechists: { es: "Catequistas", en: "Catechists" },
        assignments: { es: "Asignaciones", en: "Assignments" },
        back: { es: "← Volver", en: "← Back" },
        className: { es: "Nombre", en: "Name" },
        description: { es: "Descripción", en: "Description" },
        inviteCode: { es: "Código de invitación", en: "Invite Code" },
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
        role: { es: "Rol", en: "Role" },
        completedLessons: { es: "Lecciones completadas", en: "Completed" },
        quizAvg: { es: "Promedio quiz", en: "Quiz Avg" },
        streak: { es: "Racha", en: "Streak" },
        addCatechist: { es: "Agregar catequista", en: "Add catechist" },
        selectCatechist: { es: "Seleccionar catequista…", en: "Select catechist…" },
        add: { es: "Agregar", en: "Add" },
        noCatechists: { es: "No hay catequistas adicionales.", en: "No additional catechists." },
        newAssignment: { es: "+ Nueva asignación", en: "+ New assignment" },
        createAssignment: { es: "Crear asignación", en: "Create assignment" },
        lessonLabel: { es: "Lección", en: "Lesson" },
        selectLesson: { es: "Seleccionar lección…", en: "Select lesson…" },
        typeLabel: { es: "Tipo", en: "Type" },
        notesLabel: { es: "Notas (opcional)", en: "Notes (optional)" },
        notesPlaceholder: { es: "Instrucciones adicionales…", en: "Additional instructions…" },
        cancel: { es: "Cancelar", en: "Cancel" },
        create: { es: "Crear", en: "Create" },
        noAssignments: { es: "No hay asignaciones.", en: "No assignments." },
        lessonTitle: { es: "Título", en: "Title" },
        typeCol: { es: "Tipo", en: "Type" },
        notesCol: { es: "Notas", en: "Notes" },
        noDescription: { es: "Sin descripción.", en: "No description." },
      }) as Record<string, { es: string; en: string }>
    )[key]?.[isEn ? "en" : "es"] || key;

  // ─── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <button className="db-btn ghost" onClick={onBack}>
          {t("back")}
        </button>
        <div className="db-empty" style={{ marginTop: 24 }}>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!clase) {
    return (
      <div>
        <button className="db-btn ghost" onClick={onBack}>
          {t("back")}
        </button>
        <div className="db-empty" style={{ marginTop: 24 }}>
          <p>{isEn ? "Class not found." : "Clase no encontrada."}</p>
        </div>
      </div>
    );
  }

  // ─── Filter catechists: exclude those already in the class ───────────
  const existingCatechistIds = new Set(classCatechists.map((c) => c.catechist_id));
  const availableCatechists = allCatechists.filter((c) => !existingCatechistIds.has(c.id));

  return (
    <div>
      {/* ─── Back button ─── */}
      <button className="db-btn ghost" onClick={onBack} style={{ marginBottom: 16 }}>
        {t("back")}
      </button>

      {/* ─── Header ─── */}
      <h1>{clase.name}</h1>
      {clase.description && (
        <p className="db-subtitle">{clase.description}</p>
      )}

      {/* ─── Tabs ─── */}
      <div className="db-subtabs" style={{ marginTop: 20 }}>
        {(["stream", "students", "catechists", "assignments"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`db-subtab${tab === tb ? " active" : ""}`}
          >
            {t(tb)}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         TAB: STREAM
         ═══════════════════════════════════════════════════════════════ */}
      {tab === "stream" && (
        <div style={{ marginTop: 24, maxWidth: 600 }}>
          <div className="db-card" style={{ cursor: "default" }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                {t("className")}
              </span>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{clase.name}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                {t("description")}
              </span>
              <div style={{ color: "var(--text-secondary)" }}>
                {clase.description || t("noDescription")}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                {t("inviteCode")}
              </span>
              <div>
                <span className="db-badge accent" style={{ fontSize: 14, padding: "6px 14px" }}>
                  🔑 {clase.invite_code}
                </span>
              </div>
            </div>

            {ownerCatechist && (
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  {t("catechistOwner")}
                </span>
                <div style={{ color: "var(--text-secondary)" }}>
                  {ownerCatechist.full_name} ({ownerCatechist.email})
                </div>
              </div>
            )}

            {course && (
              <div>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  {t("course")}
                </span>
                <div style={{ color: "var(--text-secondary)" }}>{course.name}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         TAB: STUDENTS
         ═══════════════════════════════════════════════════════════════ */}
      {tab === "students" && (
        <div style={{ marginTop: 24 }}>
          {/* Invite form */}
          <form
            onSubmit={handleInviteStudent}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ maxWidth: 280, marginBottom: 0 }}
            />
            <button className="db-btn primary" disabled={inviting || !inviteEmail.trim()}>
              {inviting ? "…" : t("invite")}
            </button>
          </form>

          {/* Students table */}
          {students.length === 0 ? (
            <div className="db-empty">
              <p>{isEn ? "No students yet." : "Sin estudiantes todavía."}</p>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>{t("studentName")}</th>
                    <th>{t("studentEmail")}</th>
                    <th>{t("completedLessons")}</th>
                    <th>{t("quizAvg")}</th>
                    <th>{t("streak")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id}>
                      <td style={{ fontWeight: 500 }}>{s.student_name || "—"}</td>
                      <td>{s.student_email || "—"}</td>
                      <td>{s.completed || 0}</td>
                      <td>{s.quizAvg || 0}%</td>
                      <td>🔥 {s.streak || 0}d</td>
                      <td>
                        <button
                          className="db-btn sm ghost"
                          style={{ color: "var(--color-red)" }}
                          onClick={() => handleRemoveStudent(s.student_id)}
                        >
                          🗑️ {t("remove")}
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

      {/* ═══════════════════════════════════════════════════════════════
         TAB: CATECHISTS
         ═══════════════════════════════════════════════════════════════ */}
      {tab === "catechists" && (
        <div style={{ marginTop: 24 }}>
          {/* Add catechist form */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <select
              value={selectedCatechistId}
              onChange={(e) => setSelectedCatechistId(e.target.value)}
              style={{ maxWidth: 280, marginBottom: 0 }}
            >
              <option value="">{t("selectCatechist")}</option>
              {availableCatechists.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            <button
              className="db-btn primary"
              disabled={addingCatechist || !selectedCatechistId}
              onClick={handleAddCatechist}
            >
              {addingCatechist ? "…" : t("add")}
            </button>
          </div>

          {/* Owner catechist card */}
          {ownerCatechist && (
            <div className="db-card" style={{ cursor: "default", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ownerCatechist.full_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {ownerCatechist.email}
                  </div>
                </div>
                <span className="db-badge">{isEn ? "Owner" : "Titular"}</span>
              </div>
            </div>
          )}

          {/* Additional catechists */}
          {classCatechists.length === 0 && (
            <div className="db-empty" style={{ marginTop: 12 }}>
              <p>{t("noCatechists")}</p>
            </div>
          )}

          {classCatechists.map((c) => (
            <div key={c.catechist_id} className="db-card" style={{ cursor: "default", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.full_name || "—"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {c.email || "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {c.role && <span className="db-badge">{c.role}</span>}
                  <button
                    className="db-btn sm ghost"
                    style={{ color: "var(--color-red)" }}
                    onClick={() => handleRemoveCatechist(c.catechist_id)}
                  >
                    🗑️ {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         TAB: ASSIGNMENTS
         ═══════════════════════════════════════════════════════════════ */}
      {tab === "assignments" && (
        <div style={{ marginTop: 24 }}>
          {/* Add assignment button */}
          <div style={{ marginBottom: 20 }}>
            <button
              className="db-btn primary"
              onClick={() => setShowAddAssignment(true)}
            >
              {t("newAssignment")}
            </button>
          </div>

          {/* Assignments table */}
          {assignments.length === 0 ? (
            <div className="db-empty">
              <p>{t("noAssignments")}</p>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>{t("lessonTitle")}</th>
                    <th>{t("typeCol")}</th>
                    <th>{t("notesCol")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.lesson_title}</td>
                      <td>
                        <span className={`db-badge ${typeBadgeClass(a.assignment_type)}`}>
                          {typeLabel(a.assignment_type)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{a.notes || "—"}</td>
                      <td>
                        <button
                          className="db-btn sm ghost"
                          style={{ color: "var(--color-red)" }}
                          onClick={() => handleRemoveAssignment(a.id)}
                        >
                          🗑️ {t("remove")}
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

      {/* ═══════════════════════════════════════════════════════════════
         ASSIGNMENT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showAddAssignment && (
        <div className="db-overlay" onClick={() => setShowAddAssignment(false)}>
          <form
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddAssignment}
          >
            <h2>{t("createAssignment")}</h2>

            <label>{t("lessonLabel")}</label>
            <select
              value={newAssignmentLesson}
              onChange={(e) => setNewAssignmentLesson(e.target.value)}
              required
            >
              <option value="">{t("selectLesson")}</option>
              {lessons.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.title} {l.course ? `(${l.course})` : ""}
                </option>
              ))}
            </select>

            <label>{t("typeLabel")}</label>
            <select
              value={newAssignmentType}
              onChange={(e) =>
                setNewAssignmentType(e.target.value as ClassAssignment["assignment_type"])
              }
            >
              <option value="lesson">{typeLabel("lesson")}</option>
              <option value="workbook">{typeLabel("workbook")}</option>
              <option value="guide">{typeLabel("guide")}</option>
              <option value="video">{typeLabel("video")}</option>
              <option value="quiz">{typeLabel("quiz")}</option>
            </select>

            <label>{t("notesLabel")}</label>
            <textarea
              value={newAssignmentNotes}
              onChange={(e) => setNewAssignmentNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
            />

            <div className="db-modal-actions">
              <button
                type="button"
                className="db-btn"
                onClick={() => setShowAddAssignment(false)}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="db-btn primary"
                disabled={addingAssignment || !newAssignmentLesson}
              >
                {addingAssignment ? "…" : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast && <div className="db-toast">{toast}</div>}
    </div>
  );
}
