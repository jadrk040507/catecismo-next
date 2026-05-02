"use client";

import Link from "next/link";
import Chat from "@/components/Chat";

export default function ChatPage({ lang = "es" }: { lang?: string }) {
  const isEn = lang === "en";
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-soft mb-6 animate-fade-up">
        <Link href={isEn ? "/en" : "/"} className="hover:text-ink transition-colors">{isEn ? "Home" : "Inicio"}</Link>
        <span>/</span>
        <span className="text-ink font-medium">{isEn ? "AI Catechist" : "Catequista Digital"}</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-8 animate-fade-up">
        <span className="text-5xl mb-4 block">🤖✨</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">
          {isEn ? "Digital Catechist" : "Catequista Digital"}
        </h1>
        <p className="text-ink-soft max-w-md mx-auto text-sm">
          {isEn
            ? "Search the Catechism of the Catholic Church instantly. All responses cite exact CCC references."
            : "Busca en el Catecismo de la Iglesia Católica al instante. Todas las respuestas citan referencias exactas del CIC."}
        </p>
      </div>

      {/* Chat */}
      <div className="animate-fade-up stagger-1">
        <Chat lang={lang} />
      </div>

      {/* Info cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up stagger-2">
        {[
          { icon: "📖", title: isEn ? "CCC Sources" : "Fuentes del CIC", desc: isEn ? "All responses cite exact CCC paragraph references." : "Todas las respuestas citan referencias exactas a párrafos del CIC." },
          { icon: "⚡", title: isEn ? "Local Search" : "Búsqueda Local", desc: isEn ? "Instant search. No data sent to external servers." : "Búsqueda instantánea. Sin enviar datos a servidores externos." },
          { icon: "✝️", title: isEn ? "Catholic Focus" : "Enfoque Católico", desc: isEn ? "Designed for Catholic faith formation and doctrinal accuracy." : "Diseñado para formación en la fe católica con precisión doctrinal." },
        ].map((card, i) => (
          <div key={i} className="card-parchment p-5 text-center">
            <span className="text-2xl block mb-2">{card.icon}</span>
            <h3 className="font-serif text-sm font-semibold text-ink mb-1">{card.title}</h3>
            <p className="text-xs text-ink-soft leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-8 flex gap-3 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-up stagger-3">
        <span>⚠️</span>
        <div>
          <h4 className="font-serif text-sm font-semibold text-amber-800 mb-0.5">{isEn ? "Important Note" : "Nota Importante"}</h4>
          <p className="text-xs text-amber-700/80 leading-relaxed">
            {isEn
              ? "This digital catechist is a support tool. Always verify with the official Catechism of the Catholic Church."
              : "Este catequista digital es una herramienta de apoyo. Siempre verifica con el Catecismo oficial."}
          </p>
        </div>
      </div>
    </div>
  );
}
