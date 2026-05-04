"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, BookMarked, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ReadAloud from "./ReadAloud";
import { cn } from "@/lib/utils";

interface LessonLayoutProps {
  title: string;
  cic: string;
  scripture: string;
  htmlContent?: string;
  children?: React.ReactNode;
}

/** Map URL section to localized label */
const sectionLabels: Record<string, { es: string; en: string }> = {
  credo: { es: "Credo", en: "Creed" },
  sacramentos: { es: "Sacramentos", en: "Sacraments" },
  sacraments: { es: "Sacramentos", en: "Sacraments" },
  moral: { es: "Moral", en: "Moral" },
  oracion: { es: "Oración", en: "Prayer" },
  prayer: { es: "Oración", en: "Prayer" },
};

/** Map URL section segment back to internal section key */
const urlToSection: Record<string, string> = {
  credo: "credo",
  sacramentos: "sacramentos",
  sacraments: "sacramentos",
  moral: "moral",
  oracion: "oracion",
  prayer: "oracion",
};

/** Map internal section key to URL segment for each language */
const sectionUrlMap: Record<string, { es: string; en: string }> = {
  credo: { es: "credo", en: "credo" },
  sacramentos: { es: "sacramentos", en: "sacraments" },
  moral: { es: "moral", en: "moral" },
  oracion: { es: "oracion", en: "prayer" },
};

function cleanHtml(html: string): string {
  return html
    .replace(/className=/g, "class=")
    .replace(/\n\s*/g, "\n");
}

export default function LessonLayout({
  title,
  cic,
  scripture,
  htmlContent,
  children,
}: LessonLayoutProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";

  const parts = pathname.split("/").filter(Boolean);
  const langPrefix = parts[0] === "en" ? "en" : "es";
  const section = parts[1] || "credo";
  const rawSlug = parts[2] || "";

  const baseSlug = rawSlug.replace(/-(workbook|guide)$/, "");
  const isWorkbook = rawSlug.endsWith("-workbook");
  const isGuide = rawSlug.endsWith("-guide");

  const internalSection = urlToSection[section] || section;
  const sectionLabel = isEn
    ? sectionLabels[section]?.en || section
    : sectionLabels[section]?.es || section;

  const sectionPath = `/${langPrefix}/${section}`;

  // Language toggle URLs
  const switchLangUrl = isEn
    ? `/${sectionUrlMap[internalSection]?.es || section}/${rawSlug}`
    : `/en/${sectionUrlMap[internalSection]?.en || section}/${rawSlug}`;

  // Tab configuration
  const tabs = [
    {
      key: "lesson",
      href: `/${langPrefix}/${section}/${baseSlug}`,
      label: isEn ? "Lesson" : "Lección",
      icon: BookOpen,
      active: !isWorkbook && !isGuide,
    },
    {
      key: "workbook",
      href: `/${langPrefix}/${section}/${baseSlug}-workbook`,
      label: isEn ? "Workbook" : "Cuaderno",
      icon: FileText,
      active: isWorkbook,
    },
    {
      key: "guide",
      href: `/${langPrefix}/${section}/${baseSlug}-guide`,
      label: isEn ? "Guide" : "Guía",
      icon: BookMarked,
      active: isGuide,
    },
  ];

  return (
    <div className="lesson-page">
      {/* ── Breadcrumb ── */}
      <div className="breadcrumb animate-fade-up">
        <Link href={isEn ? "/en" : "/"}>
          {isEn ? "Home" : "Inicio"}
        </Link>
        <span className="sep">/</span>
        <Link href={sectionPath}>
          {sectionLabel}
        </Link>
        <span className="sep">/</span>
        <span className="current">{title}</span>

        {/* Language switcher (right-aligned) */}
        <div style={{ marginLeft: "auto" }}>
          <div className="lang-switcher">
            <Link href={switchLangUrl} className={!isEn ? "active" : ""}>ES</Link>
            <Link href={switchLangUrl} className={isEn ? "active" : ""}>EN</Link>
          </div>
        </div>
      </div>

      {/* ── Lesson Header ── */}
      <div className="lesson-header animate-fade-up">
        <h1>{title}</h1>

        {/* Metadata badges */}
        <div className="lesson-meta">
          {cic && (
            <span className="lesson-badge">
              <BookOpen size={13} style={{ color: "var(--color-accent)" }} />
              {cic}
            </span>
          )}
          {scripture && (
            <span className="lesson-badge lesson-badge-green">
              <BookMarked size={13} />
              {scripture}
            </span>
          )}
          <span className="lesson-badge">
            <Clock size={13} />
            ~5 min
          </span>
        </div>
      </div>

      {/* ── Tab Row ── */}
      <div className="lesson-tabs animate-fade-up">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn("lesson-tab", tab.active && "active")}
            >
              <Icon size={14} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ── TTS Player ── */}
      {htmlContent && (
        <div className="animate-fade-up" style={{ marginBottom: 24 }}>
          <ReadAloud htmlContent={htmlContent} lang={lang as "es" | "en"} title={title} />
        </div>
      )}

      {/* ── Content Area ── */}
      <article className="prose max-w-none animate-fade-up">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: cleanHtml(htmlContent) }} />
        ) : (
          children
        )}
      </article>

      {/* ── Mark as completed ── */}
      <div className="lesson-progress animate-fade-up">
        <button className="lp-btn">
          <CheckCircle2 size={15} />
          {isEn ? "Mark as completed" : "Marcar como completada"}
        </button>
        <span className="lp-time">~5 min</span>
      </div>

      {/* ── CTA: Sign in to save progress ── */}
      {!isLoggedIn && (
        <div className="login-cta animate-fade-up">
          <p>
            {isEn
              ? "Sign in to track your progress, join a class, and earn achievements."
              : "Inicia sesión para guardar tu progreso, unirte a una clase y ganar logros."}
          </p>
          <Link href={isEn ? "/en/login" : "/login"} className="btn btn-primary btn-sm">
            {isEn ? "Sign in" : "Ingresar"}
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="lesson-nav animate-fade-up">
        <Link href={sectionPath}>
          <ArrowLeft size={14} />
          {isEn ? `Back to ${sectionLabel}` : `Volver a ${sectionLabel}`}
        </Link>
      </div>
    </div>
  );
}