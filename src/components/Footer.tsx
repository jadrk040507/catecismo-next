"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  return (
    <footer className="border-t border-parchment-deeper/60 bg-parchment-dark/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <p className="text-sm text-ink-soft">
              {isEn ? "Free · Public · Catholic · " : "Gratuito · Público · Católico · "}
              <Link
                href={isEn ? "https://github.com/jadrk040507/catecismo-digital" : "https://github.com/jadrk040507/catecismo-digital"}
                target="_blank"
                className="text-clay hover:text-gold-dark underline underline-offset-2 transition-colors"
              >
                GitHub
              </Link>
            </p>
            <p className="text-xs text-ink-soft/70 mt-1.5">
              {isEn
                ? "Based on the Catechism of the Catholic Church · Directory for Catechesis (2020)"
                : "Basado en el Catecismo de la Iglesia Católica · Directorio para la Catequesis (2020)"}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-ink-soft">
            <Link href={isEn ? "/en/credo" : "/es/credo"} className="hover:text-ink transition-colors">
              {isEn ? "Creed" : "Credo"}
            </Link>
            <span className="text-parchment-deeper">·</span>
            <Link href={isEn ? "/en/sacramentos" : "/es/sacramentos"} className="hover:text-ink transition-colors">
              {isEn ? "Sacraments" : "Sacramentos"}
            </Link>
            <span className="text-parchment-deeper">·</span>
            <Link href={isEn ? "/en/moral" : "/es/moral"} className="hover:text-ink transition-colors">
              {isEn ? "Moral" : "Moral"}
            </Link>
            <span className="text-parchment-deeper">·</span>
            <Link href={isEn ? "/en/oracion" : "/es/oracion"} className="hover:text-ink transition-colors">
              {isEn ? "Prayer" : "Oración"}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="golden-rule">
            <span className="golden-rule-icon">✝</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
