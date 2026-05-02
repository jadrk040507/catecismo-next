"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: { es: "Inicio", en: "Home" } },
  { href: "/es/credo", label: { es: "Credo", en: "Creed" } },
  { href: "/es/sacramentos", label: { es: "Sacramentos", en: "Sacraments" } },
  { href: "/es/moral", label: { es: "Moral", en: "Moral" } },
  { href: "/es/oracion", label: { es: "Oración", en: "Prayer" } },
  { href: "/es/chat-demo", label: { es: "Catequista", en: "AI Catechist" } },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  function toggleHref() {
    if (pathname === "/") return "/en";
    if (pathname.startsWith("/es/")) return "/en" + pathname.slice(3);
    if (pathname.startsWith("/en/")) return "/es" + pathname.slice(3);
    if (pathname === "/en") return "/";
    return "/en";
  }

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-parchment/85 border-b border-parchment-deeper/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl text-gold-dark font-serif font-bold select-none group-hover:text-gold transition-colors">
              ✝
            </span>
            <span className="font-serif text-lg font-semibold text-ink tracking-tight hidden sm:block">
              {isEn ? "Catechism Project" : "Proyecto Catecismo"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-gold-light/30 text-gold-dark font-semibold"
                      : "text-ink-soft hover:text-ink hover:bg-parchment-dark/50"
                  )}
                >
                  {item.label[lang as keyof typeof item.label]}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-parchment-dark/50 transition-colors"
              aria-label={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language toggle */}
            <Link
              href={toggleHref()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-ink-soft hover:text-ink hover:bg-parchment-dark/50 transition-colors border border-transparent hover:border-parchment-deeper"
            >
              {isEn ? "ES" : "EN"}
            </Link>

            {/* Auth */}
            {isLoggedIn ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-parchment-dark/50 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-gold-light flex items-center justify-center text-xs font-bold text-gold-dark">
                    {initial}
                  </span>
                  <span className="hidden sm:block text-sm text-ink font-medium max-w-[100px] truncate">
                    {user?.full_name || user?.email}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-cream border border-parchment-deeper rounded-xl shadow-elevated py-1.5 z-50">
                    {isAdmin && (
                      <>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-gold-light/20 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          {isEn ? "Dashboard" : "Dashboard"}
                        </Link>
                        <hr className="mx-3 my-1 border-parchment-deeper" />
                      </>
                    )}
                    <Link
                      href={isEn ? "/en/perfil" : "/es/perfil"}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-gold-light/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      {isEn ? "My Progress" : "Mi Progreso"}
                    </Link>
                    <hr className="mx-3 my-1 border-parchment-deeper" />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose hover:bg-rose/5 transition-colors"
                    >
                      <LogOut size={16} />
                      {isEn ? "Log out" : "Cerrar sesión"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={isEn ? "/en/login" : "/login"}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-white hover:bg-gold-dark transition-colors shadow-gold"
              >
                {isEn ? "Login" : "Ingresar"}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-parchment-dark/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-parchment-deeper/60 animate-fade-up">
            {NAV_ITEMS.map((item, i) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors stagger-1",
                    active ? "bg-gold-light/30 text-gold-dark" : "text-ink-soft hover:bg-parchment-dark/30"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
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
