"use client";

import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fade-up">
        <h1 className="text-2xl font-bold text-ink mb-4">
          {isEn ? "My Progress" : "Mi Progreso"}
        </h1>
        <p className="text-ink-soft mb-6">
          {isEn ? "Log in to see your progress." : "Inicia sesión para ver tu progreso."}
        </p>
        <Link
          href={isEn ? "/en/login" : "/login"}
          className="inline-flex px-6 py-3 rounded-xl bg-gold text-white font-semibold shadow-gold hover:bg-gold-dark transition-all"
        >
          {isEn ? "Login" : "Ingresar"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-up">
      <div className="card-gold-border p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="w-14 h-14 rounded-full bg-gold-light flex items-center justify-center text-xl font-bold text-gold-dark">
            {(user?.full_name?.[0] || "?").toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {user?.full_name || user?.email}
            </h1>
            <p className="text-sm text-ink-soft">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card-parchment p-6 sm:p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-ink mb-2">
          {isEn ? "Your Progress" : "Tu Progreso"}
        </h2>
        <p className="text-ink-soft mb-6">
          {isEn
            ? "Progress tracking coming soon. Start a lesson to track your journey."
            : "Seguimiento de progreso próximamente. Comienza una lección para registrar tu camino."}
        </p>
        <Link
          href={isEn ? "/en/credo" : "/es/credo"}
          className="inline-flex px-6 py-3 rounded-xl bg-gold text-white font-semibold shadow-gold hover:bg-gold-dark transition-all"
        >
          {isEn ? "Start a Lesson" : "Comenzar una Lección"}
        </Link>
      </div>
    </div>
  );
}
