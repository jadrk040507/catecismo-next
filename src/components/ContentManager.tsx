"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getClasses, type Clase } from "@/lib/classes";
import {
  getQuizByLesson,
  createQuiz,
  deleteQuiz,
  type Quiz,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/lib/quizzes";
import {
  Plus,
  Trash2,
  BookOpen,
  FileQuestion,
  Save,
  ChevronRight,
  Loader2,
  X,
  GripVertical,
} from "lucide-react";

type Tab = "classes" | "quizzes";

export default function ContentManager() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("classes");
  const [classes, setClasses] = useState<Clase[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Quiz builder
  const [quizLessonSlug, setQuizLessonSlug] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizType, setQuizType] = useState<Quiz["quiz_type"]>("multiple_choice");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: "1", type: "multiple_choice", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "" },
  ]);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [existingQuiz, setExistingQuiz] = useState<Quiz | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (e: any) {
      showToast(e.message || "Error loading data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function checkExistingQuiz(slug: string) {
    if (!slug) { setExistingQuiz(null); return; }
    try {
      const q = await getQuizByLesson(slug);
      setExistingQuiz(q);
    } catch {
      setExistingQuiz(null);
    }
  }

  function addQuestion() {
    const id = String(quizQuestions.length + 1);
    const qType: QuizQuestionType = quizType === "mixed" ? "multiple_choice" : quizType;
    setQuizQuestions([
      ...quizQuestions,
      { id, type: qType, question: "", options: qType === "multiple_choice" ? ["", "", "", ""] : undefined, correct_answer: "", explanation: "" },
    ]);
  }

  function removeQuestion(index: number) {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: string, value: any) {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    const updated = [...quizQuestions];
    const options = [...(updated[qIndex].options || [])];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuizQuestions(updated);
  }

  async function handleSaveQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!quizLessonSlug.trim() || !quizTitle.trim()) return;
    setSavingQuiz(true);
    try {
      if (existingQuiz) {
        const { updateQuiz } = await import("@/lib/quizzes");
        await updateQuiz(existingQuiz.id, {
          title: quizTitle,
          quiz_type: quizType,
          questions: quizQuestions,
          passing_score: quizPassingScore,
        });
        showToast(isEn ? "Quiz updated." : "Examen actualizado.");
      } else {
        await createQuiz({
          lesson_slug: quizLessonSlug.trim(),
          quiz_type: quizType,
          title: quizTitle,
          questions: quizQuestions,
          passing_score: quizPassingScore,
        });
        showToast(isEn ? "Quiz created." : "Examen creado.");
      }
      await checkExistingQuiz(quizLessonSlug);
    } catch (e: any) {
      showToast(e.message || "Error saving quiz.");
    } finally {
      setSavingQuiz(false);
    }
  }

  async function handleDeleteQuiz() {
    if (!existingQuiz) return;
    if (!confirm(isEn ? "Delete this quiz?" : "¿Eliminar este examen?")) return;
    try {
      await deleteQuiz(existingQuiz.id);
      setExistingQuiz(null);
      setQuizLessonSlug("");
      setQuizTitle("");
      setQuizQuestions([{ id: "1", type: "multiple_choice", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "" }]);
      showToast(isEn ? "Quiz deleted." : "Examen eliminado.");
    } catch (e: any) {
      showToast(e.message || "Error deleting quiz.");
    }
  }

  const t = (key: string) =>
    (({
      classes: { es: "Clases", en: "Classes" },
      quizzes: { es: "Exámenes", en: "Quizzes" },
      selectClass: { es: "Seleccionar clase", en: "Select class" },
      noClasses: { es: "Sin clases.", en: "No classes." },
      students: { es: "Estudiantes", en: "Students" },
      inviteCode: { es: "Código", en: "Code" },
      createQuiz: { es: "Crear examen", en: "Create quiz" },
      editQuiz: { es: "Editar examen", en: "Edit quiz" },
      lessonSlug: { es: "Slug de lección", en: "Lesson slug" },
      quizTitle: { es: "Título", en: "Title" },
      quizType: { es: "Tipo", en: "Type" },
      multipleChoice: { es: "Opción múltiple", en: "Multiple choice" },
      trueFalse: { es: "Verdadero/Falso", en: "True/False" },
      fillBlank: { es: "Completar", en: "Fill in the blank" },
      passingScore: { es: "Puntaje mínimo", en: "Passing score" },
      questions: { es: "Preguntas", en: "Questions" },
      question: { es: "Pregunta", en: "Question" },
      options: { es: "Opciones", en: "Options" },
      correctAnswer: { es: "Respuesta correcta", en: "Correct answer" },
      explanation: { es: "Explicación (opcional)", en: "Explanation (optional)" },
      addQuestion: { es: "Agregar pregunta", en: "Add question" },
      save: { es: "Guardar", en: "Save" },
      delete: { es: "Eliminar", en: "Delete" },
      quizExists: { es: "Ya existe un examen para esta lección", en: "A quiz already exists for this lesson" },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? "en" : "es"] || key;

  if (loading) {
    return <div className="db-empty"><Loader2 size={20} className="animate-spin" /></div>;
  }

  return (
    <div>
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <BookOpen size={22} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
        {isEn ? "Content Manager" : "Gestión de Contenido"}
      </h1>

      <nav className="db-subtabs" role="tablist">
        {(["classes", "quizzes"] as Tab[]).map((tb) => (
          <button key={tb} role="tab" aria-selected={tab === tb} onClick={() => setTab(tb)} className={`db-subtab${tab === tb ? " active" : ""}`}>
            {tb === "classes" ? <BookOpen size={14} /> : <FileQuestion size={14} />} {t(tb)}
          </button>
        ))}
      </nav>

      {/* ═══════ TAB: CLASSES ═══════ */}
      {tab === "classes" && (
        <div style={{ marginTop: 24 }}>
          {classes.length === 0 ? (
            <div className="db-empty"><p>{t("noClasses")}</p></div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {classes.map((c) => (
                <div key={c.id} className="db-card" style={{ cursor: "pointer" }} onClick={() => setSelectedClassId(c.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="db-card-title">{c.name}</div>
                      <div className="db-card-desc" style={{ display: "flex", gap: 12 }}>
                        <span>{t("inviteCode")}: <span className="db-badge accent" style={{ fontFamily: "monospace" }}>{c.invite_code}</span></span>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--color-secondary)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: QUIZZES ═══════ */}
      {tab === "quizzes" && (
        <div style={{ marginTop: 24, maxWidth: 600 }}>
          {existingQuiz && (
            <div className="db-card" style={{ cursor: "default", marginBottom: 16, border: "1px solid var(--color-accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 500 }}>⚠️ {t("quizExists")}</span>
                <button className="db-btn sm danger ghost" onClick={handleDeleteQuiz}>
                  <Trash2 size={13} /> {t("delete")}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveQuiz}>
            <label>{t("lessonSlug")}</label>
            <input
              type="text"
              value={quizLessonSlug}
              onChange={(e) => setQuizLessonSlug(e.target.value)}
              onBlur={() => checkExistingQuiz(quizLessonSlug)}
              placeholder="credo-01-creo-en-dios"
              style={{ marginBottom: 12, fontFamily: "monospace" }}
            />

            <label>{t("quizTitle")}</label>
            <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder={isEn ? "Chapter 1 Quiz" : "Examen Capítulo 1"} style={{ marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>{t("quizType")}</label>
                <select value={quizType} onChange={(e) => setQuizType(e.target.value as Quiz["quiz_type"])} style={{ width: "100%" }}>
                  <option value="multiple_choice">{t("multipleChoice")}</option>
                  <option value="true_false">{t("trueFalse")}</option>
                  <option value="fill_blank">{t("fillBlank")}</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>{t("passingScore")}</label>
                <input type="number" value={quizPassingScore} onChange={(e) => setQuizPassingScore(parseInt(e.target.value) || 70)} min={0} max={100} style={{ width: "100%" }} />
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t("questions")} ({quizQuestions.length})</h3>

            {quizQuestions.map((q, i) => (
              <div key={i} className="db-card" style={{ cursor: "default", marginBottom: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{t("question")} {i + 1}</span>
                  {quizQuestions.length > 1 && (
                    <button type="button" className="db-btn sm danger ghost" onClick={() => removeQuestion(i)}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(i, "question", e.target.value)}
                  placeholder={isEn ? "Enter question…" : "Escribe la pregunta…"}
                  style={{ marginBottom: 8, fontSize: 14 }}
                />

                {q.type === "multiple_choice" && q.options && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, oi, e.target.value)}
                        placeholder={`${String.fromCharCode(65 + oi)}.`}
                        style={{ fontSize: 13 }}
                      />
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={q.correct_answer}
                  onChange={(e) => updateQuestion(i, "correct_answer", e.target.value)}
                  placeholder={t("correctAnswer")}
                  style={{ marginBottom: 8, fontSize: 13 }}
                />

                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) => updateQuestion(i, "explanation", e.target.value)}
                  placeholder={t("explanation")}
                  style={{ fontSize: 13 }}
                />
              </div>
            ))}

            <button type="button" className="db-btn" onClick={addQuestion} style={{ marginBottom: 20 }}>
              <Plus size={14} /> {t("addQuestion")}
            </button>

            <div className="db-modal-actions">
              <button type="submit" className="db-btn primary" disabled={savingQuiz || !quizLessonSlug.trim() || !quizTitle.trim()}>
                <Save size={14} /> {savingQuiz ? "…" : t("save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="db-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}