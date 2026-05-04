"use client";

import { usePathname } from "next/navigation";

export default function ParentDashboard() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  return (
    <div>
      <h1>{isEn ? "My Children" : "Mis Hijos"}</h1>
      <div className="db-empty">
        <p>👨‍👩‍👧</p>
        <p>{isEn ? "No children linked yet." : "Sin hijos vinculados todavía."}</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
          {isEn ? "Ask your catechist to send a parent link." : "Pedí a tu catequista que te envíe un enlace de vinculación."}
        </p>
      </div>
    </div>
  );
}
