"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Flame,
  BookOpen,
  Trophy,
  Plus,
  Search,
  Users,
  KeyRound,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { joinClassByCode, getClasses, type Clase } from "@/lib/classes";

type Tab = "overview" | "my-classes" | "progress" | "achievements";

const MOCK_BADGES = [
  { id: "flame", icon: "🔥", name: { es: "Racha de 7 días", en: "7-Day Streak" }, earned: true, xp: 50 },
  { id: "book", icon: "📖", name: { es: "5 Lecciones", en: "5 Lessons" }, earned: true, xp: 100 },
  { id: "star", icon: "⭐", name: { es: "Quiz Perfecto", en: "Perfect Quiz" }, earned: true, xp: 75 },
  { id: "cross", icon: "✝️", name: { es: "Devoción Diaria", en: "Daily Devotion" }, earned: false, xp: 200 },
  { id: "dove", icon: "🕊️", name: { es: "Primer Login", en: "First Login" }, earned: true, xp: 25 },
  { id: "candle", icon: "🕯️", name: { es: "Vela de Oración", en: "Prayer Candle" }, earned: false, xp: 150 },
];

export default function StudentDashboard({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [tab, setTab] = useState<Tab>("overview");

  // Join class state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  // Classes from Supabase
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Gamification stats (mock until backend wired)
  const xp = 325;
  const level = 3;
  const streak = 7;
  const lessonsCompleted = 5;
  const weeklyGoal = 5;
  const weeklyDone = 3;
  const xpForNextLevel = 500;

  // ─── Load classes ────────────────────────────────────────────────
  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch {
      // Student may not have classes yet — that's fine
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // ─── Join class handler ──────────────────────────────────────────
  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      await joinClassByCode(joinCode.trim());
      setJoinSuccess(isEn ? "Joined successfully!" : "¡Te uniste exitosamente!");
      setJoinCode("");
      await loadClasses();
    } catch (e: any) {
      setJoinError(e.message || (isEn ? "Invalid code." : "Código inválido."));
    } finally {
      setJoining(false);
    }
  }

  const t = (key: string) =>
    (({
      welcome: { es: "¡Bienvenido!", en: "Welcome!" },
      overview: { es: "Vista general", en: "Overview" },
      myClasses: { es: "Mis Clases", en: "My Classes" },
      progress: { es: "Progreso", en: "Progress" },
      achievements: { es: "Logros", en: "Achievements" },
      xp: { es: "XP", en: "XP" },
      level: { es: "Nivel", en: "Level" },
      streak: { es: "Racha", en: "Streak" },
      lessonsCompleted: { es: "Lecciones", en: "Lessons" },
      weeklyGoal: { es: "Meta semanal", en: "Weekly goal" },
      days: { es: "días", en: "days" },
      joinClass: { es: "Unirse a una clase", en: "Join a class" },
      joinCodePlaceholder: { es: "Código de invitación", en: "Invite code" },
      join: { es: "Unirse", en: "Join" },
      noClasses: { es: "Sin clases todavía.", en: "No classes yet." },
      noClassesHint: { es: "Pedile a tu catequista el código de invitación.", en: "Ask your catechist for the invite code." },
      courseProgress: { es: "Progreso del curso", en: "Course progress" },
      badges: { es: "Insignias", en: "Badges" },
      earned: { es: "Ganada", en: "Earned" },
      locked_: { es: "Bloqueada", en: "Locked" },
      students: { es: "estudiantes", en: "students" },
      loading: { es: "Cargando…", en: "Loading…" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  // ─── Overview ────────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      <h1>{t("welcome")} <span style={{ fontWeight: 400 }}>{studentName}</span></h1>
      <p className="db-subtitle" style={{ marginBottom: 20 }}>
        {isEn ? "Keep going — every lesson brings you closer!" : "¡Seguí así — cada lección te acerca más!"}
      </p>

      <div className="db-stat-row">
        <div className="db-stat-item">
          <div className="db-stat-val" style={{ color: "var(--color-accent)" }}>{xp}</div>
          <div className="db-stat-lbl">{t("xp")}</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val">{level}</div>
          <div className="db-stat-lbl">{t("level")}</div>
          <div className="db-stat-sub">{xp}/{xpForNextLevel} XP</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
            <Flame size={20} style={{ color: "var(--color-red)" }} /> {streak}
          </div>
          <div className="db-stat-lbl">{t("streak")}</div>
          <div className="db-stat-sub">{streak} {t("days")}</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val">{lessonsCompleted}</div>
          <div className="db-stat-lbl">{t("lessonsCompleted")}</div>
        </div>
      </div>

      <h3>{t("weeklyGoal")}</h3>
      <div className="progress-bar" style={{ marginBottom: 6 }}>
        <div className="progress-fill" style={{ width: `${(weeklyDone / weeklyGoal) * 100}%` }} />
      </div>
      <p style={{ fontSize: 12, color: "var(--color-secondary)" }}>
        {weeklyDone}/{weeklyGoal} {isEn ? "lessons this week" : "lecciones esta semana"}
      </p>
    </div>
  );

  // ─── My Classes ────────────────────────────────────────────────
  const renderMyClasses = () => (
    <div>
      <h1>{t("myClasses")}</h1>

      {/* Join Class */}
      <div className="db-card" style={{ cursor: "default", marginTop: 20, marginBottom: 24, borderLeft: "3px solid var(--color-accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <KeyRound size={16} style={{ color: "var(--color-accent)" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{t("joinClass")}</span>
        </div>
        <form className="db-form-row" onSubmit={handleJoinClass}>
          <input
            className="db-search"
            style={{ maxWidth: 240, marginBottom: 0 }}
            placeholder={t("joinCodePlaceholder")}
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); setJoinSuccess(""); }}
            maxLength={7}
            aria-label={t("joinCodePlaceholder")}
          />
          <button className="db-btn primary" type="submit" disabled={joining || !joinCode.trim()}>
            <Plus size={14} /> {joining ? "…" : t("join")}
          </button>
        </form>
        {joinError && <p style={{ color: "var(--color-red)", fontSize: 12, marginTop: 6 }}>{joinError}</p>}
        {joinSuccess && <p style={{ color: "var(--color-green)", fontSize: 12, marginTop: 6 }}>{joinSuccess}</p>}
      </div>

      {/* Class list */}
      {loadingClasses ? (
        <div className="db-empty"><p>{t("loading")}</p></div>
      ) : classes.length === 0 ? (
        <div className="db-empty">
          <span className="db-empty-icon"><BookOpen size={40} strokeWidth={1.5} /></span>
          <p>{t("noClasses")}</p>
          <p className="db-empty-hint">{t("noClassesHint")}</p>
        </div>
      ) : (
        <div className="db-cards">
          {classes.map((cls) => (
            <div key={cls.id} className="db-card" style={{ cursor: "default" }}>
              <div className="db-card-title">{cls.name}</div>
              {cls.description && <div className="db-card-desc">{cls.description}</div>}
              <div className="db-card-footer" style={{ marginTop: 10 }}>
                <span className="db-badge accent" style={{ fontSize: 12 }}>
                  <KeyRound size={11} /> {cls.invite_code}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Achievements ────────────────────────────────────────────────
  const renderAchievements = () => (
    <div>
      <h1>{t("achievements")}</h1>
      <p className="db-subtitle">{t("badges")}</p>
      <div style={{ display: "grid", gap: 12, marginTop: 20, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        {MOCK_BADGES.map((b) => (
          <div key={b.id} className="db-card" style={{ textAlign: "center", padding: "20px 16px", opacity: b.earned ? 1 : 0.45, cursor: b.earned ? "default" : "not-allowed" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>{b.name[isEn ? "en" : "es"]}</div>
            <div className="db-badge accent" style={{ marginTop: 8 }}>+{b.xp} XP</div>
            <div style={{ fontSize: 10, color: "var(--color-tertiary)", marginTop: 4 }}>{b.earned ? t("earned") : t("locked_")}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Progress (placeholder) ─────────────────────────────────────
  const renderProgress = () => (
    <div>
      <h1>{t("progress")}</h1>
      <p className="db-subtitle">{isEn ? "Track your learning journey." : "Seguí tu camino de aprendizaje."}</p>
      <div className="db-empty" style={{ marginTop: 24 }}>
        <BarChart3 size={40} strokeWidth={1.5} />
        <p>{isEn ? "Progress tracking coming soon." : "Seguimiento de progreso próximamente."}</p>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────
  const tabRenderers: Record<Tab, () => React.ReactElement> = {
    overview: renderOverview,
    "my-classes": renderMyClasses,
    progress: renderProgress,
    achievements: renderAchievements,
  };

  const tabIcons: Record<Tab, React.ReactNode> = {
    overview: <Sparkles size={14} />,
    "my-classes": <BookOpen size={14} />,
    progress: <BarChart3 size={14} />,
    achievements: <Trophy size={14} />,
  };

  return (
    <div>
      <div className="db-subtabs">
        {(["overview", "my-classes", "progress", "achievements"] as Tab[]).map((tn) => (
          <button
            key={tn}
            className={`db-subtab${tab === tn ? " active" : ""}`}
            onClick={() => setTab(tn)}
          >
            {tabIcons[tn]} {t(tn)}
          </button>
        ))}
      </div>
      {tabRenderers[tab]()}
    </div>
  );
}