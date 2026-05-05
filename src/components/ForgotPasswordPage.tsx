"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function ForgotPasswordPage({ lang = "es" }: { lang?: "es" | "en" }) {
  const pathname = usePathname();
  const isEn = lang === "en" || pathname.startsWith("/en");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError(isEn ? "Enter your email" : "Ingresa tu correo"); return; }
    setLoading(true); setError("");
    try {
      const supabase = getSupabase();
      if (!supabase) { setError(isEn ? "Configuration error" : "Error de configuración"); setLoading(false); return; }
      const redirectTo = `${window.location.origin}${isEn ? "/en" : ""}/update-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      setError(err.message || (isEn ? "Error" : "Error"));
    } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="container" style={{ maxWidth: 440, margin: "80px auto", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📧</div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>{isEn ? "Check your email" : "Revisa tu correo"}</h1>
        <p style={{ color: "var(--color-secondary)" }}>
          {isEn
            ? "If an account with that email exists, we've sent you a link to reset your password."
            : "Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer tu contraseña."}
        </p>
        <a href={isEn ? "/en/login" : "/login"} className="btn btn-outline" style={{ marginTop: 20 }}>
          {isEn ? "Back to login" : "Volver al inicio"}
        </a>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 440, margin: "80px auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>{isEn ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}</h1>
      <p style={{ color: "var(--color-secondary)", marginBottom: 24 }}>
        {isEn ? "Enter your email and we'll send you a reset link." : "Ingresa tu correo y te enviaremos un enlace para restablecerla."}
      </p>
      {error && <div style={{ color: "var(--color-red)", fontSize: 13, marginBottom: 16, padding: "8px 12px", background: "#FEF2F2", borderRadius: 6 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
          {isEn ? "Email" : "Correo electrónico"}
        </label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          required autoFocus
          style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 15, fontFamily: "inherit", marginBottom: 16 }}
          placeholder={isEn ? "you@example.com" : "tu@ejemplo.com"}
        />
        <button type="submit" className="btn btn-dark" disabled={loading} style={{ width: "100%" }}>
          {loading ? (isEn ? "Sending…" : "Enviando…") : (isEn ? "Send reset link" : "Enviar enlace")}
        </button>
      </form>
    </div>
  );
}
