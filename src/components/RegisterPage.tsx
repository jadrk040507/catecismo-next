"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function RegisterPage({ lang = "es" }: { lang?: string }) {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = lang === "en" ? {
    title: "Create Account",
    name: "Full name",
    email: "Email",
    password: "Password",
    submit: "Create account",
    loading: "Creating...",
    hasAccount: "Already have an account?",
    login: "Sign in",
    back: "Back to home",
  } : {
    title: "Crear Cuenta",
    name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    submit: "Crear cuenta",
    loading: "Creando...",
    hasAccount: "¿Ya tienes cuenta?",
    login: "Inicia sesión",
    back: "Volver al inicio",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      router.push(lang === "en" ? "/en" : "/");
    } catch (err: any) {
      setError(err.message || "Error al crear cuenta");
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
          <div className="mb-4 p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t.name}</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-parchment-deeper bg-cream text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t.email}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-parchment-deeper bg-cream text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t.password}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-parchment-deeper bg-cream text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gold text-white font-semibold shadow-gold hover:bg-gold-dark transition-all duration-300 disabled:opacity-60">
            {loading ? t.loading : t.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {t.hasAccount}{" "}
          <Link href={lang === "en" ? "/en/login" : "/login"} className="text-clay hover:text-gold-dark font-medium">{t.login}</Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href={lang === "en" ? "/en" : "/"} className="text-sm text-ink-soft hover:text-ink transition-colors">← {t.back}</Link>
      </div>
    </div>
  );
}
