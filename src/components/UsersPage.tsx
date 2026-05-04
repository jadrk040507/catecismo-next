"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function UsersPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
      .from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="db-empty"><p>{isEn ? "Loading…" : "Cargando…"}</p></div>;

  return (
    <div>
      <h1>{isEn ? "Users" : "Usuarios"}</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 20px" }}>
        {users.length} {isEn ? "registered" : "registrados"}
      </p>
      <div className="db-table-wrap"><table className="db-table">
        <thead><tr><th>{isEn ? "Name" : "Nombre"}</th><th>Email</th><th>{isEn ? "Role" : "Rol"}</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id}><td style={{ fontWeight: 500 }}>{u.full_name || "—"}</td><td>{u.email}</td><td><span className="db-badge">{u.role || "user"}</span></td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
