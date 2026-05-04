"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Search } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    href: "/es/credo",
    enHref: "/en/credo",
    icon: "📖",
    title: { es: "El Credo", en: "The Creed" },
    desc: { es: "Lo que creemos. Las verdades fundamentales de la fe cristiana.", en: "What we believe. The fundamental truths of the Christian faith." },
    count: 10,
    time: { es: "~50 min", en: "~50 min" },
  },
  {
    href: "/es/sacramentos",
    enHref: "/en/sacraments",
    icon: "🕊",
    title: { es: "Los Sacramentos", en: "The Sacraments" },
    desc: { es: "La vida de la gracia. Los signos sensibles de la presencia de Dios.", en: "The life of grace. The sensible signs of God's presence." },
    count: 10,
    time: { es: "~55 min", en: "~55 min" },
  },
  {
    href: "/es/moral",
    enHref: "/en/moral",
    icon: "🔥",
    title: { es: "La Vida Moral", en: "The Moral Life" },
    desc: { es: "Vivir en Cristo. La libertad, la conciencia y las virtudes.", en: "Living in Christ. Freedom, conscience and virtues." },
    count: 12,
    time: { es: "~65 min", en: "~65 min" },
  },
  {
    href: "/es/oracion",
    enHref: "/en/prayer",
    icon: "🙏",
    title: { es: "La Oración", en: "Prayer" },
    desc: { es: "La vida de oración. Cómo hablar con Dios.", en: "The life of prayer. How to speak with God." },
    count: 5,
    time: { es: "~25 min", en: "~25 min" },
  },
];

const features = [
  {
    icon: "📖",
    title: { es: "Fiel al CIC", en: "Faithful to the CCC" },
    desc: { es: "Cada lección cita directamente el Catecismo de la Iglesia Católica con referencias precisas.", en: "Every lesson quotes directly from the Catechism of the Catholic Church with precise references." },
  },
  {
    icon: "🎧",
    title: { es: "Escucha las lecciones", en: "Listen to lessons" },
    desc: { es: "Todas las lecciones tienen audio integrado para que puedas escuchar mientras estudias.", en: "Every lesson has built-in audio so you can listen while you study." },
  },
  {
    icon: "🌐",
    title: { es: "Bilingüe completo", en: "Fully bilingual" },
    desc: { es: "Todas las lecciones, workbooks y guías disponibles en español e inglés.", en: "All lessons, workbooks and guides available in both Spanish and English." },
  },
];

export default function HomePage({ lang }: { lang?: string }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const actualLang = lang || (pathname.startsWith("/en") ? "en" : "es");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      {/* Hero */}
      <div className="home-hero">
        <h1 className="animate-fade-up">
          {actualLang === "en" ? "Catechism" : "Catecismo"}
        </h1>
        <p className="stagger-1 animate-fade-up">
          {actualLang === "en"
            ? "Catholic formation, free, for everyone. Based on the Catechism of the Catholic Church."
            : "Formación católica, gratuita, para todos. Basado en el Catecismo de la Iglesia Católica."}
        </p>

        {/* Search */}
        <div className="search-box stagger-2 animate-fade-up">
          <span className="search-box-icon">🔍</span>
          <input
            type="text"
            placeholder={actualLang === "en" ? "Search lessons, topics, references…" : "Buscar lecciones, temas, referencias…"}
          />
        </div>

        {/* CTAs */}
        <div className="stagger-3 animate-fade-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={actualLang === "en" ? "/en/credo" : "/es/credo"} className="btn btn-primary">
            {actualLang === "en" ? "Explore lessons" : "Explorar clases"}
          </Link>
          {isLoggedIn && (
            <Link href={actualLang === "en" ? "/en/perfil" : "/es/perfil"} className="btn btn-secondary">
              {actualLang === "en" ? "Continue learning" : "Continuar aprendiendo"}
            </Link>
          )}
        </div>
      </div>

      {/* Topic Grid */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px" }}>
        <div className="stagger-2 animate-fade-up" style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-primary)", letterSpacing: "-0.01em", marginBottom: 8 }}>
            {actualLang === "en" ? "Explore the Catechism" : "Explora el Catecismo"}
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-secondary)" }}>
            {actualLang === "en" ? "Four pillars. One faith." : "Cuatro pilares. Una sola fe."}
          </p>
        </div>
        <div className="topic-grid">
          {sections.map((section, i) => (
            <Link
              key={section.href}
              href={actualLang === "en" ? section.enHref : section.href}
              className="topic-card stagger-3 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className="topic-card-icon">{section.icon}</div>
              <h3>{section.title[actualLang as keyof typeof section.title]}</h3>
              <p>{section.desc[actualLang as keyof typeof section.desc]}</p>
              <div className="topic-card-meta">
                <span>{section.count} {actualLang === "en" ? "lessons" : "lecciones"}</span>
                <span>{section.time[actualLang as keyof typeof section.time]}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border-light)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="feature-section">
          <div className="stagger-3 animate-fade-up" style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-primary)", letterSpacing: "-0.01em" }}>
              {actualLang === "en" ? "Why Catecismo?" : "¿Por qué Catecismo?"}
            </h2>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card stagger-4 animate-fade-up" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                <div className="feature-card-icon">{f.icon}</div>
                <h3>{f.title[actualLang as keyof typeof f.title]}</h3>
                <p>{f.desc[actualLang as keyof typeof f.desc]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login CTA for non-authenticated */}
      {!isLoggedIn && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
          <div className="login-cta">
            <p>
              {actualLang === "en"
                ? "Sign in to track your progress, join a class, and earn achievements."
                : "Inicia sesión para guardar tu progreso, unirte a una clase y ganar logros."}
            </p>
            <Link href={actualLang === "en" ? "/en/login" : "/login"} className="btn btn-primary">
              {actualLang === "en" ? "Sign in" : "Ingresar"}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}