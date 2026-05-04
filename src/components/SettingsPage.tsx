"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function SettingsPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  async function saveProfile() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && name) {
        await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
        await supabase.auth.updateUser({ data: { full_name: name } });
      }
      setMsg(isEn ? "Saved" : "Guardado");
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  }

  async function changePassword() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setMsg(isEn ? "Password updated" : "Contraseña actualizada");
      setPw("");
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h1>{isEn ? "Settings" : "Ajustes"}</h1>
      <div className="db-subtabs" style={{ marginTop: 20 }}>
        <button onClick={() => setTab("profile")} className={`db-subtab${tab === "profile" ? " active" : ""}`}>
          {isEn ? "Profile" : "Perfil"}
        </button>
        <button onClick={() => setTab("password")} className={`db-subtab${tab === "password" ? " active" : ""}`}>
          {isEn ? "Password" : "Contraseña"}
        </button>
      </div>

      {msg && <div className="db-msg good">{msg}</div>}

      {tab === "profile" && (
        <div style={{ maxWidth: 400 }}>
          <label>{isEn ? "Display name" : "Nombre"}</label>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: 6 }}
            placeholder={isEn ? "Your name" : "Tu nombre"} />
          <div style={{ marginTop: 16 }}>
            <button className="db-btn primary" onClick={saveProfile} disabled={saving}>
              {saving ? "…" : isEn ? "Save" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {tab === "password" && (
        <div style={{ maxWidth: 400 }}>
          <label>{isEn ? "New password" : "Nueva contraseña"}</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: 6 }}
            placeholder="••••••••" />
          <div style={{ marginTop: 16 }}>
            <button className="db-btn primary" onClick={changePassword} disabled={saving || pw.length < 6}>
              {saving ? "…" : isEn ? "Update password" : "Actualizar contraseña"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
