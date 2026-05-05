"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  createParish,
  addParishUser,
  getParishPrograms,
  type Parish,
} from "@/lib/parishes";
import {
  Church,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  BookOpen,
  Sparkles,
  Mail,
  UserPlus,
  Loader2,
} from "lucide-react";

// ─── Step type ────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

// ─── Component ────────────────────────────────────────────────────────────
export default function ParishOnboarding({
  onComplete,
}: {
  onComplete: (parish: Parish) => void;
}) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Parish info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [dreName, setDreName] = useState("");

  // Step 2 — Invite catechists
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [inviteRole, setInviteRole] = useState<"catechist" | "dre" | "volunteer">("catechist");

  // Step 3 — Programs
  const [programName, setProgramName] = useState("");
  const [programDesc, setProgramDesc] = useState("");
  const [programYear, setProgramYear] = useState(new Date().getFullYear().toString());
  const [createdPrograms, setCreatedPrograms] = useState<string[]>([]);

  // Step 4 — Done
  const [createdParish, setCreatedParish] = useState<Parish | null>(null);

  // ─── i18n ─────────────────────────────────────────────────────────────
  const t = (key: string) =>
    (
      ({
        title: { es: "Registrar Parroquia", en: "Register Parish" },
        subtitle: {
          es: "Configurá tu parroquia en pocos pasos.",
          en: "Set up your parish in a few steps.",
        },
        step1Title: { es: "Información de la Parroquia", en: "Parish Information" },
        step1Desc: {
          es: "Ingresá los datos básicos de tu parroquia.",
          en: "Enter your parish's basic details.",
        },
        step2Title: { es: "Invitar Catequistas", en: "Invite Catechists" },
        step2Desc: {
          es: "Invitá a tu equipo de catequistas y voluntarios.",
          en: "Invite your catechist team and volunteers.",
        },
        step3Title: { es: "Crear Programas", en: "Create Programs" },
        step3Desc: {
          es: "Creá tus primeros programas de formación.",
          en: "Create your first formation programs.",
        },
        step4Title: { es: "¡Todo Listo!", en: "All Set!" },
        step4Desc: {
          es: "Tu parroquia está configurada y lista para usar.",
          en: "Your parish is set up and ready to go.",
        },
        parishName: { es: "Nombre de la parroquia", en: "Parish name" },
        parishNamePh: {
          es: "ej. Parroquia San José",
          en: "e.g. St. Joseph Parish",
        },
        addressLabel: { es: "Dirección", en: "Address" },
        addressPh: { es: "ej. Av. Central 123", en: "e.g. 123 Main St" },
        cityLabel: { es: "Ciudad", en: "City" },
        cityPh: { es: "ej. Buenos Aires", en: "e.g. New York" },
        phoneLabel: { es: "Teléfono", en: "Phone" },
        pastorLabel: { es: "Párroco", en: "Pastor" },
        pastorPh: { es: "ej. Padre Juan Pérez", en: "e.g. Fr. John Smith" },
        dreLabel: { es: "Coordinador/a de RE", en: "DRE" },
        drePh: { es: "ej. María García", en: "e.g. Mary Johnson" },
        emailLabel: { es: "Correo electrónico", en: "Email address" },
        emailPh: { es: "ej. catequista@parroquia.org", en: "e.g. catechist@parish.org" },
        roleLabel: { es: "Rol", en: "Role" },
        catechist: { es: "Catequista", en: "Catechist" },
        dre: { es: "Coordinador/a RE", en: "DRE" },
        volunteer: { es: "Voluntario/a", en: "Volunteer" },
        addEmail: { es: "Agregar correo", en: "Add email" },
        programNameLabel: { es: "Nombre del programa", en: "Program name" },
        programNamePh: {
          es: "ej. Primera Comunión 2026",
          en: "e.g. First Communion 2026",
        },
        programDescLabel: { es: "Descripción", en: "Description" },
        programDescPh: {
          es: "Descripción breve del programa…",
          en: "Brief program description…",
        },
        yearLabel: { es: "Año", en: "Year" },
        addProgram: { es: "Agregar programa", en: "Add program" },
        skipPrograms: { es: "Saltar este paso", en: "Skip this step" },
        skipInvite: { es: "Saltar por ahora", en: "Skip for now" },
        next: { es: "Siguiente", en: "Next" },
        back: { es: "Volver", en: "Back" },
        finish: { es: "Finalizar", en: "Finish" },
        goToDashboard: { es: "Ir al Dashboard", en: "Go to Dashboard" },
        saving: { es: "Guardando…", en: "Saving…" },
        optional: { es: "Opcional", en: "Optional" },
        required: { es: "Requerido", en: "Required" },
        programAdded: { es: "Programa agregado", en: "Program added" },
        step: { es: "Paso", en: "Step" },
        of: { es: "de", en: "of" },
      }) as Record<string, { es: string; en: string }>
    )[key]?.[isEn ? "en" : "es"] || key;

  // ─── Step indicators ──────────────────────────────────────────────────
  const steps: { n: Step; icon: React.ReactNode }[] = [
    { n: 1, icon: <Church size={16} /> },
    { n: 2, icon: <Users size={16} /> },
    { n: 3, icon: <BookOpen size={16} /> },
    { n: 4, icon: <Sparkles size={16} /> },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────

  async function handleStep1Next() {
    if (!name.trim()) {
      setError(isEn ? "Parish name is required." : "El nombre de la parroquia es obligatorio.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const parish = await createParish({
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        pastor_name: pastorName.trim() || undefined,
        dre_name: dreName.trim() || undefined,
      });

      // Add current user as parish_admin
      if (user?.id) {
        await addParishUser(parish.id, {
          user_id: user.id,
          role: "parish_admin",
        });
      }

      setCreatedParish(parish);
      setStep(2);
    } catch (e: any) {
      setError(e.message || (isEn ? "Error creating parish." : "Error al crear la parroquia."));
    } finally {
      setSaving(false);
    }
  }

  async function handleStep2Next() {
    if (!createdParish) return;
    setError("");
    setSaving(true);
    try {
      const { inviteParishUser } = await import("@/lib/parishes");
      const validEmails = inviteEmails.filter((e) => e.trim().length > 0);
      for (const email of validEmails) {
        await inviteParishUser(createdParish.id, email.trim(), inviteRole);
      }
      setStep(3);
    } catch (e: any) {
      setError(e.message || (isEn ? "Error inviting users." : "Error al invitar usuarios."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddProgram() {
    if (!createdParish || !programName.trim()) return;
    setError("");
    try {
      const { createProgram } = await import("@/lib/parishes");
      await createProgram(createdParish.id, {
        name: programName.trim(),
        description: programDesc.trim() || undefined,
        year: programYear || undefined,
      });
      setCreatedPrograms((prev) => [...prev, programName.trim()]);
      setProgramName("");
      setProgramDesc("");
    } catch (e: any) {
      setError(e.message || (isEn ? "Error creating program." : "Error al crear programa."));
    }
  }

  function handleFinish() {
    if (createdParish) {
      onComplete(createdParish);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="db-content" style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            fontSize: 40,
            display: "block",
            marginBottom: 10,
          }}
        >
          ⛪
        </span>
        <h1>{t("title")}</h1>
        <p className="db-subtitle">{t("subtitle")}</p>
      </div>

      {/* Step indicators */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginBottom: 28,
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              className={`db-stat-item`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                border:
                  step === s.n
                    ? "2px solid var(--color-accent)"
                    : step > s.n
                      ? "2px solid var(--color-green)"
                      : "1px solid var(--color-border-light)",
                background:
                  step > s.n
                    ? "var(--color-green-soft)"
                    : step === s.n
                      ? "var(--color-accent-soft)"
                      : "var(--color-surface)",
                color:
                  step > s.n
                    ? "var(--color-green)"
                    : step === s.n
                      ? "var(--color-accent)"
                      : "var(--color-tertiary)",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {step > s.n ? <Check size={13} /> : s.icon}
              <span className="sr-only">
                {t("step")} {s.n}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 24,
                  height: 2,
                  background:
                    step > s.n ? "var(--color-green)" : "var(--color-border-light)",
                  borderRadius: 1,
                  transition: "background 0.2s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div className="db-msg bad">{error}</div>}

      {/* ─── STEP 1: Parish Info ─── */}
      {step === 1 && (
        <div>
          <h2>{t("step1Title")}</h2>
          <p className="db-subtitle">{t("step1Desc")}</p>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 0 }}>
            <label>
              {t("parishName")} <span style={{ color: "var(--color-red)" }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("parishNamePh")}
              required
            />

            <label>{t("addressLabel")} ({t("optional")})</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPh")}
            />

            <label>{t("cityLabel")} ({t("optional")})</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("cityPh")}
            />

            <label>{t("phoneLabel")} ({t("optional")})</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />

            <label>{t("pastorLabel")} ({t("optional")})</label>
            <input
              value={pastorName}
              onChange={(e) => setPastorName(e.target.value)}
              placeholder={t("pastorPh")}
            />

            <label>{t("dreLabel")} ({t("optional")})</label>
            <input
              value={dreName}
              onChange={(e) => setDreName(e.target.value)}
              placeholder={t("drePh")}
            />
          </div>

          <div className="db-modal-actions">
            <button
              className="db-btn primary"
              onClick={handleStep1Next}
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <Loader2 size={14} className="db-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              {saving ? t("saving") : t("next")}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Invite Catechists ─── */}
      {step === 2 && (
        <div>
          <h2>{t("step2Title")}</h2>
          <p className="db-subtitle">{t("step2Desc")}</p>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 0 }}>
            <label>{t("roleLabel")}</label>
            <select
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as "catechist" | "dre" | "volunteer")
              }
            >
              <option value="catechist">{t("catechist")}</option>
              <option value="dre">{t("dre")}</option>
              <option value="volunteer">{t("volunteer")}</option>
            </select>

            {inviteEmails.map((email, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 14 : 0 }}>
                <label>
                  {t("emailLabel")} {i + 1}
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={email}
                    onChange={(e) => {
                      const next = [...inviteEmails];
                      next[i] = e.target.value;
                      setInviteEmails(next);
                    }}
                    placeholder={t("emailPh")}
                    style={{ flex: 1 }}
                  />
                  {i === inviteEmails.length - 1 && (
                    <button
                      className="db-btn sm"
                      onClick={() => setInviteEmails([...inviteEmails, ""])}
                      type="button"
                    >
                      <UserPlus size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="db-modal-actions" style={{ justifyContent: "space-between" }}>
            <button className="db-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={14} />
              {t("back")}
            </button>
            <div className="db-btn-group">
              <button className="db-btn" onClick={() => setStep(3)}>
                {t("skipInvite")}
              </button>
              <button className="db-btn primary" onClick={handleStep2Next} disabled={saving}>
                {saving ? <Loader2 size={14} className="db-spin" /> : <ArrowRight size={14} />}
                {saving ? t("saving") : t("next")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Create Programs ─── */}
      {step === 3 && (
        <div>
          <h2>{t("step3Title")}</h2>
          <p className="db-subtitle">{t("step3Desc")}</p>

          {createdPrograms.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              {createdPrograms.map((pName, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "var(--color-green-soft)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: 4,
                    fontSize: 13,
                    color: "var(--color-green)",
                  }}
                >
                  <Check size={14} />
                  {pName}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <label>{t("programNameLabel")}</label>
            <input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder={t("programNamePh")}
            />

            <label>{t("programDescLabel")} ({t("optional")})</label>
            <textarea
              value={programDesc}
              onChange={(e) => setProgramDesc(e.target.value)}
              placeholder={t("programDescPh")}
              style={{ minHeight: 60 }}
            />

            <label>{t("yearLabel")}</label>
            <input
              value={programYear}
              onChange={(e) => setProgramYear(e.target.value)}
              placeholder="2026"
              style={{ maxWidth: 160 }}
            />
          </div>

          <button
            className="db-btn"
            onClick={handleAddProgram}
            disabled={!programName.trim()}
            style={{ marginTop: 12 }}
          >
            <BookOpen size={14} />
            {t("addProgram")}
          </button>

          <div className="db-modal-actions" style={{ justifyContent: "space-between" }}>
            <button className="db-btn" onClick={() => setStep(2)}>
              <ArrowLeft size={14} />
              {t("back")}
            </button>
            <div className="db-btn-group">
              <button className="db-btn" onClick={() => setStep(4)}>
                {t("skipPrograms")}
              </button>
              <button className="db-btn primary" onClick={() => setStep(4)}>
                <ArrowRight size={14} />
                {t("next")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Done ─── */}
      {step === 4 && (
        <div className="db-welcome">
          <span className="db-welcome-icon">🎉</span>
          <h2>{t("step4Title")}</h2>
          <p>{t("step4Desc")}</p>
          <div className="db-welcome-actions">
            <button className="db-btn primary" onClick={handleFinish}>
              <Sparkles size={14} />
              {t("goToDashboard")}
            </button>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        .db-spin {
          animation: dbSpin 1s linear infinite;
        }
        @keyframes dbSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}