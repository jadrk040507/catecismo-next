"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function DashboardPage() {
  const { isLoggedIn, isAdmin, user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isEn = pathname.startsWith("/en");

  const [stats, setStats] = useState({ users: 0, completed: 0, active: 0, avgQuiz: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const t = isEn ? {
    title: "Dashboard", denied: "Access denied. Admin only.", loginPrompt: "Please log in.", loginLink: "Login",
    homeLink: "Home", statsUsers: "Users", statsCompleted: "Completed", statsActive: "Active Today",
    statsAvgQuiz: "Avg Quiz", usersTitle: "Users", search: "Search…", colName: "Name", colEmail: "Email",
    colRole: "Role", colCompleted: "Completed", colLastActive: "Last Active", promote: "Promote to Admin",
    noUsers: "No users.", lessonsTitle: "Lesson Stats", colLesson: "Lesson", colCompletions: "Completions",
    colAvgQuizScore: "Avg Quiz", colAvgTime: "Avg Time", noLessons: "No data.", loading: "Loading…",
    promoteSuccess: "Promoted!", promoteError: "Error.", homeButton: "Back to Home",
  } : {
    title: "Dashboard", denied: "Acceso denegado. Solo administradores.", loginPrompt: "Inicia sesión.", loginLink: "Iniciar sesión",
    homeLink: "Volver al inicio", statsUsers: "Usuarios", statsCompleted: "Completadas", statsActive: "Activos Hoy",
    statsAvgQuiz: "Promedio Quiz", usersTitle: "Usuarios", search: "Buscar…", colName: "Nombre", colEmail: "Email",
    colRole: "Rol", colCompleted: "Completadas", colLastActive: "Última", promote: "Promover a Admin",
    noUsers: "Sin usuarios.", lessonsTitle: "Estadísticas", colLesson: "Lección", colCompletions: "Completadas",
    colAvgQuizScore: "Quiz Prom.", colAvgTime: "Tiempo", noLessons: "Sin datos.", loading: "Cargando…",
    promoteSuccess: "¡Promovido!", promoteError: "Error.", homeButton: "Volver al Inicio",
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      if (!isLoggedIn) router.push(isEn ? "/en/login" : "/login");
      setLoading(false);
      return;
    }
    if (!authLoading && isAdmin) loadData();
  }, [authLoading, isAdmin]);

  async function loadData() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (profiles) {
        setUsers(profiles);
        const today = new Date().toISOString().split("T")[0];
        const active = profiles.filter((p: any) => p.last_active?.startsWith(today)).length;
        setStats({
          users: profiles.length,
          completed: profiles.reduce((sum: number, p: any) => sum + (p.lessons_completed || 0), 0),
          active,
          avgQuiz: 0,
        });
      }

      const { data: lessonData } = await supabase.from("lesson_stats").select("*").order("completions", { ascending: false });
      if (lessonData) setLessons(lessonData);
    } catch {} finally { setLoading(false); }
  }

  async function promoteUser(userId: string) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
      await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
      setMessage(t.promoteSuccess);
      setTimeout(() => setMessage(""), 3000);
      loadData();
    } catch { setMessage(t.promoteError); }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-ink mb-4">{t.title}</h1>
        <p className="text-ink-soft mb-4">{t.denied}</p>
        <Link href={isEn ? "/en/login" : "/login"} className="text-clay hover:text-gold-dark font-medium">{t.loginLink}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-6">{t.title}</h1>

      {message && <div className="mb-4 p-3 rounded-lg bg-sage/10 border border-sage/20 text-sage text-sm">{message}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { v: stats.users, l: t.statsUsers },
          { v: stats.completed, l: t.statsCompleted },
          { v: stats.active, l: t.statsActive },
          { v: stats.avgQuiz + "%", l: t.statsAvgQuiz },
        ].map((s, i) => (
          <div key={i} className="card-parchment p-4 text-center">
            <div className="font-serif text-2xl font-bold text-gold-dark">{s.v}</div>
            <div className="text-xs text-ink-soft mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="card-parchment p-4 sm:p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">{t.usersTitle}</h2>
        <input placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm mb-4 px-4 py-2 rounded-lg border border-parchment-deeper bg-cream text-sm focus:outline-none focus:border-gold" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-ink-soft uppercase tracking-wider border-b border-parchment-deeper">
              <th className="pb-2 pr-3">{t.colName}</th><th className="pb-2 pr-3">{t.colEmail}</th><th className="pb-2 pr-3">{t.colRole}</th><th className="pb-2 pr-3">{t.colCompleted}</th><th className="pb-2 pr-3">{t.colLastActive}</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>
              {users.filter(u => (u.full_name + u.email).toLowerCase().includes(search.toLowerCase())).map(u => (
                <tr key={u.id} className="border-b border-parchment-deeper/50">
                  <td className="py-2.5 pr-3 font-medium">{u.full_name || "—"}</td>
                  <td className="py-2.5 pr-3 text-ink-soft text-xs">{u.email}</td>
                  <td className="py-2.5 pr-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-gold-light/30 text-gold-dark">{u.role || "user"}</span></td>
                  <td className="py-2.5 pr-3">{u.lessons_completed || 0}</td>
                  <td className="py-2.5 pr-3 text-xs text-ink-soft">{u.last_active?.split("T")[0] || "—"}</td>
                  <td className="py-2.5">
                    {u.role !== "admin" && u.role !== "super_admin" && (
                      <button onClick={() => promoteUser(u.id)} className="text-xs px-3 py-1 rounded-lg bg-gold-light/30 text-gold-dark hover:bg-gold/20 transition-colors">{t.promote}</button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-ink-soft text-sm">{t.noUsers}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lessons */}
      <div className="card-parchment p-4 sm:p-6">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">{t.lessonsTitle}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-ink-soft uppercase tracking-wider border-b border-parchment-deeper">
              <th className="pb-2 pr-3">{t.colLesson}</th><th className="pb-2 pr-3">{t.colCompletions}</th><th className="pb-2 pr-3">{t.colAvgQuizScore}</th><th className="pb-2">{t.colAvgTime}</th>
            </tr></thead>
            <tbody>
              {lessons.slice(0, 10).map(l => (
                <tr key={l.id || l.title} className="border-b border-parchment-deeper/50">
                  <td className="py-2.5 pr-3 font-medium">{l.title || l.lesson_name || "—"}</td>
                  <td className="py-2.5 pr-3">{l.completions || 0}</td>
                  <td className="py-2.5 pr-3">{l.avg_quiz_score || "—"}</td>
                  <td className="py-2.5 text-xs text-ink-soft">{l.avg_time || "—"}</td>
                </tr>
              ))}
              {lessons.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-ink-soft text-sm">{t.noLessons}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href={isEn ? "/en" : "/"} className="text-sm text-ink-soft hover:text-ink transition-colors">← {t.homeButton}</Link>
      </div>
    </div>
  );
}
