"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginPage({ lang = "es" }: { lang?: string }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = lang === "en" ? {
    title: "Login",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    loading: "Signing in...",
    noAccount: "Don't have an account?",
    register: "Create one",
    back: "Back to home",
  } : {
    title: "Iniciar Sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    submit: "Ingresar",
    loading: "Ingresando...",
    noAccount: "¿No tienes cuenta?",
    register: "Crea una",
    back: "Volver al inicio",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(lang === "en" ? "/en" : "/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="card-gold-border p-8 animate-fade-up">
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">✝</span>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-parchment-deeper bg-cream text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-parchment-deeper bg-cream text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold text-white font-semibold shadow-gold hover:bg-gold-dark transition-all duration-300 disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {t.noAccount}{" "}
          <Link href={lang === "en" ? "/en/register" : "/register"} className="text-clay hover:text-gold-dark font-medium">
            {t.register}
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href={lang === "en" ? "/en" : "/"} className="text-sm text-ink-soft hover:text-ink transition-colors">
          ← {t.back}
        </Link>
      </div>
    </div>
  );
}
