"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getQuiz,
  submitQuizAttempt,
  getUserBestScore,
  type Quiz,
  type QuizQuestion,
  type QuizAnswer,
  type QuizAttempt,
} from "@/lib/quizzes";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Loader2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface Props {
  quizId: string;
  onComplete?: (score: number, passed: boolean) => void;
  onBack?: () => void;
}

export default function QuizView({ quizId, onComplete, onBack }: Props) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const q = await getQuiz(quizId);
        setQuiz(q);
        // Try to get best score
        try {
          const sb = (await import("@/lib/supabase")).getSupabase();
          if (sb) {
            const { data: { user } } = await sb.auth.getUser();
            if (user) {
              const best = await getUserBestScore(quizId, user.id);
              setBestScore(best);
            }
          }
        } catch {}
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId]);

  async function handleSubmit() {
    if (!quiz) return;
    setLoading(true);
    try {
      const quizAnswers: QuizAnswer[] = quiz.questions.map((q) => {
        const userAnswer = answers[q.id] || "";
        let correct = false;
        if (q.type === "fill_blank") {
          correct = userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
        } else {
          correct = userAnswer === q.correct_answer;
        }
        return { question_id: q.id, answer: userAnswer, correct };
      });

      const attempt = await submitQuizAttempt({ quiz_id: quizId, answers: quizAnswers });
      setResult(attempt);
      setSubmitted(true);
      if (attempt.score > (bestScore || 0)) setBestScore(attempt.score);
      onComplete?.(attempt.score, attempt.passed);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setResult(null);
    setShowExplanation(null);
  }

  if (loading) {
    return (
      <div className="db-empty" style={{ padding: 40 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-secondary)" }} />
        <p style={{ marginTop: 12 }}>{isEn ? "Loading quiz…" : "Cargando examen…"}</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="db-empty" style={{ padding: 40 }}>
        <XCircle size={24} style={{ color: "var(--color-danger, #dc2626)" }} />
        <p>{error || (isEn ? "Quiz not found." : "Examen no encontrado.")}</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // ─── Results view ───
  if (submitted && result) {
    const passed = result.passed;
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {passed ? "🎉" : "📖"}
        </div>
        <h2 style={{ marginBottom: 8 }}>
          {passed
            ? (isEn ? "Well done!" : "¡Bien hecho!")
            : (isEn ? "Keep studying!" : "¡Sigue estudiando!")}
        </h2>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: passed ? "var(--color-success, #16a34a)" : "var(--color-secondary)" }}>
          {result.score}%
        </div>
        <p style={{ color: "var(--color-secondary)", marginBottom: 4 }}>
          {isEn ? "Correct answers:" : "Respuestas correctas:"} {result.answers.filter(a => a.correct).length}/{totalQuestions}
        </p>
        <p style={{ color: "var(--color-secondary)", marginBottom: 4 }}>
          {isEn ? "Passing score:" : "Puntaje mínimo:"} {quiz.passing_score}%
        </p>
        {bestScore !== null && (
          <p style={{ color: "var(--color-papal, #C9882B)", marginBottom: 16 }}>
            🏆 {isEn ? "Best score:" : "Mejor puntaje:"} {bestScore}%
          </p>
        )}

        {/* Review answers */}
        <div style={{ textAlign: "left", marginTop: 24 }}>
          {quiz.questions.map((q, i) => {
            const ans = result.answers.find(a => a.question_id === q.id);
            return (
              <div key={q.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {ans?.correct
                    ? <CheckCircle2 size={16} style={{ color: "var(--color-success, #16a34a)", marginTop: 2, flexShrink: 0 }} />
                    : <XCircle size={16} style={{ color: "var(--color-danger, #dc2626)", marginTop: 2, flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{q.question}</div>
                    {!ans?.correct && (
                      <div style={{ fontSize: 13, color: "var(--color-danger, #dc2626)", marginTop: 2 }}>
                        {isEn ? "Your answer:" : "Tu respuesta:"} {answers[q.id] || "—"}
                      </div>
                    )}
                    {!ans?.correct && (
                      <div style={{ fontSize: 13, color: "var(--color-success, #16a34a)", marginTop: 2 }}>
                        {isEn ? "Correct:" : "Correcta:"} {q.correct_answer}
                      </div>
                    )}
                    {q.explanation && (
                      <div style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4, fontStyle: "italic" }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center" }}>
          <button className="db-btn" onClick={handleRetry}>
            <RotateCcw size={14} /> {isEn ? "Retry" : "Reintentar"}
          </button>
          {onBack && (
            <button className="db-btn primary" onClick={onBack}>
              {isEn ? "Back" : "Volver"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Quiz taking view ───
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Back button */}
      {onBack && (
        <button className="db-btn ghost" onClick={onBack} style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> {isEn ? "Back" : "Volver"}
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>{quiz.title}</h2>
        <div style={{ fontSize: 13, color: "var(--color-secondary)" }}>
          {isEn ? "Question" : "Pregunta"} {currentIndex + 1} {isEn ? "of" : "de"} {totalQuestions}
          {bestScore !== null && ` · 🏆 ${isEn ? "Best" : "Mejor"}: ${bestScore}%`}
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--color-accent)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Question */}
      <div className="db-card" style={{ cursor: "default", padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 20 }}>
          <HelpCircle size={16} style={{ verticalAlign: "text-bottom", marginRight: 6, color: "var(--color-accent)" }} />
          {currentQuestion.question}
        </div>

        {/* Answer options */}
        {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                className={`db-btn${answers[currentQuestion.id] === opt ? " primary" : ""}`}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt })}
                style={{ textAlign: "left", justifyContent: "flex-start", fontWeight: answers[currentQuestion.id] === opt ? 600 : 400 }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: answers[currentQuestion.id] === opt ? "2px solid var(--color-accent)" : "2px solid var(--color-border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginRight: 10, flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "true_false" && (
          <div style={{ display: "flex", gap: 12 }}>
            {["True", "False"].map((opt) => (
              <button
                key={opt}
                className={`db-btn${answers[currentQuestion.id] === opt ? " primary" : ""}`}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt })}
                style={{ flex: 1, fontWeight: answers[currentQuestion.id] === opt ? 600 : 400 }}
              >
                {opt === "True" ? "✓ " : "✗ "}
                {isEn ? opt : (opt === "True" ? "Verdadero" : "Falso")}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "fill_blank" && (
          <input
            className="db-search"
            type="text"
            placeholder={isEn ? "Type your answer…" : "Escribe tu respuesta…"}
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            style={{ fontSize: 16, padding: "10px 14px" }}
          />
        )}

        {/* Explanation hint */}
        {currentQuestion.explanation && showExplanation === currentQuestion.id && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--color-surface-alt, #f8f7f5)", borderRadius: 6, fontSize: 13, color: "var(--color-secondary)", fontStyle: "italic" }}>
            <Lightbulb size={13} style={{ verticalAlign: "text-bottom", marginRight: 4 }} /> {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 8 }}>
        <button
          className="db-btn"
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(currentIndex - 1); setShowExplanation(null); }}
        >
          <ArrowLeft size={14} /> {isEn ? "Previous" : "Anterior"}
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            className="db-btn primary"
            disabled={!answers[currentQuestion.id]}
            onClick={() => { setCurrentIndex(currentIndex + 1); setShowExplanation(null); }}
          >
            {isEn ? "Next" : "Siguiente"} <ArrowRight size={14} />
          </button>
        ) : (
          <button
            className="db-btn primary"
            disabled={!answers[currentQuestion.id]}
            onClick={handleSubmit}
          >
            {isEn ? "Submit" : "Enviar"} <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}