"use client";

import { useState } from "react";
import { Question, submitQuizScore } from "@/lib/quiz";

interface QuizProps {
  questions: Question[];
  lang: "es" | "en";
  lessonPath: string;
  lessonTitle: string;
}

export default function Quiz({ questions, lang, lessonPath, lessonTitle }: QuizProps) {
  const isEn = lang === "en";
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [submitting, setSubmitting] = useState(false);

  const q = questions[current];
  const isDone = answered.includes(current);

  function handleSelect(idx: number) {
    if (isDone) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null || isDone) return;
    const correct = selected === q.correct;
    const newScores = [...scores];
    newScores[current] = correct;
    setScores(newScores);
    setAnswered([...answered, current]);
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    setShowResult(true);
    const correctCount = scores.filter(Boolean).length;
    setSubmitting(true);
    try {
      await submitQuizScore(lessonPath, correctCount, questions.length);
    } catch { /* best effort */ }
    setSubmitting(false);
  }

  function handleShare() {
    const correctCount = scores.filter(Boolean).length;
    const text = isEn
      ? `I scored ${correctCount}/${questions.length} on "${lessonTitle}" — Catechism Quiz! ✝️`
      : `¡Obtuve ${correctCount}/${questions.length} en "${lessonTitle}" — Quiz del Catecismo! ✝️`;
    if (navigator.share) {
      navigator.share({ title: lessonTitle, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href).then(() => {
        alert(isEn ? "Copied to clipboard!" : "¡Copiado al portapapeles!");
      });
    }
  }

  if (!q) return null;

  const correctCount = scores.filter(Boolean).length;

  return (
    <div className="quiz-container" style={{
      marginTop: 32,
      border: "1px solid var(--color-border-light)",
      borderRadius: 8,
      padding: "24px 28px",
      background: "var(--color-surface)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{showResult ? "🏆" : "🧠"}</span>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
          {showResult
            ? (isEn ? "Quiz Complete!" : "¡Quiz Completado!")
            : (isEn ? "Knowledge Check" : "Prueba de Conocimiento")
          }
        </h3>
      </div>

      {!showResult ? (
        <>
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: "100%", height: 4, borderRadius: 2,
                background: answered.includes(i)
                  ? (scores[i] ? "var(--color-accent)" : "var(--color-red)")
                  : i === current ? "var(--color-primary)" : "var(--color-border-light)",
                transition: "background 0.2s",
              }} />
            ))}
          </div>

          {/* Question */}
          <p style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--color-primary)", marginBottom: 20, lineHeight: 1.6 }}>
            {current + 1}. {q.question}
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {q.options.map((opt, idx) => {
              let bg = "var(--color-neutral)";
              let border = "1px solid var(--color-border-light)";
              let textColor = "var(--color-primary)";
              let extra = "";

              if (isDone) {
                if (idx === q.correct) {
                  bg = "#ECFDF5";
                  border = "1px solid #34D399";
                  textColor = "#065F46";
                  extra = " ✓";
                } else if (idx === selected) {
                  bg = "#FEF2F2";
                  border = "1px solid #F87171";
                  textColor = "#991B1B";
                  extra = " ✗";
                }
              } else if (idx === selected) {
                bg = "var(--color-hover)";
                border = "1px solid var(--color-secondary)";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isDone}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    border,
                    borderRadius: 6,
                    background: bg,
                    color: textColor,
                    fontSize: "0.95rem",
                    cursor: isDone ? "default" : "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {String.fromCharCode(65 + idx)}. {opt}{extra}
                </button>
              );
            })}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--color-secondary)" }}>
              {current + 1} / {questions.length}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {!isDone ? (
                <button
                  className="lp-btn"
                  onClick={handleConfirm}
                  disabled={selected === null}
                >
                  {isEn ? "Confirm" : "Confirmar"}
                </button>
              ) : (
                <>
                  {q.explanation && (
                    <p style={{ fontSize: 13, color: "var(--color-secondary)", maxWidth: 300, textAlign: "right", lineHeight: 1.5, margin: 0 }}>
                      💡 {q.explanation}
                    </p>
                  )}
                  <button className="lp-btn" onClick={handleNext}>
                    {current < questions.length - 1
                      ? (isEn ? "Next →" : "Siguiente →")
                      : (isEn ? "See Results" : "Ver Resultados")
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {correctCount === questions.length ? "🎉" : correctCount >= questions.length * 0.7 ? "👏" : "📚"}
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>
              {correctCount} / {questions.length}
            </p>
            <p style={{ fontSize: 14, color: "var(--color-secondary)", marginBottom: 16 }}>
              {correctCount === questions.length
                ? (isEn ? "Perfect score! Excellent!" : "¡Puntuación perfecta! ¡Excelente!")
                : correctCount >= questions.length * 0.7
                  ? (isEn ? "Great job! Keep studying!" : "¡Buen trabajo! ¡Sigue estudiando!")
                  : (isEn ? "Keep learning — you'll get better!" : "Sigue aprendiendo — ¡mejorarás!")
              }
            </p>
          </div>

          {/* Questions review */}
          <div style={{ marginBottom: 20 }}>
            {questions.map((qu, i) => (
              <div key={i} style={{
                padding: "8px 0",
                borderBottom: i < questions.length - 1 ? "1px solid var(--color-border-light)" : "none",
              }}>
                <span style={{ marginRight: 8 }}>
                  {scores[i] ? "✅" : "❌"}
                </span>
                <span style={{ fontSize: 13, color: "var(--color-secondary)" }}>
                  {qu.question}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="db-btn sm" onClick={handleShare}>
              {isEn ? "📤 Share" : "📤 Compartir"}
            </button>
            <button className="db-btn sm" onClick={() => {
              setShowResult(false); setCurrent(0); setSelected(null);
              setAnswered([]); setScores(new Array(questions.length).fill(false));
            }}>
              {isEn ? "🔄 Retry" : "🔄 Reintentar"}
            </button>
          </div>

          {submitting && (
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-secondary)", marginTop: 12 }}>
              {isEn ? "Saving score…" : "Guardando puntuación…"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
