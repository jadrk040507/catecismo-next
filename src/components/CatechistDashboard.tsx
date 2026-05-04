"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassById,
  type Clase,
  type CreateClassInput,
  type UpdateClassInput,
} from "@/lib/classes";

// ─── Tipos locales ───────────────────────────────────────────────────────────

/** Curso cargado desde Supabase */
interface CourseRow {
  id: number;
  name: string;
  sort_order?: number;
}

/** Clase enriquecida con course_name y student_count para las cards */
interface AugmentedClass extends Clase {
  course_name?: string;
  student_count?: number;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatechistDashboard({
  catechistId,
  catechistName,
}: {
  catechistId: string;
  catechistName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isEn = pathname.startsWith("/en");
  const base = isEn ? "/en" : "";

  const { user } = useAuth();
  const supabase = getSupabase();

  const [classes, setClasses] = useState<AugmentedClass[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // ─── Modals ──────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<AugmentedClass | null>(null);

  // ─── Delete danger zone ──────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ─── Form state ──────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // ─── Load data ───────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

      // Cargar clases (getClasses usa el perfil autenticado, no necesita catechistId)
      const [rawClasses, { data: courseRows }] = await Promise.all([
        getClasses(),
        supabase.from("courses").select("*").order("sort_order"),
      ]);

      const coursesData: CourseRow[] = (courseRows || []) as CourseRow[];

      // Crear mapa de course_id → course_name
      const courseMap = new Map<number, string>();
      for (const c of coursesData) {
        courseMap.set(c.id, c.name);
      }

      // Enriquecer clases con course_name y student_count
      const augmented: AugmentedClass[] = await Promise.all(
        rawClasses.map(async (cls) => {
          // Contar estudiantes para esta clase
          let studentCount = 0;
          try {
            const { count } = await supabase
              .from("class_students")
              .select("*", { count: "exact", head: true })
              .eq("class_id", cls.id);
            studentCount = count || 0;
          } catch {
            studentCount = 0;
          }

          return {
            ...cls,
            course_name: cls.course_id ? courseMap.get(cls.course_id) : undefined,
            student_count: studentCount,
          };
        })
      );

      setClasses(augmented);
      setCourses(coursesData);
    } catch (e: any) {
      showToast(e.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Toast helper ────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ─── Open create modal ───────────────────────────────────────────────
  function openCreateModal() {
    setFormName("");
    setFormDesc("");
    setFormCourse(courses[0]?.id?.toString() || "");
    setShowCreateModal(true);
  }

  // ─── Open edit modal ─────────────────────────────────────────────────
  function openEditModal(cls: AugmentedClass) {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormDesc(cls.description || "");
    setFormCourse(cls.course_id?.toString() || "");
    setDeletePassword("");
    setDeleteError("");
    setDeleting(false);
    setShowEditModal(true);
  }

  // ─── Create class ────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setFormSaving(true);
    try {
      const input: CreateClassInput = {
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        course_id: formCourse ? Number(formCourse) : undefined,
      };
      await createClass(input);
      setShowCreateModal(false);
      showToast(isEn ? "Class created successfully." : "Clase creada exitosamente.");
      await loadData();
    } catch (e: any) {
      showToast(e.message || (isEn ? "Error creating class." : "Error al crear la clase."));
    } finally {
      setFormSaving(false);
    }
  }

  // ─── Update class ────────────────────────────────────────────────────
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClass || !formName.trim()) return;
    setFormSaving(true);
    try {
      const input: UpdateClassInput = {
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        course_id: formCourse ? Number(formCourse) : undefined,
      };
      await updateClass(editingClass.id, input);
      setShowEditModal(false);
      showToast(isEn ? "Class updated." : "Clase actualizada.");
      await loadData();
    } catch (e: any) {
      showToast(e.message || (isEn ? "Error updating." : "Error al actualizar."));
    } finally {
      setFormSaving(false);
    }
  }

  // ─── Delete class (password-gated via raw fetch) ─────────────────────
  async function handleDelete() {
    if (!editingClass || !deletePassword) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // Verificar contraseña con raw fetch a /auth/v1/token?grant_type=password
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const email = user?.email || "";

      const res = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({ email, password: deletePassword }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          errData?.error_description || errData?.error || errData?.msg || "";
        if (
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("incorrect") ||
          res.status === 400
        ) {
          setDeleteError(
            isEn ? "Incorrect password." : "Contraseña incorrecta."
          );
          setDeleting(false);
          return;
        }
        throw new Error(msg || "Error de verificación");
      }

      // Contraseña válida — eliminar la clase
      await deleteClass(editingClass.id);
      setShowEditModal(false);
      showToast(isEn ? "Class deleted." : "Clase eliminada.");
      await loadData();
    } catch (e: any) {
      setDeleteError(
        e.message || (isEn ? "Error deleting." : "Error al eliminar.")
      );
    } finally {
      setDeleting(false);
    }
  }

  // ─── Navigate to class detail ────────────────────────────────────────
  function goToClass(classId: number) {
    router.push(`${base}/dashboard/clase/${classId}`);
  }

  // ─── Filtered classes ────────────────────────────────────────────────
  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const t = (key: string) =>
    (
      ({
        myClasses: { es: "Mis Clases", en: "My Classes" },
        subtitle: {
          es: "Gestioná tus clases de catequesis.",
          en: "Manage your catechesis classes.",
        },
        newClass: { es: "Nueva Clase", en: "New Class" },
        searchPlaceholder: { es: "Buscar clases…", en: "Search classes…" },
        noClasses: { es: "Sin clases todavía.", en: "No classes yet." },
        noClassesHint: {
          es: "Creá tu primera clase para empezar.",
          en: "Create your first class to get started.",
        },
        loading: { es: "Cargando…", en: "Loading…" },
        students: { es: "estudiantes", en: "students" },
        student_one: { es: "estudiante", en: "student" },
        edit: { es: "Editar", en: "Edit" },
        delete: { es: "Eliminar", en: "Delete" },
        inviteCode: { es: "Código", en: "Code" },
        course: { es: "Curso", en: "Course" },
        createTitle: { es: "Crear Clase", en: "Create Class" },
        editTitle: { es: "Editar Clase", en: "Edit Class" },
        nameLabel: { es: "Nombre de la clase", en: "Class name" },
        namePlaceholder: {
          es: "ej. Primera Comunión 2026",
          en: "e.g. First Communion 2026",
        },
        descLabel: { es: "Descripción", en: "Description" },
        descPlaceholder: {
          es: "Descripción breve de la clase…",
          en: "Brief class description…",
        },
        courseLabel: { es: "Curso", en: "Course" },
        cancel: { es: "Cancelar", en: "Cancel" },
        create: { es: "Crear", en: "Create" },
        save: { es: "Guardar", en: "Save" },
        dangerZone: { es: "Zona de Peligro", en: "Danger Zone" },
        deleteWarning: {
          es: "Esta acción es irreversible. Ingresá tu contraseña para confirmar.",
          en: "This action is irreversible. Enter your password to confirm.",
        },
        passwordLabel: { es: "Tu contraseña", en: "Your password" },
        confirmDelete: { es: "Eliminar clase", en: "Delete class" },
      }) as Record<string, { es: string; en: string }>
    )[key]?.[isEn ? "en" : "es"] || key;

  // ─── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <h1>{t("myClasses")}</h1>
        <div className="db-cards" style={{ marginTop: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="db-card">
              <div
                className="db-skeleton"
                style={{ height: 18, width: "70%" }}
              />
              <div
                className="db-skeleton"
                style={{ height: 14, width: "90%", marginTop: 8 }}
              />
              <div
                className="db-skeleton"
                style={{ height: 14, width: "40%", marginTop: 6 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{t("myClasses")}</h1>
      <p className="db-subtitle">{t("subtitle")}</p>

      {/* ─── ACTIONS BAR ─── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 20,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          className="db-search"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <button className="db-btn primary" onClick={openCreateModal}>
          + {t("newClass")}
        </button>
      </div>

      {/* ─── EMPTY STATE ─── */}
      {!loading && filtered.length === 0 && (
        <div className="db-empty">
          <span className="db-empty-icon">📚</span>
          <p>{t("noClasses")}</p>
          <p style={{ fontSize: 13, color: "var(--color-tertiary)" }}>
            {t("noClassesHint")}
          </p>
          <div className="db-empty-action">
            <button className="db-btn primary" onClick={openCreateModal}>
              + {t("newClass")}
            </button>
          </div>
        </div>
      )}

      {/* ─── CLASS CARDS GRID ─── */}
      {filtered.length > 0 && (
        <div className="db-cards">
          {filtered.map((cls) => {
            const count = cls.student_count || 0;
            const studentLabel =
              count === 1 ? t("student_one") : t("students");
            return (
              <div
                key={cls.id}
                className="db-card"
                onClick={() => goToClass(cls.id)}
              >
                <div className="db-card-title">{cls.name}</div>
                {cls.description && (
                  <div className="db-card-desc">{cls.description}</div>
                )}
                <div className="db-card-meta">
                  <span>
                    👥 {count} {studentLabel}
                  </span>
                  {cls.course_name && <span>📖 {cls.course_name}</span>}
                </div>
                <div className="db-card-footer">
                  <span className="db-badge accent">
                    🔑 {cls.invite_code}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className="db-btn sm ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(cls);
                      }}
                      title={t("edit")}
                    >
                      ✏️
                    </button>
                    <button
                      className="db-btn sm ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(cls);
                      }}
                      title={t("delete")}
                      style={{ color: "var(--color-red)" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         CREATE CLASS MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="db-overlay" onClick={() => setShowCreateModal(false)}>
          <form
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
          >
            <h2>{t("createTitle")}</h2>

            <label>{t("nameLabel")}</label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
            />

            <label>{t("descLabel")}</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder={t("descPlaceholder")}
            />

            <label>{t("courseLabel")}</label>
            <select
              value={formCourse}
              onChange={(e) => setFormCourse(e.target.value)}
            >
              <option value="">—</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="db-modal-actions">
              <button
                type="button"
                className="db-btn"
                onClick={() => setShowCreateModal(false)}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="db-btn primary"
                disabled={formSaving || !formName.trim()}
              >
                {formSaving ? "…" : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         EDIT CLASS MODAL (with password-gated danger zone)
         ═══════════════════════════════════════════════════════════════ */}
      {showEditModal && editingClass && (
        <div className="db-overlay" onClick={() => setShowEditModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            {/* ─── Edit form ─── */}
            <form onSubmit={handleUpdate}>
              <h2>{t("editTitle")}</h2>

              <label>{t("nameLabel")}</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
              />

              <label>{t("descLabel")}</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder={t("descPlaceholder")}
              />

              <label>{t("courseLabel")}</label>
              <select
                value={formCourse}
                onChange={(e) => setFormCourse(e.target.value)}
              >
                <option value="">—</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="db-modal-actions">
                <button
                  type="button"
                  className="db-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="db-btn primary"
                  disabled={formSaving || !formName.trim()}
                >
                  {formSaving ? "…" : t("save")}
                </button>
              </div>
            </form>

            {/* ─── Danger Zone ─── */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid var(--color-border-light)",
              }}
            >
              <h3 style={{ color: "var(--color-red)", marginBottom: 8 }}>
                ⚠️ {t("dangerZone")}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-secondary)",
                  marginBottom: 12,
                }}
              >
                {t("deleteWarning")}
              </p>

              {deleteError && (
                <div className="db-msg bad" style={{ marginBottom: 10 }}>
                  {deleteError}
                </div>
              )}

              <label style={{ color: "var(--color-secondary)" }}>
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                style={{ marginBottom: 10 }}
              />
              <button
                className="db-btn danger"
                onClick={handleDelete}
                disabled={deleting || !deletePassword}
              >
                {deleting ? "…" : t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast && <div className="db-toast">{toast}</div>}
    </div>
  );
}
