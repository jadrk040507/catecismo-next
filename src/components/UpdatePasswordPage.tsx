"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function UpdatePasswordPage({ lang = "es" }: { lang?: "es" | "en" }) {
  const pathname = usePathname();
  const isEn = lang === "en" || pathname.startsWith("/en");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError(isEn ? "At least 8 characters" : "Mínimo 8 caracteres"); return; }
    if (password !== confirm) { setError(isEn ? "Passwords don't match" : "Las contraseñas no coinciden"); return; }
    setLoading(true); setError("");
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err: any) {
      setError(err.message || (isEn ? "Error" : "Error"));
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="container" style={{ maxWidth: 440, margin: "80px auto", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>{isEn ? "Password updated!" : "¡Contraseña actualizada!"}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          {isEn ? "You can now sign in with your new password." : "Ahora puedes iniciar sesión con tu nueva contraseña."}
        </p>
        <a href={isEn ? "/en/login" : "/login"} className="btn btn-dark">
          {isEn ? "Sign in" : "Iniciar sesión"}
        </a>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 440, margin: "80px auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>{isEn ? "Set New Password" : "Nueva Contraseña"}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
        {isEn ? "Enter your new password below." : "Ingresa tu nueva contraseña."}
      </p>
      {error && <div style={{ color: "var(--color-red)", fontSize: 13, marginBottom: 16, padding: "8px 12px", background: "#FEF2F2", borderRadius: 6 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
          {isEn ? "New password" : "Nueva contraseña"}
        </label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          required autoFocus minLength={8}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 15, fontFamily: "inherit", marginBottom: 16 }}
        />
        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
          {isEn ? "Confirm password" : "Confirmar contraseña"}
        </label>
        <input
          type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          required minLength={8}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 15, fontFamily: "inherit", marginBottom: 16 }}
        />
        <button type="submit" className="btn btn-dark" disabled={loading} style={{ width: "100%" }}>
          {loading ? (isEn ? "Updating…" : "Actualizando…") : (isEn ? "Update password" : "Actualizar contraseña")}
        </button>
      </form>
    </div>
  );
}
