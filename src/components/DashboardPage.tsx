"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useUsers,
  useStats,
  useLessonStats,
  usePromoteUser,
  useRealtimeUsers,
  useCreateUser,
  useSuspendUser,
  useResetPassword,
} from "@/hooks/useData";
import CatechistDashboard from "@/components/CatechistDashboard";
import ClassDetail from "@/components/ClassDetail";
import StudentDashboard from "@/components/StudentDashboard";
import ParentDashboard from "@/components/ParentDashboard";
import ParishDashboard from "@/components/ParishDashboard";
import ContentManager from "@/components/ContentManager";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Shield,
  UserCheck,
  GraduationCap,
  Heart,
  Menu,
  Church,
  UserPlus,
  Ban,
  KeyRound,
  AlertTriangle,
} from "lucide-react";

type Tab = "overview" | "users" | "classes" | "content" | "analytics" | "parish" | "settings";

export default function DashboardPage() {
  const { isLoggedIn, isAdmin, isCatechist, isSuperAdmin, isStudent, isParent, isSuspended, user, loading: authLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isEn = pathname.startsWith("/en");
  const base = isEn ? "/en" : "";

  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [suspendedRoles, setSuspendedRoles] = useState<Record<string, string>>({});

  // Toggle body scroll lock when sidebar is open on mobile
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Data hooks
  const { users, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();
  const lessons = useLessonStats();

  const handleChange = useCallback(() => {
    refetchUsers();
    refetchStats();
  }, [refetchUsers, refetchStats]);

  const { promote, pending: promotePending } = usePromoteUser(handleChange);
  const { createUser, pending: createPending } = useCreateUser(handleChange);
  const { suspend, unsuspend, pending: suspendPending } = useSuspendUser(handleChange);
  const { resetPassword, pending: resetPending } = useResetPassword();
  useRealtimeUsers(handleChange);

  const isLoading = statsLoading || usersLoading;

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`${base}/login`);
    }
  }, [authLoading, isLoggedIn, router, base]);

  // Promote handler
  async function handlePromote(userId: string) {
    try {
      await promote(userId);
      showMessage(isEn ? "Promoted!" : "¡Promovido!");
    } catch {
      showMessage(isEn ? "Error." : "Error.", true);
    }
  }

  // Role change (super_admin only)
  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const sb = getSupabase();
      if (!sb) throw new Error("No supabase configured");
      await (sb.from("profiles") as any).update({ role: newRole }).eq("id", userId);
      refetchUsers();
      refetchStats();
      showMessage(isEn ? "Role updated" : "Rol actualizado");
    } catch {
      showMessage(isEn ? "Error" : "Error", true);
    }
  }

  // Delete user (super_admin only) — removes from auth AND profile
  async function handleDeleteUser(userId: string) {
    if (!confirm(isEn ? "Delete this user permanently?" : "¿Eliminar este usuario permanentemente?")) return;
    try {
      const s = getSupabase();
      if (!s) throw new Error("No supabase configured");
      // Remove from related tables first
      await Promise.all([
        (s.from("class_students") as any).delete().eq("student_id", userId),
        (s.from("class_catechists") as any).delete().eq("catechist_id", userId),
        (s.from("lesson_progress") as any).delete().eq("user_id", userId),
        (s.from("parent_child_links") as any).delete().or(`parent_id.eq.${userId},child_id.eq.${userId}`),
      ]);
      // Delete profile
      await (s.from("profiles") as any).delete().eq("id", userId);
      // Delete auth user via admin API
      try {
        const { adminDeleteUser } = await import("@/lib/supabase");
        await adminDeleteUser(userId);
      } catch (e) {
        console.warn("Auth user deletion warning:", e);
      }
      refetchUsers();
      refetchStats();
      showMessage(isEn ? "User deleted" : "Usuario eliminado");
    } catch {
      showMessage(isEn ? "Error deleting" : "Error al eliminar", true);
    }
  }

  function showMessage(text: string, isError = false) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  const filteredUsers = useMemo(
    () => users.filter(u => (u.full_name + u.email).toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const t = (key: string) =>
    (({
      overview: { es: "Vista general", en: "Overview" },
      users: { es: "Usuarios", en: "Users" },
      classes: { es: "Clases", en: "Classes" },
      content: { es: "Contenido", en: "Content" },
      analytics: { es: "Analíticas", en: "Analytics" },
      settings: { es: "Ajustes", en: "Settings" },
      logout: { es: "Cerrar sesión", en: "Log out" },
      main: { es: "Principal", en: "Main" },
      manage: { es: "Gestión", en: "Manage" },
      totalUsers: { es: "Usuarios", en: "Users" },
      catechists: { es: "Catequistas", en: "Catechists" },
      activeToday: { es: "Activos hoy", en: "Active today" },
      completedLessons: { es: "Lecciones completadas", en: "Completed lessons" },
      avgStreak: { es: "Racha prom.", en: "Avg streak" },
      classesCount: { es: "Clases", en: "Classes" },
      studentsEnrolled: { es: "Alumnos", en: "Students" },
      lessonsAssigned: { es: "Lecciones asignadas", en: "Lessons assigned" },
      search: { es: "Buscar…", en: "Search…" },
      name: { es: "Nombre", en: "Name" },
      email: { es: "Email", en: "Email" },
      role: { es: "Rol", en: "Role" },
      completed: { es: "Completadas", en: "Completed" },
      lastActive: { es: "Última actividad", en: "Last active" },
      promote: { es: "Promover", en: "Promote" },
      delete: { es: "Eliminar", en: "Delete" },
      noUsers: { es: "Sin usuarios.", en: "No users." },
      loading: { es: "Cargando…", en: "Loading…" },
      noAccess: { es: "Acceso denegado.", en: "Access denied." },
      goHome: { es: "Volver al sitio", en: "Back to site" },
      superAdmin: { es: "Super Admin", en: "Super Admin" },
      admin: { es: "Admin", en: "Admin" },
      catechist: { es: "Catequista", en: "Catechist" },
      student: { es: "Estudiante", en: "Student" },
      parent: { es: "Padre/Tutor", en: "Parent/Guardian" },
      suspended: { es: "Suspendido", en: "Suspended" },
      myLearning: { es: "Mi Aprendizaje", en: "My Learning" },
      myChildren: { es: "Mis Hijos", en: "My Children" },
      dashboard: { es: "Dashboard", en: "Dashboard" },
      permissions: { es: "Permisos", en: "Permissions" },
      permView: { es: "Ver contenido público", en: "View public content" },
      permLessons: { es: "Lecciones y cuadernos", en: "Lessons & workbooks" },
      permClasses: { es: "Gestionar clases", en: "Manage classes" },
      permUsers: { es: "Gestionar usuarios", en: "Manage users" },
      permAnalytics: { es: "Ver analíticas", en: "View analytics" },
      permAdmin: { es: "Panel de administración", en: "Admin panel" },
      welcomeBack: { es: "Bienvenido de vuelta", en: "Welcome back" },
      parish: { es: "Parroquia", en: "Parish" },
      create: { es: "Crear usuario", en: "Create user" },
      suspend: { es: "Suspender", en: "Suspend" },
      unsuspend: { es: "Reactivar", en: "Reactivate" },
      resetPw: { es: "Reset contraseña", en: "Reset password" },
      resetPwSent: { es: "Email de reset enviado", en: "Reset email sent" },
      suspendedMsg: { es: "Tu cuenta ha sido suspendida. Contacta al administrador.", en: "Your account has been suspended. Contact the administrator." },
      newUser: { es: "Nuevo usuario", en: "New user" },
      emailLbl: { es: "Correo electrónico", en: "Email" },
      nameLbl: { es: "Nombre completo", en: "Full name" },
      passwordLbl: { es: "Contraseña", en: "Password" },
      roleLbl: { es: "Rol", en: "Role" },
      createBtn: { es: "Crear", en: "Create" },
      cancel: { es: "Cancelar", en: "Cancel" },
      userCreated: { es: "Usuario creado", en: "User created" },
      confirmSuspend: { es: "¿Suspender este usuario? Podrá reactivarse después.", en: "Suspend this user? They can be reactivated later." },
      confirmUnsuspend: { es: "¿Reactivar este usuario?", en: "Reactivate this user?" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  // Role badge component
  function RoleBadge({ role }: { role: string }) {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      super_admin: { label: t("superAdmin"), className: "badge badge-red", icon: <Shield size={11} /> },
      admin: { label: t("admin"), className: "badge badge-amber", icon: <Shield size={11} /> },
      catechist: { label: t("catechist"), className: "badge badge-accent", icon: <UserCheck size={11} /> },
      student: { label: t("student"), className: "badge badge-green", icon: <GraduationCap size={11} /> },
      parent: { label: t("parent"), className: "badge badge-neutral", icon: <Heart size={11} /> },
      suspended: { label: t("suspended"), className: "badge badge-red", icon: <Ban size={11} /> },
    };
    const c = config[role] || config.student;
    return <span className={c.className}>{c.icon} {c.label}</span>;
  }

  // ─── Sidebar items by role ─────────────────────────────────────
  const sidebarNavItems = (() => {
    if (isSuperAdmin || isAdmin) {
      return (
        <>
          <div className="db-sidebar-section">{t("main")}</div>
          {(["overview", "analytics"] as Tab[]).map(tn => (
            <button key={tn} className={`db-sidebar-item${tab === tn ? " active" : ""}`} onClick={() => { setTab(tn); setSidebarOpen(false); setSelectedClassId(null); }}>
              <span className="item-icon">{tn === "overview" ? <LayoutDashboard size={16} /> : <BarChart3 size={16} />}</span>{t(tn)}
            </button>
          ))}
          <div className="db-sidebar-section">{t("manage")}</div>
          {(["users", "classes", "content", "parish"] as Tab[]).map(tn => (
            <button key={tn} className={`db-sidebar-item${tab === tn ? " active" : ""}`} onClick={() => { setTab(tn); setSidebarOpen(false); setSelectedClassId(null); }}>
              <span className="item-icon">{tn === "users" ? <Users size={16} /> : tn === "classes" ? <School size={16} /> : tn === "content" ? <BookOpen size={16} /> : <Church size={16} />}</span>{t(tn)}
              {tn === "users" && users.length > 0 && <span className="db-sidebar-badge">{users.length}</span>}
            </button>
          ))}
        </>
      );
    }
    if (isCatechist) {
      return (
        <>
          <div className="db-sidebar-section">{t("main")}</div>
          <button className={`db-sidebar-item${tab === "classes" ? " active" : ""}`} onClick={() => { setTab("classes"); setSidebarOpen(false); setSelectedClassId(null); }}>
            <span className="item-icon"><School size={16} /></span>{t("classes")}
          </button>
        </>
      );
    }
    // Student/parent — no admin sidebar tabs needed, their content is rendered directly
    return null;
  })();

  // ─── Loading state ────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="db-layout">
        <div className="db-main"><div className="db-content"><div className="db-empty"><span className="db-empty-icon">⏳</span><p>{t("loading")}</p></div></div></div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  // ─── Suspended account banner ────────────────────────────────────────
  if (isSuspended) {
    return (
      <div className="db-layout">
        <div className="db-main">
          <div className="db-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 32 }}>
            <AlertTriangle size={48} style={{ color: "var(--color-red)", marginBottom: 16 }} />
            <h1>{t("suspended")}</h1>
            <p style={{ color: "var(--color-secondary)", marginTop: 8, maxWidth: 360 }}>{t("suspendedMsg")}</p>
            <button className="db-btn primary" style={{ marginTop: 24 }} onClick={logout}>
              <LogOut size={14} /> {t("logout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Student view ────────────────────────────────────────────
  if (isStudent && !isCatechist) {
    return (
      <div className="db-layout">
        <div className={`db-sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <nav className={`db-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="db-sidebar-top">
            <Link href={`${base}/dashboard`} className="db-sidebar-logo" onClick={() => setSidebarOpen(false)}>
              <span className="db-sidebar-logo-icon">📖</span>Catecismo
            </Link>
            <div className="db-sidebar-user">
              <div className="db-sidebar-avatar">{(user?.full_name || user?.email || "U")[0].toUpperCase()}</div>
              <div className="db-sidebar-user-info">
                <div className="db-sidebar-user-name">{user?.full_name || user?.email}</div>
                <div className="db-sidebar-user-role"><RoleBadge role={user?.role || "student"} /></div>
              </div>
            </div>
          </div>
          <div className="db-sidebar-nav">
            <div className="db-sidebar-section">{t("main")}</div>
            <Link href={isEn ? "/en" : "/"} className="db-sidebar-item">
              <span className="item-icon"><BookOpen size={16} /></span>{isEn ? "Library" : "Biblioteca"}
            </Link>
          </div>
          <div className="db-sidebar-bottom">
            <Link href={isEn ? "/en" : "/"} className="db-sidebar-item" style={{ fontSize: 12 }}>{t("goHome")}</Link>
            <button className="db-sidebar-bottom-logout" onClick={logout}>
              <span className="item-icon"><LogOut size={14} /></span>{t("logout")}
            </button>
          </div>
        </nav>
        <div className="db-main">
          <div className="db-topbar">
            <button className="db-topbar-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={18} /></button>
            <div style={{ flex: 1 }} />
            <RoleBadge role={user?.role || "student"} />
          </div>
          <div className="db-content">
            <StudentDashboard studentId={user?.email || ""} studentName={user?.full_name || ""} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Parent view ─────────────────────────────────────────────
  if (isParent && !isCatechist) {
    return (
      <div className="db-layout">
        <div className={`db-sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <nav className={`db-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="db-sidebar-top">
            <Link href={`${base}/dashboard`} className="db-sidebar-logo" onClick={() => setSidebarOpen(false)}>
              <span className="db-sidebar-logo-icon">📖</span>Catecismo
            </Link>
            <div className="db-sidebar-user">
              <div className="db-sidebar-avatar">{(user?.full_name || user?.email || "U")[0].toUpperCase()}</div>
              <div className="db-sidebar-user-info">
                <div className="db-sidebar-user-name">{user?.full_name || user?.email}</div>
                <div className="db-sidebar-user-role"><RoleBadge role="parent" /></div>
              </div>
            </div>
          </div>
          <div className="db-sidebar-nav">
            <div className="db-sidebar-section">{t("main")}</div>
            <Link href={isEn ? "/en" : "/"} className="db-sidebar-item">
              <span className="item-icon"><BookOpen size={16} /></span>{isEn ? "Library" : "Biblioteca"}
            </Link>
          </div>
          <div className="db-sidebar-bottom">
            <Link href={isEn ? "/en" : "/"} className="db-sidebar-item" style={{ fontSize: 12 }}>{t("goHome")}</Link>
            <button className="db-sidebar-bottom-logout" onClick={logout}>
              <span className="item-icon"><LogOut size={14} /></span>{t("logout")}
            </button>
          </div>
        </nav>
        <div className="db-main">
          <div className="db-topbar">
            <button className="db-topbar-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={18} /></button>
            <div style={{ flex: 1 }} />
            <RoleBadge role="parent" />
          </div>
          <div className="db-content">
            <ParentDashboard />
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin/Catechist view ────────────────────────────────────
  return (
    <div className="db-layout">
      {/* ─── SIDEBAR OVERLAY ─── */}
      <div className={`db-sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ─── SIDEBAR ─── */}
      <nav className={`db-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="db-sidebar-top">
          <Link href={`${base}/dashboard`} className="db-sidebar-logo" onClick={() => { setTab("overview"); setSidebarOpen(false); setSelectedClassId(null); }}>
            <span className="db-sidebar-logo-icon">📖</span>Catecismo
          </Link>
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">{(user?.full_name || user?.email || "U")[0].toUpperCase()}</div>
            <div className="db-sidebar-user-info">
              <div className="db-sidebar-user-name">{user?.full_name || user?.email}</div>
              <div className="db-sidebar-user-role"><RoleBadge role={user?.role || "catechist"} /></div>
            </div>
          </div>
        </div>

        <div className="db-sidebar-nav">
          {sidebarNavItems}
        </div>

        <div className="db-sidebar-bottom">
          <button className={`db-sidebar-item${tab === "settings" ? " active" : ""}`} onClick={() => { setTab("settings"); setSidebarOpen(false); setSelectedClassId(null); }}>
            <span className="item-icon"><Settings size={16} /></span>{t("settings")}
          </button>
          <Link href={isEn ? "/en" : "/"} className="db-sidebar-item" style={{ fontSize: 12 }}>
            <span className="item-icon"><Home size={14} /></span>{t("goHome")}
          </Link>
          <button className="db-sidebar-bottom-logout" onClick={logout}>
            <span className="item-icon"><LogOut size={14} /></span>{t("logout")}
          </button>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <div className="db-main">
        <div className="db-topbar">
          <button className="db-topbar-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={18} /></button>
          <div style={{ flex: 1 }} />
          <RoleBadge role={user?.role || "catechist"} />
        </div>

        <div className="db-content">
          {message && <div className={`db-msg ${message.toLowerCase().includes("error") ? "bad" : "good"}`}>{message}</div>}

          {/* ─── CLASS DETAIL (overrides tab) ─── */}
          {selectedClassId ? (
            <ClassDetail classId={selectedClassId} onBack={() => setSelectedClassId(null)} />
          ) : (
            <>
              {/* ─── OVERVIEW ─── */}
              {tab === "overview" && (
                <div>
                  <h1>{t("dashboard")}</h1>
                  <p className="db-subtitle">
                    {t("welcomeBack")}, {user?.full_name || user?.email}.
                  </p>

                  {/* Permissions summary */}
                  <div className="db-cards" style={{ marginTop: 24 }}>
                    <div className="db-card" style={{ cursor: "default" }}>
                      <div className="db-card-title">{t("permissions")}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>✅ {t("permView")}</span>
                        <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>✅ {t("permLessons")}</span>
                        {isCatechist && <span style={{ fontSize: 12, color: "var(--color-accent)" }}>✅ {t("permClasses")}</span>}
                        {isAdmin && <span style={{ fontSize: 12, color: "var(--color-accent)" }}>✅ {t("permUsers")}</span>}
                        {isAdmin && <span style={{ fontSize: 12, color: "var(--color-accent)" }}>✅ {t("permAnalytics")}</span>}
                        {isSuperAdmin && <span style={{ fontSize: 12, color: "var(--color-amber)" }}>✅ {t("permAdmin")}</span>}
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="db-stat-row" style={{ marginTop: 16 }}>
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="db-stat-item">
                          <div className="db-skeleton db-skeleton-stat" />
                          <div className="db-skeleton db-skeleton-stat-sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="db-stat-row" style={{ marginTop: 16 }}>
                        <div className="db-stat-item">
                          <div className="db-stat-val">{stats.users}</div>
                          <div className="db-stat-lbl">{t("totalUsers")}</div>
                        </div>
                        <div className="db-stat-item">
                          <div className="db-stat-val">{stats.catechists}</div>
                          <div className="db-stat-lbl">{t("catechists")}</div>
                        </div>
                        <div className="db-stat-item">
                          <div className="db-stat-val">{stats.active}</div>
                          <div className="db-stat-lbl">{t("activeToday")}</div>
                        </div>
                        <div className="db-stat-item">
                          <div className="db-stat-val">{stats.completed}</div>
                          <div className="db-stat-lbl">{t("completedLessons")}</div>
                        </div>
                        <div className="db-stat-item">
                          <div className="db-stat-val">{stats.streakAvg}d</div>
                          <div className="db-stat-lbl">{t("avgStreak")}</div>
                        </div>
                      </div>

                      {/* Quick links */}
                      <div className="db-btn-group" style={{ marginTop: 8 }}>
                        <button className="db-btn primary" onClick={() => setTab("users")}><Users size={14} /> {t("users")}</button>
                        <button className="db-btn" onClick={() => setTab("classes")}><School size={14} /> {t("classes")}</button>
                        <button className="db-btn" onClick={() => setTab("analytics")}><BarChart3 size={14} /> {t("analytics")}</button>
                        <button className="db-btn" onClick={() => setTab("content")}><BookOpen size={14} /> {t("content")}</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── ANALYTICS ─── */}
              {tab === "analytics" && (
                <div>
                  <h1>{t("analytics")}</h1>
                  <p className="db-subtitle">{isEn ? "Key metrics at a glance." : "Métricas clave de un vistazo."}</p>
                  {isLoading ? (
                    <div className="db-stat-row" style={{ marginTop: 24 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="db-stat-item"><div className="db-skeleton db-skeleton-stat" /><div className="db-skeleton db-skeleton-stat-sm" /></div>
                      ))}
                    </div>
                  ) : (
                    <div className="db-stat-row" style={{ marginTop: 24 }}>
                      <div className="db-stat-item"><div className="db-stat-val">{stats.users}</div><div className="db-stat-lbl">{t("totalUsers")}</div></div>
                      <div className="db-stat-item"><div className="db-stat-val">{stats.catechists}</div><div className="db-stat-lbl">{t("catechists")}</div></div>
                      <div className="db-stat-item"><div className="db-stat-val">{stats.streakAvg}d</div><div className="db-stat-lbl">{t("avgStreak")}</div></div>
                      <div className="db-stat-item"><div className="db-stat-val">{stats.completed}</div><div className="db-stat-lbl">{t("completedLessons")}</div></div>
                    </div>
                  )}

                  {lessons.length > 0 && (
                    <>
                      <h2>{t("classesCount")}</h2>
                      <div className="db-table-wrap">
                        <table className="db-table">
                          <thead><tr><th>{isEn ? "Lesson" : "Lección"}</th><th>{isEn ? "Completions" : "Completadas"}</th><th>{isEn ? "Avg Quiz" : "Quiz Prom."}</th><th>{isEn ? "Avg Time" : "Tiempo Prom."}</th></tr></thead>
                          <tbody>
                            {lessons.slice(0, 15).map((l, i) => (
                              <tr key={l.id || i}>
                                <td data-label={isEn ? "Lesson" : "Lección"} style={{ fontWeight: 500 }}>{l.title || l.lesson_name || "—"}</td>
                                <td data-label={isEn ? "Completions" : "Completadas"}>{l.completions || 0}</td>
                                <td data-label={isEn ? "Avg Quiz" : "Quiz Prom."}>{l.avg_quiz_score ? `${l.avg_quiz_score}%` : "—"}</td>
                                <td data-label={isEn ? "Avg Time" : "Tiempo Prom."}>{l.avg_time || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── USERS ─── */}
              {tab === "users" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h1>{t("users")}</h1>
                      <p className="db-subtitle">{users.length} {isEn ? "registered" : "registrados"}</p>
                    </div>
                    {isSuperAdmin && (
                      <button className="db-btn primary" onClick={() => setShowCreateUser(true)}>
                        <UserPlus size={14} /> {t("create")}
                      </button>
                    )}
                  </div>

                  <input className="db-search" placeholder={t("search")} value={search} onChange={e => setSearch(e.target.value)} style={{ marginTop: 16 }} />

                  {usersLoading ? (
                    <div className="db-empty"><span className="db-empty-icon">⏳</span><p>{t("loading")}</p></div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="db-empty"><span className="db-empty-icon">👥</span><p>{t("noUsers")}</p></div>
                  ) : (
                    <div className="db-table-wrap">
                      <table className="db-table">
                        <thead>
                          <tr>
                            <th>{t("name")}</th><th>{t("email")}</th><th>{t("role")}</th>
                            <th>{t("completed")}</th><th>{t("lastActive")}</th><th><span className="sr-only">{isEn ? "Actions" : "Acciones"}</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(u => {
                            const isSuspendedUser = u.role === "suspended";
                            const prevRole = suspendedRoles[u.id] || "user";
                            return (
                            <tr key={u.id} style={isSuspendedUser ? { opacity: 0.6 } : undefined}>
                              <td data-label={t("name")} style={{ fontWeight: 500 }}>
                                {u.full_name || "—"}
                                {isSuspendedUser && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--color-red)" }}>● {t("suspended")}</span>}
                              </td>
                              <td data-label={t("email")}>{u.email}</td>
                              <td data-label={t("role")}>
                                {isSuperAdmin ? (
                                  <select className="db-inline-select" value={u.role} onChange={e => {
                                    const newRole = e.target.value;
                                    if (newRole === "suspended") {
                                      // Save previous role before suspending
                                      setSuspendedRoles(prev => ({ ...prev, [u.id]: u.role }));
                                      handleRoleChange(u.id, "suspended");
                                    } else {
                                      handleRoleChange(u.id, newRole);
                                    }
                                  }} aria-label={t("role")}>
                                    <option value="user">{t("student")}</option>
                                    <option value="catechist">{t("catechist")}</option>
                                    <option value="parent">{t("parent")}</option>
                                    <option value="admin">{t("admin")}</option>
                                    <option value="super_admin">{t("superAdmin")}</option>
                                    <option value="suspended">{t("suspended")}</option>
                                  </select>
                                ) : (
                                  <RoleBadge role={u.role || "user"} />
                                )}
                              </td>
                              <td data-label={t("completed")}>{u.lessons_completed || 0}</td>
                              <td data-label={t("lastActive")}>{u.last_active?.split("T")[0] || "—"}</td>
                              <td data-label="">
                                <div className="db-btn-group" style={{ justifyContent: "flex-end" }}>
                                  {isAdmin && !["admin", "super_admin"].includes(u.role) && !isSuspendedUser && (
                                    <button className="db-btn sm primary" onClick={() => handlePromote(u.id)} disabled={promotePending}>
                                      {t("promote")}
                                    </button>
                                  )}
                                  {isSuperAdmin && !isSuspendedUser && (
                                    <button className="db-btn sm" onClick={() => {
                                      if (confirm(t("confirmSuspend"))) {
                                        setSuspendedRoles(prev => ({ ...prev, [u.id]: u.role }));
                                        suspend(u.id);
                                      }
                                    }} disabled={suspendPending}>
                                      <Ban size={12} /> {t("suspend")}
                                    </button>
                                  )}
                                  {isSuperAdmin && isSuspendedUser && (
                                    <button className="db-btn sm primary" onClick={() => {
                                      if (confirm(t("confirmUnsuspend"))) unsuspend(u.id, prevRole);
                                    }} disabled={suspendPending}>
                                      {t("unsuspend")}
                                    </button>
                                  )}
                                  {isSuperAdmin && (
                                    <button className="db-btn sm ghost" onClick={() => {
                                      resetPassword(u.email).then(() => showMessage(t("resetPwSent"))).catch(() => showMessage("Error", true));
                                    }} disabled={resetPending}>
                                      <KeyRound size={12} /> {t("resetPw")}
                                    </button>
                                  )}
                                  {isSuperAdmin && (
                                    <button className="db-btn sm danger" onClick={() => handleDeleteUser(u.id)}>
                                      {t("delete")}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ─── CLASSES ─── */}
              {tab === "classes" && (
                <CatechistDashboard
                  catechistId={user?.email || "unknown"}
                  catechistName={user?.full_name || "User"}
                  onSelectClass={setSelectedClassId}
                />
              )}

              {/* ─── CONTENT ─── */}
              {tab === "content" && (
                <ContentManager />
              )}

              {/* ─── PARISH ─── */}
              {tab === "parish" && (
                <ParishDashboard />
              )}

              {/* ─── SETTINGS ─── */}
              {tab === "settings" && <SettingsPanel isEn={isEn} user={user} />}
            </>
          )}
        </div>
      </div>

      {/* ─── Create User Modal ─── */}
      {showCreateUser && (
        <CreateUserModal
          isEn={isEn}
          onClose={() => setShowCreateUser(false)}
          onCreated={async (opts) => {
            try {
              await createUser(opts);
              showMessage(isEn ? "User created" : "Usuario creado");
              setShowCreateUser(false);
            } catch (e: any) {
              showMessage(e.message || "Error", true);
            }
          }}
          pending={createPending}
        />
      )}
    </div>
  );
}

// ─── Settings sub-component ──────────────────────────────────────

function SettingsPanel({ isEn, user }: { isEn: boolean; user: { email?: string; full_name?: string } | null }) {
  const [stab, setStab] = useState<"profile" | "password">("profile");
  const [name, setName] = useState(user?.full_name || "");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const sb = getSupabase();

  const t = (k: string) => (({
    settings: { es: "Ajustes", en: "Settings" },
    profile: { es: "Perfil", en: "Profile" },
    password: { es: "Contraseña", en: "Password" },
    displayName: { es: "Nombre", en: "Display name" },
    displayNamePlaceholder: { es: "Tu nombre", en: "Your name" },
    newPassword: { es: "Nueva contraseña", en: "New password" },
    save: { es: "Guardar", en: "Save" },
    updatePw: { es: "Actualizar contraseña", en: "Update password" },
    saved: { es: "Guardado", en: "Saved" },
    pwUpdated: { es: "Contraseña actualizada", en: "Password updated" },
  }) as any)[k]?.[isEn ? "en" : "es"] || k;

  async function saveProfile() {
    if (!sb) { setMsg(isEn ? "Configuration error" : "Error de configuración"); return; }
    setSaving(true);
    try {
      const { data: { user: u } } = await sb.auth.getUser();
      if (u && name) {
        await (sb.from("profiles") as any).update({ full_name: name }).eq("id", u.id);
        await sb.auth.updateUser({ data: { full_name: name } });
      }
      setMsg(t("saved"));
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  }

  async function changePassword() {
    if (!sb) { setMsg(isEn ? "Configuration error" : "Error de configuración"); return; }
    setSaving(true);
    try {
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) throw error;
      setMsg(t("pwUpdated")); setPw("");
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h1>{t("settings")}</h1>
      <div className="db-subtabs" style={{ marginTop: 20 }}>
        <button onClick={() => setStab("profile")} className={`db-subtab${stab === "profile" ? " active" : ""}`}>{t("profile")}</button>
        <button onClick={() => setStab("password")} className={`db-subtab${stab === "password" ? " active" : ""}`}>{t("password")}</button>
      </div>

      {msg && <div className="db-msg good">{msg}</div>}

      {stab === "profile" && (
        <div style={{ maxWidth: 400 }}>
          <label htmlFor="settings-name" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-secondary)", marginBottom: 6 }}>{t("displayName")}</label>
          <input id="settings-name" value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: 14, fontFamily: "var(--font-sans)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)", color: "var(--color-primary)", outline: "none" }}
            placeholder={t("displayNamePlaceholder")} />
          <div style={{ marginTop: 16 }}>
            <button className="db-btn primary" onClick={saveProfile} disabled={saving}>{saving ? "…" : t("save")}</button>
          </div>
        </div>
      )}

      {stab === "password" && (
        <div style={{ maxWidth: 400 }}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: 14, fontFamily: "var(--font-sans)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)", color: "var(--color-primary)", outline: "none", marginTop: 0 }}
            placeholder="••••••••" />
          <div style={{ marginTop: 16 }}>
            <button className="db-btn primary" onClick={changePassword} disabled={saving || pw.length < 6}>{saving ? "…" : t("updatePw")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create User Modal ──────────────────────────────────────────────────────

function CreateUserModal({
  isEn,
  onClose,
  onCreated,
  pending,
}: {
  isEn: boolean;
  onClose: () => void;
  onCreated: (opts: { email: string; password: string; full_name: string; role: string }) => Promise<void>;
  pending: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const t = (k: string) =>
    (({
      newUser: { es: "Nuevo usuario", en: "New user" },
      emailLbl: { es: "Correo electrónico", en: "Email" },
      nameLbl: { es: "Nombre completo", en: "Full name" },
      passwordLbl: { es: "Contraseña", en: "Password" },
      roleLbl: { es: "Rol", en: "Role" },
      student: { es: "Estudiante", en: "Student" },
      catechist: { es: "Catequista", en: "Catechist" },
      parent: { es: "Padre/Tutor", en: "Parent/Guardian" },
      admin: { es: "Admin", en: "Admin" },
      superAdmin: { es: "Super Admin", en: "Super Admin" },
      createBtn: { es: "Crear", en: "Create" },
      cancel: { es: "Cancelar", en: "Cancel" },
    }) as Record<string, { es: string; en: string }>)[k]?.[isEn ? "en" : "es"] || k;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pw || pw.length < 6) {
      setError(isEn ? "Email and password (6+ chars) required" : "Email y contraseña (6+ caracteres) requeridos");
      return;
    }
    setError("");
    onCreated({ email, password: pw, full_name: name || email.split("@")[0], role });
  }

  return (
    <div className="db-overlay" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <h2>{t("newUser")}</h2>
        {error && <div className="db-msg bad">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>{t("emailLbl")}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@example.com" />
          <label>{t("nameLbl")}</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={isEn ? "John Doe" : "Juan Pérez"} />
          <label>{t("passwordLbl")}</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} placeholder="••••••••" />
          <label>{t("roleLbl")}</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">{t("student")}</option>
            <option value="catechist">{t("catechist")}</option>
            <option value="parent">{t("parent")}</option>
            <option value="admin">{t("admin")}</option>
            <option value="super_admin">{t("superAdmin")}</option>
          </select>
          <div className="db-modal-actions">
            <button type="button" className="db-btn" onClick={onClose}>{t("cancel")}</button>
            <button type="submit" className="db-btn primary" disabled={pending}>{pending ? "…" : t("createBtn")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}