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

  // Close mobile menu on route change & lock body scroll
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
          style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none", letterSpacing: "-0.02em", display: "flex", alignItems: "center", minHeight: 44 }}
        >
          Catecismo
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const href = isEn ? item.hrefEn : item.hrefEs;
            const active = item.hrefEs === "/"
              ? (pathname === "/" || pathname === "/en" || pathname === "/en/")
              : (pathname === href || pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--color-primary)" : "var(--color-secondary)",
                  textDecoration: "none",
                  borderRadius: 5,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s, background 0.15s",
                  touchAction: "manipulation",
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Language Switcher */}
          <div className="lang-switcher">
            <Link href={switchLangUrl("es")} className={!isEn ? "active" : ""}>ES</Link>
            <Link href={switchLangUrl("en")} className={isEn ? "active" : ""}>EN</Link>
          </div>

          {/* Auth - Desktop */}
          {isLoggedIn ? (
            <div ref={dropdownRef} style={{ position: "relative" }} className="hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 8px", borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer", minHeight: 44, minWidth: 44,
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
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none", borderRadius: 4, minHeight: 44 }}
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
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none", borderRadius: 4, minHeight: 44 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <User size={15} />
                    {isEn ? "My Progress" : "Mi Progreso"}
                  </Link>
                  <div style={{ borderTop: "1px solid var(--color-border-light)", margin: "4px 0" }} />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-red)", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", borderRadius: 4, minHeight: 44 }}
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
              className="btn btn-secondary btn-sm hidden md:inline-flex"
            >
              {isEn ? "Login" : "Ingresar"}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ padding: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--color-secondary)", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)" }}
            aria-label={mobileOpen ? (isEn ? "Close menu" : "Cerrar menú") : (isEn ? "Open menu" : "Abrir menú")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="site-header-mobile-overlay open" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Nav */}
      <div className={`site-header-mobile-nav${mobileOpen ? " open" : ""}`}>
        {NAV_ITEMS.map((item) => {
          const href = isEn ? item.hrefEn : item.hrefEs;
          const active = item.hrefEs === "/"
            ? (pathname === "/" || pathname === "/en" || pathname === "/en/")
            : (pathname === href || pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={active ? "active" : ""}
            >
              {item.label[lang]}
            </Link>
          );
        })}

        {/* Mobile auth section */}
        <div className="site-header-mobile-auth">
          {isLoggedIn ? (
            <>
              <Link
                href={isEn ? "/en/dashboard" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                style={{ color: "var(--color-primary)", background: "var(--color-neutral)" }}
              >
                {isEn ? "My Progress" : "Mi Progreso"}
              </Link>
              {isCatechist && (
                <Link
                  href={isEn ? "/en/dashboard" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "var(--color-accent)", background: "var(--color-accent-soft)", marginTop: 8 }}
                >
                  {isEn ? "Dashboard" : "Panel de Administración"}
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 16px", minHeight: 48, width: "100%",
                  fontSize: 15, fontWeight: 500, color: "var(--color-red)",
                  background: "transparent", border: "1px solid var(--color-red)",
                  borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-sans)",
                  marginTop: 8,
                }}
              >
                <LogOut size={16} />
                {isEn ? "Log out" : "Cerrar sesión"}
              </button>
            </>
          ) : (
            <Link
              href={isEn ? "/en/login" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 48 }}
            >
              {isEn ? "Login" : "Ingresar"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}