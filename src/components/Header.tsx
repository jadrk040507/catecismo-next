"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: { es: "Inicio", en: "Home" } },
  { href: "/es/credo", label: { es: "Credo", en: "Creed" } },
  { href: "/es/sacramentos", label: { es: "Sacramentos", en: "Sacraments" } },
  { href: "/es/moral", label: { es: "Moral", en: "Moral" } },
  { href: "/es/oracion", label: { es: "Oración", en: "Prayer" } },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, isCatechist, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";
  const isDashboard = pathname.includes("/dashboard");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleHref() {
    if (pathname === "/") return "/en";
    if (pathname.startsWith("/es/")) return "/en" + pathname.slice(3);
    if (pathname.startsWith("/en/")) return "/es" + pathname.slice(3);
    if (pathname === "/en") return "/";
    return "/en";
  }

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="site-header" style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--color-border-light)",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          {/* Logo */}
          <Link href={isEn ? "/en" : "/"} style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", textDecoration: "none", letterSpacing: "-0.01em" }}>
            Catecismo
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--color-accent)" : "var(--color-secondary)",
                    textDecoration: "none",
                    borderRadius: 5,
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--color-primary)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--color-secondary)"; }}
                >
                  {item.label[lang as keyof typeof item.label]}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Language Switcher */}
            <div className="lang-switcher">
              <Link href={toggleHref()} className={isEn ? "" : "active"}>{lang === "en" ? "ES" : "ES"}</Link>
              <Link href={toggleHref()} className={isEn ? "active" : ""}>{lang === "en" ? "EN" : "EN"}</Link>
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
                  <div className="avatar avatar-sm" style={{ background: "var(--color-accent)" }}>
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
                    borderRadius: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: "4px 0",
                    zIndex: 100,
                  }}>
                    {isCatechist && (
                      <Link
                        href={isEn ? "/en/dashboard" : "/dashboard"}
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href={isEn ? "/en/perfil" : "/es/perfil"}
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-primary)", textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <User size={15} />
                      {isEn ? "My Progress" : "Mi Progreso"}
                    </Link>
                    <div style={{ borderTop: "1px solid var(--color-border-light)", margin: "4px 0" }} />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, color: "var(--color-red)", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
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

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{ padding: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--color-secondary)" }}
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
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block", padding: "12px 16px", fontSize: 14,
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--color-accent)" : "var(--color-secondary)",
                    textDecoration: "none", borderRadius: 5,
                  }}
                >
                  {item.label[lang as keyof typeof item.label]}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}