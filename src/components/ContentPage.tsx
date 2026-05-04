"use client";

import { usePathname } from "next/navigation";

export default function ContentPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  return (
    <div>
      <h1>{isEn ? "Content" : "Contenido"}</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
        {isEn ? "Manage lessons, workbooks, and guides." : "Gestiona las lecciones, workbooks y guías."}
      </p>
      <div className="db-empty" style={{ marginTop: 40 }}>
        <p>📚</p>
        <p>{isEn ? "Content management coming soon." : "Gestión de contenido próximamente."}</p>
      </div>
    </div>
  );
}
