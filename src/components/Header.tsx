"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { hrefEs: "/", hrefEn: "/en", label: { es: "Inicio", en: "Home" } },
  { hrefEs: "/es/credo", hrefEn: "/en/creed", label: { es: "Credo", en: "Creed" } },
  { hrefEs: "/es/sacramentos", hrefEn: "/en/sacraments", label: { es: "Sacramentos", en: "Sacraments" } },
  { hrefEs: "/es/moral", hrefEn: "/en/moral", label: { es: "Moral", en: "Moral" } },
  { hrefEs: "/es/oracion", hrefEn: "/en/prayer", label: { es: "Oración", en: "Prayer" } },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, isCatechist, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function switchLangUrl(targetLang: "es" | "en"): string {
    if (targetLang === "en") {
      if (pathname === "/") return "/en";
      if (pathname.startsWith("/es/")) return "/en" + pathname.slice(3);
      return "/en";
    } else {
      if (pathname === "/en" || pathname === "/en/") return "/";
      if (pathname.startsWith("/en/")) {
        const path = pathname.slice(3);
        const slugMap: Record<string, string> = {
          creed: "credo", sacraments: "sacramentos", prayer: "oracion", moral: "moral",
        };
        const parts = path.split("/").map(p => slugMap[p] || p);
        return "/es/" + parts.join("/");
      }
      return pathname;
    }
  }

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="site-header">
      <nav>
        {/* Logo */}
        <Link
          href={isEn ? "/en" : "/"}
          style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none", letterSpacing: "-0.02em" }}
        >
          Catecismo
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
          {NAV_ITEMS.map((item) => {
            const href = isEn ? item.hrefEn : item.hrefEs;
            const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--color-primary)" : "var(--color-secondary)",
                  textDecoration: "none",
                  borderRadius: 5,
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.background = "var(--color-hover)"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "transparent"; } }}
              >
                {item.label[lang]}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language Switcher */}
          <div className="lang-switcher">
            <Link href={switchLangUrl("es")} className={!isEn ? "active" : ""}>ES</Link>
            <Link href={switchLangUrl("en")} className={isEn ? "active" : ""}>EN</Link>
          </div>

          {/* Auth */}
          {isLoggedIn ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 8px", borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                }}
              >
                <div className="avatar avatar-sm" style={{ background: "var(--color-primary)" }}>
                  {initial}
                </div>
                <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-primary)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.full_name || user?.email}
                </span>
              </button>
              {dropdownOpen && (
                <div style={{
                  position: "absolute", right: 0, marginTop: 8, width: 200,
                  background: "var(--color-surface)", border: "1px solid var(--color-border-light)",
                  borderRadius: 8, boxShadow: "var(--shadow-lg)", padding: "4px 0",
                  zIndex: 100, animation: "fade-up 0.15s var(--ease-out-expo)",
                }}>
                  {isCatechist && (
                    <Link
                      href={isEn ? "/en/dashboard" : "/dashboard"}
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none", borderRadius: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href={isEn ? "/en/dashboard" : "/dashboard"}
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none", borderRadius: 4 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <User size={15} />
                    {isEn ? "My Progress" : "Mi Progreso"}
                  </Link>
                  <div style={{ borderTop: "1px solid var(--color-border-light)", margin: "4px 0" }} />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-red)", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", borderRadius: 4 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-red-soft)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={15} />
                    {isEn ? "Log out" : "Cerrar sesión"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={isEn ? "/en/login" : "/login"}
              className="btn btn-secondary btn-sm"
            >
              {isEn ? "Login" : "Ingresar"}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ padding: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--color-secondary)", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div style={{ paddingBottom: 16, paddingTop: 8, borderTop: "1px solid var(--color-border-light)" }}>
          {NAV_ITEMS.map((item) => {
            const href = isEn ? item.hrefEn : item.hrefEs;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "14px 16px", fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--color-primary)" : "var(--color-secondary)",
                  textDecoration: "none", borderRadius: 5,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {item.label[lang]}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}