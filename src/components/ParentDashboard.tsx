"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  UserPlus,
  BookOpen,
  Award,
  FileText,
  Heart,
  ChevronRight,
  Plus,
  X,
  Flame,
  Cross,
  Calendar,
  Users,
  Sparkles,
  Download,
} from "lucide-react";
import {
  getChildProfiles,
  addChildProfile,
  getChildProgress,
  getDocuments,
  type ChildProfile,
  type ChildProgress,
  type ChildDocument,
} from "@/lib/parents";
import { useAuth } from "@/lib/auth";

type ChildTab = "progress" | "classes" | "sacramental" | "documents";

export default function ParentDashboard() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const { user } = useAuth();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [childTab, setChildTab] = useState<ChildTab>("progress");
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [childDocuments, setChildDocuments] = useState<ChildDocument[]>([]);

  // Add child modal
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDOB, setNewChildDOB] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ─── Load children ──────────────────────────────────────────────
  const loadChildren = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getChildProfiles(user.id);
      setChildren(data);
      // Auto-select first child if none selected
      if (data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    } catch {
      // No children yet
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // ─── Load child detail data ─────────────────────────────────────
  useEffect(() => {
    if (!selectedChild) return;
    async function load() {
      try {
        const [progress, docs] = await Promise.all([
          getChildProgress(selectedChild!.id),
          getDocuments(selectedChild!.id),
        ]);
        setChildProgress(progress);
        setChildDocuments(docs);
      } catch {
        // ignore
      }
    }
    load();
  }, [selectedChild]);

  // ─── Add child handler ──────────────────────────────────────────
  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault();
    if (!newChildName.trim() || !user?.id) return;
    setAddingChild(true);
    try {
      const child = await addChildProfile(user.id, {
        full_name: newChildName.trim(),
        date_of_birth: newChildDOB || undefined,
      });
      setChildren((prev) => [...prev, child]);
      setSelectedChild(child);
      setShowAddChild(false);
      setNewChildName("");
      setNewChildDOB("");
      showToast(isEn ? "Child added!" : "¡Hijo agregado!");
    } catch (e: any) {
      showToast(e.message || (isEn ? "Error adding child." : "Error al agregar hijo."));
    } finally {
      setAddingChild(false);
    }
  }

  // ─── Format age ─────────────────────────────────────────────────
  function getAge(dob: string | null): string {
    if (!dob) return "";
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${age} ${isEn ? (age === 1 ? "year" : "years") : (age === 1 ? "año" : "años")}`;
  }

  // ─── Sacramental status display ─────────────────────────────────
  function sacramentalBadges(status: Record<string, unknown>) {
    const items = [];
    if (status.baptized) items.push({ label: isEn ? "Baptized" : "Bautizado/a", icon: "✝️", color: "accent" });
    if (status.first_communion) items.push({ label: isEn ? "First Communion" : "Primera Comunión", icon: "🍞", color: "gold" });
    if (status.confirmed) items.push({ label: isEn ? "Confirmed" : "Confirmado/a", icon: "🕊️", color: "green" });
    return items;
  }

  // ─── i18n ────────────────────────────────────────────────────────
  const t = (key: string) =>
    (({
      myChildren: { es: "Mis Hijos", en: "My Children" },
      addChild: { es: "Agregar hijo", en: "Add child" },
      progress: { es: "Progreso", en: "Progress" },
      classes: { es: "Clases", en: "Classes" },
      sacramental: { es: "Sacramentos", en: "Sacramental" },
      documents: { es: "Documentos", en: "Documents" },
      selectChild: { es: "Seleccioná un hijo para ver su progreso", en: "Select a child to view their progress" },
      noChildren: { es: "No tenés hijos registrados.", en: "No children registered." },
      noChildrenHint: { es: "Agregá a tus hijos para hacer seguimiento de su catequesis.", en: "Add your children to track their catechesis." },
      childName: { es: "Nombre del hijo/a", en: "Child's name" },
      dateOfBirth: { es: "Fecha de nacimiento", en: "Date of birth" },
      optional: { es: "(opcional)", en: "(optional)" },
      cancel: { es: "Cancelar", en: "Cancel" },
      add: { es: "Agregar", en: "Add" },
      lessons: { es: "Lecciones", en: "Lessons" },
      quizAvg: { es: "Quiz prom.", en: "Quiz avg" },
      streak: { es: "Racha", en: "Streak" },
      noDocuments: { es: "Sin documentos.", en: "No documents." },
      notBaptized: { es: "No bautizado/a", en: "Not baptized" },
      noCommunion: { es: "Sin Primera Comunión", en: "No First Communion" },
      noConfirmation: { es: "Sin Confirmación", en: "No Confirmation" },
      loading: { es: "Cargando…", en: "Loading…" },
      xp: { es: "XP", en: "XP" },
      quizzesTaken: { es: "Quizzes", en: "Quizzes" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <h1>{t("myChildren")}</h1>
        <div className="db-empty"><p>{t("loading")}</p></div>
      </div>
    );
  }

  // ─── No children empty state ────────────────────────────────────
  if (children.length === 0) {
    return (
      <div>
        <h1>{t("myChildren")}</h1>
        <div className="db-empty" style={{ marginTop: 24 }}>
          <span className="db-empty-icon"><Heart size={40} strokeWidth={1.5} /></span>
          <p>{t("noChildren")}</p>
          <p className="db-empty-hint">{t("noChildrenHint")}</p>
          <div className="db-empty-action">
            <button className="db-btn primary" onClick={() => setShowAddChild(true)}>
              <Plus size={15} /> {t("addChild")}
            </button>
          </div>
        </div>
        {showAddChild && renderAddChildModal()}
      </div>
    );
  }

  // ─── Add child modal ────────────────────────────────────────────
  function renderAddChildModal() {
    return (
      <div className="db-overlay" onClick={() => setShowAddChild(false)} role="dialog" aria-modal="true" aria-label={t("addChild")}>
        <form className="db-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAddChild}>
          <h2>{t("addChild")}</h2>
          <label htmlFor="child-name">{t("childName")}</label>
          <input id="child-name" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder={isEn ? "e.g. María García" : "ej. María García"} required />
          <label htmlFor="child-dob">{t("dateOfBirth")} <span style={{ fontWeight: 400, textTransform: "none" }}>{t("optional")}</span></label>
          <input id="child-dob" type="date" value={newChildDOB} onChange={(e) => setNewChildDOB(e.target.value)} />
          <div className="db-modal-actions">
            <button type="button" className="db-btn" onClick={() => setShowAddChild(false)}>{t("cancel")}</button>
            <button type="submit" className="db-btn primary" disabled={addingChild || !newChildName.trim()}>
              <Plus size={14} /> {addingChild ? "…" : t("add")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Child detail view ──────────────────────────────────────────
  function renderChildDetail() {
    if (!selectedChild) {
      return (
        <div className="db-empty" style={{ marginTop: 24 }}>
          <p>{t("selectChild")}</p>
        </div>
      );
    }

    const sacBadges = sacramentalBadges(selectedChild.sacramental_status);

    return (
      <div>
        {/* Selected child header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--radius-md)",
            background: "var(--color-accent-soft)", color: "var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700,
          }}>
            {selectedChild.full_name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)" }}>{selectedChild.full_name}</div>
            <div style={{ fontSize: 12, color: "var(--color-tertiary)" }}>
              {getAge(selectedChild.date_of_birth)}
              {sacBadges.length > 0 && (
                <span style={{ marginLeft: 8 }}>
                  {sacBadges.map((b, i) => (
                    <span key={i} className={`db-badge ${b.color}`} style={{ marginLeft: 4, fontSize: 10 }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="db-subtabs" role="tablist">
          {(["progress", "classes", "sacramental", "documents"] as ChildTab[]).map((tb) => (
            <button
              key={tb}
              role="tab"
              aria-selected={childTab === tb}
              className={`db-subtab${childTab === tb ? " active" : ""}`}
              onClick={() => setChildTab(tb)}
            >
              {tb === "progress" ? <Sparkles size={14} /> : tb === "classes" ? <BookOpen size={14} /> : tb === "sacramental" ? <Cross size={14} /> : <FileText size={14} />}
              {t(tb)}
            </button>
          ))}
        </nav>

        {/* ── Progress ── */}
        {childTab === "progress" && (
          <div style={{ marginTop: 24 }}>
            <div className="db-stat-row">
              <div className="db-stat-item">
                <div className="db-stat-val" style={{ color: "var(--color-accent)" }}>{childProgress?.xp || 0}</div>
                <div className="db-stat-lbl">{t("xp")}</div>
              </div>
              <div className="db-stat-item">
                <div className="db-stat-val" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <Flame size={18} style={{ color: "var(--color-red)" }} /> {childProgress?.streak_days || 0}
                </div>
                <div className="db-stat-lbl">{t("streak")}</div>
              </div>
              <div className="db-stat-item">
                <div className="db-stat-val">{childProgress?.lessons_completed || 0}</div>
                <div className="db-stat-lbl">{t("lessons")}</div>
              </div>
              <div className="db-stat-item">
                <div className="db-stat-val">{childProgress?.avg_quiz_score || 0}%</div>
                <div className="db-stat-lbl">{t("quizAvg")}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Classes ── */}
        {childTab === "classes" && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, color: "var(--color-secondary)" }}>
              {selectedChild.classes_count || 0} {isEn ? "classes" : "clases"}
            </p>
          </div>
        )}

        {/* ── Sacramental ── */}
        {childTab === "sacramental" && (
          <div style={{ marginTop: 24 }}>
            <div className="db-cards">
              <div className="db-card" style={{ cursor: "default" }}>
                <div className="db-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  ✝️ {isEn ? "Baptism" : "Bautismo"}
                </div>
                <div className="db-card-desc">
                  {selectedChild.sacramental_status?.baptized
                    ? `${isEn ? "Baptized" : "Bautizado/a"}${selectedChild.sacramental_status.baptism_date ? ` — ${selectedChild.sacramental_status.baptism_date}` : ""}${selectedChild.sacramental_status.baptism_church ? ` ${isEn ? "at" : "en"} ${selectedChild.sacramental_status.baptism_church}` : ""}`
                    : t("notBaptized")}
                </div>
              </div>
              <div className="db-card" style={{ cursor: "default" }}>
                <div className="db-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  🍞 {isEn ? "First Communion" : "Primera Comunión"}
                </div>
                <div className="db-card-desc">
                  {selectedChild.sacramental_status?.first_communion
                    ? `${isEn ? "Received" : "Recibida"}${selectedChild.sacramental_status.first_communion_date ? ` — ${selectedChild.sacramental_status.first_communion_date}` : ""}`
                    : t("noCommunion")}
                </div>
              </div>
              <div className="db-card" style={{ cursor: "default" }}>
                <div className="db-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  🕊️ {isEn ? "Confirmation" : "Confirmación"}
                </div>
                <div className="db-card-desc">
                  {selectedChild.sacramental_status?.confirmed
                    ? `${isEn ? "Confirmed" : "Confirmado/a"}${selectedChild.sacramental_status.confirmation_date ? ` — ${selectedChild.sacramental_status.confirmation_date}` : ""}`
                    : t("noConfirmation")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {childTab === "documents" && (
          <div style={{ marginTop: 24 }}>
            {childDocuments.length === 0 ? (
              <div className="db-empty">
                <FileText size={32} strokeWidth={1.5} />
                <p>{t("noDocuments")}</p>
              </div>
            ) : (
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Document" : "Documento"}</th>
                      <th>{isEn ? "Type" : "Tipo"}</th>
                      <th>{isEn ? "Date" : "Fecha"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td data-label={isEn ? "Document" : "Documento"} style={{ fontWeight: 500 }}>{doc.title}</td>
                        <td data-label={isEn ? "Type" : "Tipo"}><span className="db-badge">{doc.type}</span></td>
                        <td data-label={isEn ? "Date" : "Fecha"}>{new Date(doc.created_at).toLocaleDateString(isEn ? "en-US" : "es-MX")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1>{t("myChildren")}</h1>
        <button className="db-btn primary" onClick={() => setShowAddChild(true)}>
          <Plus size={14} /> {t("addChild")}
        </button>
      </div>

      {/* Toast */}
      {toast && <div className="db-msg good" style={{ marginTop: 12 }}>{toast}</div>}

      {/* Child selector */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
        {children.map((child) => {
          const isSelected = selectedChild?.id === child.id;
          return (
            <button
              key={child.id}
              onClick={() => { setSelectedChild(child); setChildTab("progress"); }}
              className="db-card"
              style={{
                cursor: "pointer",
                minWidth: 160,
                borderLeft: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                padding: "14px 18px",
                transition: "border-color 0.15s",
              }}
              aria-label={child.full_name}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "var(--radius-sm)",
                  background: isSelected ? "var(--color-accent-soft)" : "var(--color-neutral)",
                  color: isSelected ? "var(--color-accent)" : "var(--color-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700,
                }}>
                  {child.full_name[0].toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>{child.full_name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-tertiary)" }}>{getAge(child.date_of_birth)}</div>
                </div>
              </div>
              {sacramentalBadges(child.sacramental_status).length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {sacramentalBadges(child.sacramental_status).map((b, i) => (
                    <span key={i} style={{ fontSize: 12 }}>{b.icon}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected child detail */}
      {renderChildDetail()}

      {/* Add child modal */}
      {showAddChild && renderAddChildModal()}
    </div>
  );
}