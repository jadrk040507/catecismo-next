"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SectionIndexProps {
  section: "credo" | "sacramentos" | "moral" | "oracion";
  topics: { slug: string; title: string; cic: string }[];
}

const sectionMeta = {
  credo: { icon: "📖", title: { es: "El Credo", en: "The Creed" }, desc: { es: "Lo que creemos. Diez clases sobre las verdades fundamentales de la fe.", en: "What we believe. Ten lessons on the fundamental truths of the faith." } },
  sacramentos: { icon: "🕊", title: { es: "Los Sacramentos", en: "The Sacraments" }, desc: { es: "La vida de la gracia. Diez clases sobre los signos sensibles de la presencia de Dios.", en: "The life of grace. Ten lessons on the sensible signs of God's presence." } },
  moral: { icon: "🔥", title: { es: "La Vida Moral", en: "The Moral Life" }, desc: { es: "Vivir en Cristo. Doce clases sobre la libertad, la conciencia y las virtudes.", en: "Living in Christ. Twelve lessons on freedom, conscience and virtues." } },
  oracion: { icon: "🙏", title: { es: "La Oración", en: "Prayer" }, desc: { es: "La vida de oración. Cinco clases sobre cómo hablar con Dios.", en: "The life of prayer. Five lessons on how to speak with God." } },
};

export default function SectionIndex({ section, topics }: SectionIndexProps) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const meta = sectionMeta[section];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-soft mb-6 animate-fade-up">
        <Link href={isEn ? "/en" : "/"} className="hover:text-ink transition-colors">
          {isEn ? "Home" : "Inicio"}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{meta.title[isEn ? "en" : "es"]}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12 animate-fade-up">
        <span className="text-5xl mb-4 block">{meta.icon}</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-3">
          {meta.title[isEn ? "en" : "es"]}
        </h1>
        <p className="text-ink-soft max-w-xl mx-auto">
          {meta.desc[isEn ? "en" : "es"]}
        </p>
      </div>

      {/* Topic Cards */}
      <div className="space-y-4">
        {topics.map((topic, i) => (
          <Link
            key={topic.slug}
            href={`${pathname}/${topic.slug}`}
            className="animate-fade-up block card-parchment p-5 sm:p-6 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 group"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl sm:text-3xl w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-light/30 flex items-center justify-center font-serif font-bold text-gold-dark shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-ink mb-1 group-hover:text-gold-dark transition-colors">
                  {topic.title}
                </h2>
                <span className="text-xs text-ink-soft font-medium">{topic.cic}</span>
              </div>
              <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
