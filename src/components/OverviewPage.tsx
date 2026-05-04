"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function OverviewPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [counts, setCounts] = useState({ users: 0, active: 0 });
  const t = (k: string) => ({ title: { es: "Dashboard", en: "Dashboard" }, subtitle: { es: "Panel de administración de Catecismo Digital", en: "Catecismo Digital admin panel" } } as any)[k]?.[isEn ? "en" : "es"] || k;

  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
      .from("profiles").select("id", { count: "exact" }).then(({ count }) => setCounts(c => ({ ...c, users: count || 0 })));
  }, []);

  return (
    <div>
      <h1>{t("title")}</h1>
      <p style={{ fontSize: 13, color: "var(--color-secondary)", marginTop: 4 }}>{t("subtitle")}</p>
      <div className="db-stat-row" style={{ marginTop: 28 }}>
        <div className="db-stat-item"><div className="db-stat-val">{counts.users}</div><div className="db-stat-lbl">{isEn ? "Users" : "Usuarios"}</div></div>
        <div className="db-stat-item"><div className="db-stat-val">{counts.active}</div><div className="db-stat-lbl">{isEn ? "Active today" : "Activos hoy"}</div></div>
      </div>
    </div>
  );
}
