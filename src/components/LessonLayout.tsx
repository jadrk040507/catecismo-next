"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonLayoutProps {
  title: string;
  cic: string;
  scripture: string;
  htmlContent?: string;
  children?: React.ReactNode;
}

function cleanHtml(html: string): string {
  return html
    .replace(/className=/g, 'class=')
    .replace(/\n\s*/g, '\n');
}

export default function LessonLayout({ title, cic, scripture, htmlContent, children }: LessonLayoutProps) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const parts = pathname.split("/").filter(Boolean);
  const langPrefix = parts[0] === "en" ? "en" : "es";
  const section = parts[1] || "credo";
  const rawSlug = parts[2] || "";

  const baseSlug = rawSlug.replace(/-(workbook|guide)$/, "");
  const isWorkbook = rawSlug.endsWith("-workbook");
  const isGuide = rawSlug.endsWith("-guide");

  const sectionLabel = isEn
    ? ({ credo: "Creed", sacramentos: "Sacraments", sacraments: "Sacraments", moral: "Moral", oracion: "Prayer", prayer: "Prayer" } as any)[section] || section
    : ({ credo: "Credo", sacramentos: "Sacramentos", moral: "Moral", oracion: "Oración" } as any)[section] || section;

  const sectionPath = `/${langPrefix}/${section}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-sm text-ink-soft mb-6 animate-fade-up flex-wrap">
        <Link href={isEn ? "/en" : "/"} className="hover:text-ink transition-colors">
          {isEn ? "Home" : "Inicio"}
        </Link>
        <span>/</span>
        <Link href={sectionPath} className="hover:text-ink transition-colors">
          {sectionLabel}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-xs">{title}</span>
      </nav>

      <div className="card-gold-border p-6 sm:p-8 mb-8 animate-fade-up">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight mb-4">
          {title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm">
          {cic && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-light/20 text-gold-dark font-medium">
              <BookOpen size={14} />
              {cic}
            </span>
          )}
          {scripture && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage/10 text-sage font-medium">
              <BookMarked size={14} />
              {scripture}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-8 animate-fade-up stagger-1 flex-wrap">
        <Link
          href={`/${langPrefix}/${section}/${baseSlug}`}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            !isWorkbook && !isGuide
              ? "bg-gold text-white shadow-gold"
              : "bg-cream border border-parchment-deeper text-ink-soft hover:border-gold-light hover:text-ink"
          )}
        >
          <BookOpen size={15} />
          {isEn ? "Lesson" : "Lección"}
        </Link>
        <Link
          href={`/${langPrefix}/${section}/${baseSlug}-workbook`}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            isWorkbook
              ? "bg-gold text-white shadow-gold"
              : "bg-cream border border-parchment-deeper text-ink-soft hover:border-gold-light hover:text-ink"
          )}
        >
          <FileText size={15} />
          {isEn ? "Workbook" : "Cuaderno"}
        </Link>
        <Link
          href={`/${langPrefix}/${section}/${baseSlug}-guide`}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            isGuide
              ? "bg-gold text-white shadow-gold"
              : "bg-cream border border-parchment-deeper text-ink-soft hover:border-gold-light hover:text-ink"
          )}
        >
          <FileText size={15} />
          {isEn ? "Guide" : "Guía"}
        </Link>
      </div>

      <article className="prose max-w-none animate-fade-up stagger-2">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: cleanHtml(htmlContent) }} />
        ) : (
          children
        )}
      </article>

      <div className="mt-12 pt-8 border-t border-parchment-deeper animate-fade-up">
        <Link
          href={sectionPath}
          className="inline-flex items-center gap-2 text-ink-soft hover:text-ink font-medium text-sm transition-colors"
        >
          ← {isEn ? `Back to ${sectionLabel}` : `Volver a ${sectionLabel}`}
        </Link>
      </div>
    </div>
  );
}
