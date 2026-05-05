"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getMyParishes,
  getParish,
  getParishPrograms,
  getParishUsers,
  getParishStats,
  createProgram,
  inviteParishUser,
  updateParishUserRole,
  removeParishUser,
  type Parish,
  type ParishProgram,
  type ParishUser,
  type ParishStats,
} from "@/lib/parishes";
import {
  Church,
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Mail,
  Shield,
  Trash2,
  UserPlus,
  Settings,
  ChevronRight,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";

type Tab = "overview" | "programs" | "staff" | "settings";

export default function ParishDashboard() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("overview");
  const [parishes, setParishes] = useState<(Parish & { role: string })[]>([]);
  const [selectedParishId, setSelectedParishId] = useState<string | null>(null);
  const [parish, setParish] = useState<Parish | null>(null);
  const [stats, setStats] = useState<ParishStats | null>(null);
  const [programs, setPrograms] = useState<ParishProgram[]>([]);
  const [staff, setStaff] = useState<ParishUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // New program form
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDesc, setNewProgramDesc] = useState("");
  const [newProgramYear, setNewProgramYear] = useState(new Date().getFullYear().toString());
  const [creatingProgram, setCreatingProgram] = useState(false);

  // Invite staff form
  const [showInviteStaff, setShowInviteStaff] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ParishUser["role"]>("catechist");
  const [invitingStaff, setInvitingStaff] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const loadParishes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyParishes();
      setParishes(data);
      if (data.length > 0 && !selectedParishId) {
        setSelectedParishId(data[0].id);
      }
    } catch (e: any) {
      showToast(e.message || "Error loading parishes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParishes();
  }, [loadParishes]);

  const loadParishData = useCallback(async () => {
    if (!selectedParishId) return;
    try {
      const [p, s, progs, users] = await Promise.all([
        getParish(selectedParishId),
        getParishStats(selectedParishId),
        getParishPrograms(selectedParishId),
        getParishUsers(selectedParishId),
      ]);
      setParish(p);
      setStats(s);
      setPrograms(progs);
      setStaff(users);
    } catch (e: any) {
      showToast(e.message || "Error loading parish data.");
    }
  }, [selectedParishId]);

  useEffect(() => {
    if (selectedParishId) loadParishData();
  }, [selectedParishId, loadParishData]);

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedParishId || !newProgramName.trim()) return;
    setCreatingProgram(true);
    try {
      await createProgram(selectedParishId, {
        name: newProgramName.trim(),
        description: newProgramDesc.trim() || undefined,
        year: newProgramYear || undefined,
      });
      showToast(isEn ? "Program created." : "Programa creado.");
      setNewProgramName("");
      setNewProgramDesc("");
      setShowNewProgram(false);
      await loadParishData();
    } catch (e: any) {
      showToast(e.message || "Error creating program.");
    } finally {
      setCreatingProgram(false);
    }
  }

  async function handleInviteStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedParishId || !inviteEmail.trim()) return;
    setInvitingStaff(true);
    try {
      const result = await inviteParishUser(selectedParishId, inviteEmail.trim(), inviteRole);
      if (result.invited) {
        showToast(isEn ? "Invitation sent." : "Invitación enviada.");
      } else {
        showToast(isEn ? "Staff member added." : "Personal agregado.");
      }
      setInviteEmail("");
      setShowInviteStaff(false);
      await loadParishData();
    } catch (e: any) {
      showToast(e.message || "Error inviting staff.");
    } finally {
      setInvitingStaff(false);
    }
  }

  async function handleRemoveStaff(userId: string) {
    if (!confirm(isEn ? "Remove this staff member?" : "¿Remover este miembro?")) return;
    try {
      await removeParishUser(userId);
      showToast(isEn ? "Staff member removed." : "Miembro removido.");
      await loadParishData();
    } catch (e: any) {
      showToast(e.message || "Error removing staff.");
    }
  }

  // ─── i18n ────────────────────────────────────────────────────────────

  const t = (key: string) =>
    (({
      overview: { es: "Resumen", en: "Overview" },
      programs: { es: "Programas", en: "Programs" },
      staff: { es: "Personal", en: "Staff" },
      settings: { es: "Ajustes", en: "Settings" },
      noParishes: { es: "No tienes parroquias registradas.", en: "You don't have any parishes registered." },
      registerParish: { es: "Registrar parroquia", en: "Register parish" },
      selectParish: { es: "Seleccionar parroquia", en: "Select parish" },
      totalStudents: { es: "Estudiantes", en: "Students" },
      totalClasses: { es: "Clases", en: "Classes" },
      activePrograms: { es: "Programas activos", en: "Active programs" },
      totalCatechists: { es: "Catequistas", en: "Catechists" },
      newProgram: { es: "Nuevo programa", en: "New program" },
      programName: { es: "Nombre del programa", en: "Program name" },
      programDesc: { es: "Descripción", en: "Description" },
      programYear: { es: "Año", en: "Year" },
      create: { es: "Crear", en: "Create" },
      cancel: { es: "Cancelar", en: "Cancel" },
      inviteStaff: { es: "Invitar personal", en: "Invite staff" },
      inviteEmail: { es: "Correo electrónico", en: "Email address" },
      role: { es: "Rol", en: "Role" },
      parishAdmin: { es: "Administrador parroquial", en: "Parish admin" },
      dre: { es: "DRE", en: "DRE" },
      catechist: { es: "Catequista", en: "Catechist" },
      volunteer: { es: "Voluntario", en: "Volunteer" },
      invite: { es: "Invitar", en: "Invite" },
      name: { es: "Nombre", en: "Name" },
      email: { es: "Correo", en: "Email" },
      noPrograms: { es: "Sin programas todavía.", en: "No programs yet." },
      noStaff: { es: "Sin personal registrado.", en: "No staff members yet." },
      pastor: { es: "Párroco", en: "Pastor" },
      dreLabel: { es: "DRE", en: "DRE" },
      address: { es: "Dirección", en: "Address" },
      phone: { es: "Teléfono", en: "Phone" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  const tabIcon: Record<Tab, React.ReactNode> = {
    overview: <BarChart3 size={14} aria-hidden="true" />,
    programs: <BookOpen size={14} aria-hidden="true" />,
    staff: <Users size={14} aria-hidden="true" />,
    settings: <Settings size={14} aria-hidden="true" />,
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      parish_admin: "accent",
      dre: "gold",
      catechist: "",
      volunteer: "",
    };
    return map[role] || "";
  };

  // ─── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return <div className="db-empty"><p>{isEn ? "Loading…" : "Cargando…"}</p></div>;
  }

  if (parishes.length === 0) {
    return (
      <div className="db-empty" style={{ padding: 48 }}>
        <Church size={40} style={{ color: "var(--color-secondary)", marginBottom: 16 }} aria-hidden="true" />
        <h2 style={{ marginBottom: 8 }}>{t("noParishes")}</h2>
        <p style={{ color: "var(--color-secondary)", marginBottom: 20, fontSize: 14 }}>
          {isEn ? "Register your parish to start managing your catechesis programs." : "Registra tu parroquia para comenzar a gestionar tus programas de catequesis."}
        </p>
        <button className="db-btn primary" onClick={() => { /* trigger ParishOnboarding */ }}>
          <Church size={14} aria-hidden="true" /> {t("registerParish")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ─── Parish selector ─── */}
      {parishes.length > 1 && (
        <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {parishes.map((p) => (
            <button
              key={p.id}
              className={`db-btn${selectedParishId === p.id ? " primary" : " ghost"}`}
              onClick={() => setSelectedParishId(p.id)}
              style={{ fontSize: 13 }}
            >
              <Church size={13} aria-hidden="true" /> {p.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Parish header ─── */}
      {parish && (
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <Church size={22} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
            {parish.name}
          </h1>
          {parish.address && <p className="db-subtitle">{parish.address}{parish.city ? `, ${parish.city}` : ""}</p>}
        </div>
      )}

      {/* ─── Tabs ─── */}
      <nav className="db-subtabs" role="tablist">
        {(["overview", "programs", "staff", "settings"] as Tab[]).map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => setTab(tb)}
            className={`db-subtab${tab === tb ? " active" : ""}`}
          >
            {tabIcon[tb]} {t(tb)}
          </button>
        ))}
      </nav>

      {/* ═══════ TAB: OVERVIEW ═══════ */}
      {tab === "overview" && stats && (
        <div role="tabpanel" id="panel-overview" style={{ marginTop: 24 }}>
          <div className="db-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            <div className="db-stat-item">
              <div className="db-stat-lbl">{t("totalStudents")}</div>
              <div className="db-stat-val">{stats.totalStudents}</div>
            </div>
            <div className="db-stat-item">
              <div className="db-stat-lbl">{t("totalClasses")}</div>
              <div className="db-stat-val">{stats.totalClasses}</div>
            </div>
            <div className="db-stat-item">
              <div className="db-stat-lbl">{t("activePrograms")}</div>
              <div className="db-stat-val">{stats.activePrograms}</div>
            </div>
            <div className="db-stat-item">
              <div className="db-stat-lbl">{t("totalCatechists")}</div>
              <div className="db-stat-val">{stats.totalCatechists}</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: PROGRAMS ═══════ */}
      {tab === "programs" && (
        <div role="tabpanel" id="panel-programs" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <button className="db-btn primary" onClick={() => setShowNewProgram(true)}>
              <Plus size={14} aria-hidden="true" /> {t("newProgram")}
            </button>
          </div>

          {programs.length === 0 ? (
            <div className="db-empty"><p>{t("noPrograms")}</p></div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {programs.map((p) => (
                <div key={p.id} className="db-card" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="db-card-title">{p.name}</div>
                      {p.description && <div className="db-card-desc">{p.description}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {p.year && <span className="db-badge">{p.year}</span>}
                      <ChevronRight size={16} style={{ color: "var(--color-secondary)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: STAFF ═══════ */}
      {tab === "staff" && (
        <div role="tabpanel" id="panel-staff" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <button className="db-btn primary" onClick={() => setShowInviteStaff(true)}>
              <UserPlus size={14} aria-hidden="true" /> {t("inviteStaff")}
            </button>
          </div>

          {staff.length === 0 ? (
            <div className="db-empty"><p>{t("noStaff")}</p></div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>{t("name")}</th>
                    <th>{t("email")}</th>
                    <th>{t("role")}</th>
                    <th><span className="sr-only">{isEn ? "Remove" : "Remover"}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id}>
                      <td data-label={t("name")} style={{ fontWeight: 500 }}>{s.full_name || "—"}</td>
                      <td data-label={t("email")}>{s.email || "—"}</td>
                      <td data-label={t("role")}>
                        <span className={`db-badge ${roleBadge(s.role)}`}>{t(s.role)}</span>
                      </td>
                      <td data-label="">
                        <button className="db-btn sm danger ghost" onClick={() => handleRemoveStaff(s.id)} aria-label={`Remove ${s.full_name}`}>
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

      {/* ═══════ TAB: SETTINGS ═══════ */}
      {tab === "settings" && parish && (
        <div role="tabpanel" id="panel-settings" style={{ marginTop: 24, maxWidth: 480 }}>
          <div className="db-card" style={{ cursor: "default" }}>
            <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
              <div className="db-stat-lbl">{t("pastor")}</div>
              <div style={{ color: "var(--color-secondary)" }}>{parish.pastor_name || "—"}</div>
            </div>
            <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
              <div className="db-stat-lbl">{t("dreLabel")}</div>
              <div style={{ color: "var(--color-secondary)" }}>{parish.dre_name || "—"}</div>
            </div>
            <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
              <div className="db-stat-lbl">{t("address")}</div>
              <div style={{ color: "var(--color-secondary)" }}>{parish.address || "—"}{parish.city ? `, ${parish.city}` : ""}</div>
            </div>
            <div className="db-stat-item" style={{ border: "none", padding: 0, background: "transparent" }}>
              <div className="db-stat-lbl">{t("phone")}</div>
              <div style={{ color: "var(--color-secondary)" }}>{parish.phone || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ NEW PROGRAM MODAL ═══════ */}
      {showNewProgram && (
        <div className="db-overlay" onClick={() => setShowNewProgram(false)} role="dialog" aria-modal="true" aria-label={t("newProgram")}>
          <form className="db-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateProgram}>
            <h2>{t("newProgram")}</h2>
            <label htmlFor="prog-name">{t("programName")}</label>
            <input id="prog-name" type="text" value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} required />
            <label htmlFor="prog-desc">{t("programDesc")}</label>
            <textarea id="prog-desc" value={newProgramDesc} onChange={(e) => setNewProgramDesc(e.target.value)} />
            <label htmlFor="prog-year">{t("programYear")}</label>
            <input id="prog-year" type="text" value={newProgramYear} onChange={(e) => setNewProgramYear(e.target.value)} placeholder="2026" />
            <div className="db-modal-actions">
              <button type="button" className="db-btn" onClick={() => setShowNewProgram(false)}>{t("cancel")}</button>
              <button type="submit" className="db-btn primary" disabled={creatingProgram || !newProgramName.trim()}>
                {creatingProgram ? "…" : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════ INVITE STAFF MODAL ═══════ */}
      {showInviteStaff && (
        <div className="db-overlay" onClick={() => setShowInviteStaff(false)} role="dialog" aria-modal="true" aria-label={t("inviteStaff")}>
          <form className="db-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleInviteStaff}>
            <h2>{t("inviteStaff")}</h2>
            <label htmlFor="staff-email">{t("inviteEmail")}</label>
            <input id="staff-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="name@parish.org" />
            <label htmlFor="staff-role">{t("role")}</label>
            <select id="staff-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as ParishUser["role"])}>
              <option value="catechist">{t("catechist")}</option>
              <option value="dre">{t("dre")}</option>
              <option value="parish_admin">{t("parishAdmin")}</option>
              <option value="volunteer">{t("volunteer")}</option>
            </select>
            <div className="db-modal-actions">
              <button type="button" className="db-btn" onClick={() => setShowInviteStaff(false)}>{t("cancel")}</button>
              <button type="submit" className="db-btn primary" disabled={invitingStaff || !inviteEmail.trim()}>
                {invitingStaff ? "…" : t("invite")}
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