"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SectionIndexProps {
  section: "credo" | "sacramentos" | "moral" | "oracion";
  topics: { slug: string; title: string; cic: string }[];
}

const sectionMeta = {
  credo: { icon: "📖", title: { es: "El Credo", en: "The Creed" }, desc: { es: "Lo que creemos. Diez clases sobre las verdades fundamentales de la fe.", en: "What we believe. Ten lessons on the fundamental truths of faith." }, count: 10 },
  sacramentos: { icon: "🕊", title: { es: "Los Sacramentos", en: "The Sacraments" }, desc: { es: "La vida de la gracia. Diez clases sobre los signos sensibles de la presencia de Dios.", en: "The life of grace. Ten lessons on the sensible signs of God's presence." }, count: 10 },
  moral: { icon: "🔥", title: { es: "La Vida Moral", en: "The Moral Life" }, desc: { es: "Vivir en Cristo. Doce clases sobre la libertad, la conciencia y las virtudes.", en: "Living in Christ. Twelve lessons on freedom, conscience, and virtues." }, count: 12 },
  oracion: { icon: "🙏", title: { es: "La Oración", en: "Prayer" }, desc: { es: "La vida de oración. Cinco clases sobre cómo hablar con Dios.", en: "The life of prayer. Five lessons on how to speak with God." }, count: 5 },
};

const sectionNav = {
  credo: { prev: { href: "/es/oracion", enHref: "/en/prayer", label: { es: "Oración", en: "Prayer" } }, next: { href: "/es/sacramentos", enHref: "/en/sacraments", label: { es: "Sacramentos", en: "Sacraments" } } },
  sacramentos: { prev: { href: "/es/credo", enHref: "/en/credo", label: { es: "Credo", en: "Creed" } }, next: { href: "/es/moral", enHref: "/en/moral", label: { es: "Moral", en: "Moral" } } },
  moral: { prev: { href: "/es/sacramentos", enHref: "/en/sacraments", label: { es: "Sacramentos", en: "Sacraments" } }, next: { href: "/es/oracion", enHref: "/en/prayer", label: { es: "Oración", en: "Prayer" } } },
  oracion: { prev: { href: "/es/moral", enHref: "/en/moral", label: { es: "Moral", en: "Moral" } }, next: { href: "/es/credo", enHref: "/en/credo", label: { es: "Credo", en: "Creed" } } },
};

export default function SectionIndex({ section, topics }: SectionIndexProps) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";
  const meta = sectionMeta[section];
  const nav = sectionNav[section];

  // Language toggle URLs
  const toggleUrl = isEn
    ? `/es/${section === "sacramentos" ? "sacramentos" : section === "oracion" ? "oracion" : section}`
    : `/en/${section === "sacramentos" ? "sacraments" : section === "oracion" ? "prayer" : section}`;

  return (
    <div className="section-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href={isEn ? "/en" : "/"}>{isEn ? "Home" : "Inicio"}</Link>
        <span className="sep">/</span>
        <span className="current">{meta.title[lang]}</span>
        <div style={{ marginLeft: "auto" }}>
          <div className="lang-switcher">
            <Link href={isEn ? `/es/${section}` : `/en/${section === "sacramentos" ? "sacraments" : section === "oracion" ? "prayer" : section}`} className={!isEn ? "active" : ""}>ES</Link>
            <Link href={isEn ? `/en/${section === "sacramentos" ? "sacraments" : section === "oracion" ? "prayer" : section}` : `/en/${section}`} className={isEn ? "active" : ""}>EN</Link>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="section-header">
        <div className="section-header-icon">{meta.icon}</div>
        <h1>{meta.title[lang]}</h1>
        <p>{meta.desc[lang]}</p>
        <div className="section-header-stats">
          <span>📝 {meta.count} {lang === "en" ? "lessons" : "lecciones"}</span>
          <span>🎧 {lang === "en" ? "Audio available" : "Audio disponible"}</span>
          <span>🌐 ES / EN</span>
        </div>
      </div>

      {/* Callout */}
      <div className="callout callout-accent" style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-primary)" }}>
          {lang === "en"
            ? "Each lesson includes doctrinal content, Scripture references, practical examples, reflection questions, and audio."
            : "Cada lección incluye contenido doctrinal, referencias bíblicas, ejemplos prácticos, preguntas de reflexión y audio."}
        </p>
      </div>

      {/* Topic list */}
      <div>
        {topics.map((topic, i) => (
          <Link key={topic.slug} href={`${pathname}/${topic.slug}`} className="topic-row">
            <div className="topic-row-num">{i + 1}</div>
            <div className="topic-row-content">
              <div className="topic-row-title">{topic.title}</div>
              <div className="topic-row-cic">{topic.cic}</div>
            </div>
            <div className="topic-row-meta">
              <span>🔊</span>
              <span>~5 min</span>
            </div>
            <span className="topic-row-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Section navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-border-light)" }}>
        <Link href={isEn ? nav.prev.enHref : nav.prev.href} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, color: "var(--color-secondary)", textDecoration: "none" }}>
          ← {nav.prev.label[lang]}
        </Link>
        <Link href={isEn ? nav.next.enHref : nav.next.href} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, color: "var(--color-secondary)", textDecoration: "none" }}>
          {nav.next.label[lang]} →
        </Link>
      </div>
    </div>
  );
}