"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AnalyticsPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
      .from("profiles").select("id, role, streak_days").then(({ data }) => {
        const users = data || [];
        setStats({
          total: users.length,
          catechists: users.filter((u: any) => ["catechist", "admin", "super_admin"].includes(u.role)).length,
          streakAvg: Math.round((users.reduce((s: number, u: any) => s + (u.streak_days || 0), 0) / users.length) || 0),
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="db-empty"><p>{isEn ? "Loading…" : "Cargando…"}</p></div>;

  return (
    <div>
      <h1>{isEn ? "Analytics" : "Analíticas"}</h1>
      <p style={{ fontSize: 13, color: "var(--color-secondary)", marginTop: 4 }}>
        {isEn ? "Key metrics at a glance." : "Métricas clave de un vistazo."}
      </p>
      <div className="db-stat-row" style={{ marginTop: 24 }}>
        <div className="db-stat-item"><div className="db-stat-val">{stats.total}</div><div className="db-stat-lbl">{isEn ? "Users" : "Usuarios"}</div></div>
        <div className="db-stat-item"><div className="db-stat-val">{stats.catechists}</div><div className="db-stat-lbl">{isEn ? "Catechists" : "Catequistas"}</div></div>
        <div className="db-stat-item"><div className="db-stat-val">{stats.streakAvg}d</div><div className="db-stat-lbl">{isEn ? "Avg streak" : "Racha prom."}</div></div>
      </div>
    </div>
  );
}
