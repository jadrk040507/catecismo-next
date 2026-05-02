"use client";
import Link from "next/link";

const sections = [
  {
    href: "/es/credo",
    enHref: "/en/credo",
    icon: "📖",
    title: { es: "El Credo", en: "The Creed" },
    subtitle: { es: "Lo que creemos", en: "What we believe" },
    color: "from-amber-100/40 to-amber-50/10",
    border: "border-amber-200/60",
  },
  {
    href: "/es/sacramentos",
    enHref: "/en/sacramentos",
    icon: "🕊",
    title: { es: "Sacramentos", en: "Sacraments" },
    subtitle: { es: "La vida de la gracia", en: "The life of grace" },
    color: "from-sky-100/30 to-sky-50/10",
    border: "border-sky-200/50",
  },
  {
    href: "/es/moral",
    enHref: "/en/moral",
    icon: "🔥",
    title: { es: "Moral", en: "Moral Life" },
    subtitle: { es: "Vivir en Cristo", en: "Living in Christ" },
    color: "from-rose-100/30 to-rose-50/10",
    border: "border-rose-200/50",
  },
  {
    href: "/es/oracion",
    enHref: "/en/oracion",
    icon: "🙏",
    title: { es: "Oración", en: "Prayer" },
    subtitle: { es: "La vida de oración", en: "The life of prayer" },
    color: "from-violet-100/30 to-violet-50/10",
    border: "border-violet-200/50",
  },
];

export default function HomePage({ lang }: { lang?: string }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gold-light/20 via-parchment to-parchment-dark/30">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-ink/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <div className="animate-fade-up">
            <span className="inline-block text-5xl sm:text-6xl mb-6 opacity-90">✝</span>
          </div>

          <h1 className="animate-fade-up stagger-1 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-tight mb-6">
            {lang === "en" ? "Catechism Project" : "Proyecto Catecismo"}
          </h1>

          <p className="animate-fade-up stagger-2 max-w-2xl mx-auto text-lg sm:text-xl text-ink-soft leading-relaxed mb-10">
            {lang === "en"
              ? "A living, accessible, and free catechism. Based on the Catechism of the Catholic Church, structured into lessons to learn and relearn — always."
              : "Un catecismo vivo, accesible y gratuito. Basado en el Catecismo de la Iglesia Católica, estructurado en clases para aprender y reaprender siempre."}
          </p>

          <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={lang === "en" ? "/en/credo" : "/es/credo"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold text-white font-semibold text-base shadow-gold hover:bg-gold-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              {lang === "en" ? "Begin →" : "Comenzar →"}
            </Link>
            <Link
              href={lang === "en" ? "/en/chat-demo" : "/es/chat-demo"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-gold-light text-gold-dark font-semibold text-base hover:bg-gold-light/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              🤖 {lang === "en" ? "Ask the Catechist" : "Pregunta al Catequista"}
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto fill-parchment">
            <path d="M0,40 C240,0 480,60 720,30 C960,0 1200,50 1440,20 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Section Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
            {lang === "en" ? "Explore the Catechism" : "Explora el Catecismo"}
          </h2>
          <p className="mt-2 text-ink-soft text-base">
            {lang === "en" ? "Four pillars. One faith." : "Cuatro pilares. Una sola fe."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {sections.map((section, i) => (
            <Link
              key={section.href}
              href={lang === "en" ? section.enHref : section.href}
              className={`
                animate-fade-up group relative overflow-hidden rounded-2xl p-6 sm:p-7
                bg-gradient-to-b ${section.color}
                border ${section.border}
                shadow-card hover:shadow-elevated hover:-translate-y-1
                transition-all duration-300
              `}
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {section.icon}
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink mb-1.5">
                {section.title[lang as keyof typeof section.title] || section.title.es}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {section.subtitle[lang as keyof typeof section.subtitle] || section.subtitle.es}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>{lang === "en" ? "Explore" : "Explorar"}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-parchment-dark/40 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
              {lang === "en" ? "Why this Catechism?" : "¿Por qué este Catecismo?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "📖",
                title: { es: "Fiel al CIC", en: "Faithful to the CCC" },
                desc: {
                  es: "Cada lección cita directamente el Catecismo de la Iglesia Católica con referencias precisas.",
                  en: "Every lesson quotes directly from the Catechism of the Catholic Church with precise references.",
                },
              },
              {
                icon: "🎓",
                title: { es: "Pedagogía probada", en: "Proven Pedagogy" },
                desc: {
                  es: "Estructura pedagógica con gran pregunta, contenido, conexión bíblica y reflexión en cada tema.",
                  en: "Pedagogical structure with big question, content, biblical connection and reflection in every topic.",
                },
              },
              {
                icon: "🌐",
                title: { es: "Bilingüe completo", en: "Fully Bilingual" },
                desc: {
                  es: "Todas las lecciones, workbooks y guías disponibles en español e inglés.",
                  en: "All lessons, workbooks and guides available in both Spanish and English.",
                },
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-fade-up card-parchment p-6 text-center"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-serif text-base font-semibold text-ink mb-2">
                  {feature.title[lang as keyof typeof feature.title] || feature.title.es}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {feature.desc[lang as keyof typeof feature.desc] || feature.desc.es}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center animate-fade-up">
        <div className="card-gold-border p-8 sm:p-10">
          <div className="text-3xl mb-4">🤖</div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-3">
            {lang === "en" ? "Ask the Digital Catechist" : "Pregunta al Catequista Digital"}
          </h2>
          <p className="text-ink-soft mb-6 max-w-lg mx-auto">
            {lang === "en"
              ? "Search the Catechism instantly with our AI catechist. Ask anything about faith, morals, sacraments or spirituality — directly from CCC sources."
              : "Busca en el Catecismo al instante con nuestro catequista digital. Pregunta lo que quieras sobre fe, moral, sacramentos o espiritualidad — directamente del CIC."}
          </p>
          <Link
            href={lang === "en" ? "/en/chat-demo" : "/es/chat-demo"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-semibold shadow-gold hover:bg-gold-dark transition-all duration-300 hover:-translate-y-0.5"
          >
            🤖 {lang === "en" ? "Talk to the Catechist" : "Hablar con el Catequista"}
          </Link>
        </div>
      </section>
    </>
  );
}
