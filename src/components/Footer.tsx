"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  return (
    <footer className="site-footer" style={{ borderTop: "1px solid var(--color-border-light)", marginTop: "auto" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--color-tertiary)", margin: 0 }}>
          {isEn ? "Free · Public · Catholic · " : "Gratuito · Público · Católico · "}
          <Link
            href="https://github.com/jadrk040507/catecismo-digital"
            target="_blank"
            style={{ color: "var(--color-secondary)", textDecoration: "none" }}
          >
            GitHub
          </Link>
        </p>
        <p style={{ fontSize: 11, color: "var(--color-tertiary)", marginTop: 4 }}>
          {isEn
            ? "Based on the Catechism of the Catholic Church · Directory for Catechesis (2020)"
            : "Basado en el Catecismo de la Iglesia Católica · Directorio para la Catequesis (2020)"}
        </p>
      </div>
    </footer>
  );
}