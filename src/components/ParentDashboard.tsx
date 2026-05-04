"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type Tab = "overview" | "children" | "reports";

const mockChildren = [
  { id: 1, name: "Sofía Martínez", className: "Primera Comunión", progress: 72, streak: 8, avatar: "SM" },
  { id: 2, name: "Mateo Martínez", className: "Catecumenado", progress: 45, streak: 3, avatar: "MM" },
];

const mockEvents = [
  { id: 1, title: "Clase de Sacramentos", date: "May 8" },
  { id: 2, title: "Ensayo Primera Comunión", date: "May 15" },
];

const mockReport = {
  lessonsCompleted: 12,
  quizzesTaken: 8,
  avgScore: 88,
  attendancePct: 92,
};

export default function ParentDashboard() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [tab, setTab] = useState<Tab>("overview");

  const t = (es: string, en: string) => (isEn ? en : es);
  const hasChildren = mockChildren.length > 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("Resumen", "Overview") },
    { key: "children", label: t("Hijos", "Children") },
    { key: "reports", label: t("Informes", "Reports") },
  ];

  return (
    <div className="animate-fade-up">
      <h1>{t("Panel de Padre", "Parent Dashboard")}</h1>
      <p className="db-subtitle">{t("Seguí el progreso de tus hijos en la catequesis", "Track your children's catechesis progress")}</p>

      <div className="db-subtabs">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            className={`db-subtab${tab === tb.key ? " active" : ""}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="db-stat-row">
            <div className="db-stat-item">
              <div className="db-stat-val">{mockChildren.length}</div>
              <div className="db-stat-lbl">{t("Hijos inscriptos", "Children Enrolled")}</div>
            </div>
            <div className="db-stat-item">
              <div className="db-stat-val">{mockReport.attendancePct}%</div>
              <div className="db-stat-lbl">{t("Asistencia media", "Avg Attendance")}</div>
            </div>
            <div className="db-stat-item">
              <div className="db-stat-val">{mockEvents.length}</div>
              <div className="db-stat-lbl">{t("Eventos próximos", "Upcoming Events")}</div>
            </div>
          </div>

          <h2>{t("Próximos eventos", "Upcoming Events")}</h2>
          {mockEvents.length > 0 ? (
            <div className="db-cards">
              {mockEvents.map((ev) => (
                <div key={ev.id} className="db-card">
                  <div className="db-card-title">{ev.title}</div>
                  <div className="db-card-meta">
                    <span className="db-badge accent">{ev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty">
              <p>{t("Sin eventos próximos", "No upcoming events")}</p>
            </div>
          )}
        </div>
      )}

      {tab === "children" && (
        <div>
          {hasChildren ? (
            <div className="db-cards">
              {mockChildren.map((child) => (
                <div key={child.id} className="db-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div className="avatar avatar-md">{child.avatar}</div>
                    <div>
                      <div className="db-card-title">{child.name}</div>
                      <div className="db-card-desc">{child.className}</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-fill-green"
                      style={{ width: `${child.progress}%` }}
                    />
                  </div>
                  <div className="db-card-footer">
                    <span className="db-badge green">{child.progress}% {t("completado", "complete")}</span>
                    <span className="db-badge gold">🔥 {child.streak} {t("días", "days")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty">
              <span className="db-empty-icon">👨‍👩‍👧</span>
              <p>{t("Sin hijos vinculados todavía", "No children linked yet")}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {t("Pedí a tu catequista que te envíe un enlace de vinculación", "Ask your catechist to send a parent link")}
              </p>
              <div className="db-empty-action">
                <button className="db-btn primary">
                  {t("Vincular hijo", "Link Child")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div>
          {hasChildren ? (
            <>
              <div className="db-stat-row">
                <div className="db-stat-item">
                  <div className="db-stat-val">{mockReport.lessonsCompleted}</div>
                  <div className="db-stat-lbl">{t("Lecciones completadas", "Lessons Completed")}</div>
                </div>
                <div className="db-stat-item">
                  <div className="db-stat-val">{mockReport.quizzesTaken}</div>
                  <div className="db-stat-lbl">{t("Cuestionarios", "Quizzes Taken")}</div>
                </div>
                <div className="db-stat-item">
                  <div className="db-stat-val">{mockReport.avgScore}%</div>
                  <div className="db-stat-lbl">{t("Puntaje promedio", "Avg Score")}</div>
                </div>
              </div>

              <h2>{t("Resumen semanal", "Weekly Summary")}</h2>
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>{t("Hijo", "Child")}</th>
                      <th>{t("Lecciones", "Lessons")}</th>
                      <th>{t("Cuestionarios", "Quizzes")}</th>
                      <th>{t("Asistencia", "Attendance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockChildren.map((child) => (
                      <tr key={child.id}>
                        <td data-label={t("Hijo", "Child")}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="avatar avatar-sm">{child.avatar}</div>
                            {child.name}
                          </div>
                        </td>
                        <td data-label={t("Lecciones", "Lessons")}>{Math.round(child.progress / 10)}</td>
                        <td data-label={t("Cuestionarios", "Quizzes")}>{Math.round(child.progress / 15)}</td>
                        <td data-label={t("Asistencia", "Attendance")}>
                          <span className="db-badge green">{child.streak * 10}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="db-empty">
              <span className="db-empty-icon">📊</span>
              <p>{t("No hay informes disponibles", "No reports available")}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {t("Vinculá tus hijos para ver sus informes", "Link your children to see their reports")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}