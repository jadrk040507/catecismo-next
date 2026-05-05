import { getSupabase } from "@/lib/supabase";

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error("No supabase configured");
  return client;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Quiz {
  id: string;
  lesson_slug: string;
  quiz_type: "multiple_choice" | "true_false" | "fill_blank" | "mixed";
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
  created_at: string;
}

export type QuizQuestionType = "multiple_choice" | "true_false" | "fill_blank";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[]; // for multiple_choice
  correct_answer: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: QuizAnswer[];
  score: number;
  max_score: number;
  passed: boolean;
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  answer: string;
  correct: boolean;
}

export interface LessonProgress {
  user_id: string;
  lesson_slug: string;
  class_id: number | null;
  status: "not_started" | "in_progress" | "completed";
  completed_at: string | null;
  quiz_score: number | null;
  time_spent: number | null; // seconds
}

// ─── Quizzes ────────────────────────────────────────────────────────────────

export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const { data, error } = await requireSupabase()
    .from("lesson_quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error) throw new Error(error.message);
  return data as Quiz | null;
}

export async function getQuizByLesson(lessonSlug: string): Promise<Quiz | null> {
  const { data, error } = await requireSupabase()
    .from("lesson_quizzes")
    .select("*")
    .eq("lesson_slug", lessonSlug)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data as Quiz | null;
}

export async function createQuiz(input: {
  lesson_slug: string;
  quiz_type: Quiz["quiz_type"];
  title: string;
  questions: QuizQuestion[];
  passing_score?: number;
}): Promise<Quiz> {
  const { data, error } = await (requireSupabase().from("lesson_quizzes") as any)
    .insert({
      lesson_slug: input.lesson_slug,
      quiz_type: input.quiz_type,
      title: input.title,
      questions: input.questions,
      passing_score: input.passing_score || 70,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function updateQuiz(
  quizId: string,
  input: Partial<Pick<Quiz, "title" | "quiz_type" | "questions" | "passing_score">>
): Promise<Quiz> {
  const { data, error } = await (requireSupabase().from("lesson_quizzes") as any)
    .update(input)
    .eq("id", quizId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const { error } = await requireSupabase()
    .from("lesson_quizzes")
    .delete()
    .eq("id", quizId);

  if (error) throw new Error(error.message);
}

// ─── Quiz Attempts ──────────────────────────────────────────────────────────

export async function submitQuizAttempt(input: {
  quiz_id: string;
  answers: QuizAnswer[];
}): Promise<QuizAttempt> {
  const sb = requireSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const quiz = await getQuiz(input.quiz_id);
  if (!quiz) throw new Error("Quiz not found");

  // Calculate score
  const correctCount = input.answers.filter((a) => a.correct).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passing_score;

  const { data, error } = await (sb.from("quiz_attempts") as any)
    .insert({
      user_id: user.id,
      quiz_id: input.quiz_id,
      answers: input.answers,
      score,
      max_score: 100,
      passed,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update lesson progress
  await updateLessonProgress({
    lesson_slug: quiz.lesson_slug,
    status: "completed",
    quiz_score: score,
  });

  return data as QuizAttempt;
}

export async function getQuizAttempts(
  quizId: string,
  userId?: string
): Promise<QuizAttempt[]> {
  let query = requireSupabase()
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as QuizAttempt[];
}

export async function getUserBestScore(
  quizId: string,
  userId: string
): Promise<number | null> {
  const { data, error } = await requireSupabase()
    .from("quiz_attempts")
    .select("score")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const rows = data as { score: number }[];
  return (rows && rows.length > 0) ? rows[0].score : null;
}

// ─── Lesson Progress ────────────────────────────────────────────────────────

export async function getLessonProgress(
  lessonSlug: string,
  userId?: string
): Promise<LessonProgress | null> {
  const sb = requireSupabase();
  if (!userId) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    userId = user.id;
  }

  const { data, error } = await (sb.from("lesson_progress") as any)
    .select("*")
    .eq("lesson_slug", lessonSlug)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as LessonProgress | null;
}

export async function getUserProgress(
  userId?: string
): Promise<LessonProgress[]> {
  const sb = requireSupabase();
  if (!userId) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    userId = user.id;
  }

  const { data, error } = await (sb.from("lesson_progress") as any)
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as LessonProgress[];
}

export async function getClassProgress(
  classId: number
): Promise<LessonProgress[]> {
  const { data, error } = await (requireSupabase().from("lesson_progress") as any)
    .select("*")
    .eq("class_id", classId);

  if (error) throw new Error(error.message);
  return (data || []) as LessonProgress[];
}

export async function updateLessonProgress(input: {
  lesson_slug: string;
  class_id?: number;
  status: LessonProgress["status"];
  quiz_score?: number;
  time_spent?: number;
}): Promise<LessonProgress> {
  const sb = requireSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const update: any = {
    user_id: user.id,
    lesson_slug: input.lesson_slug,
    status: input.status,
    class_id: input.class_id || null,
    time_spent: input.time_spent || null,
  };

  if (input.status === "completed") {
    update.completed_at = new Date().toISOString();
    update.quiz_score = input.quiz_score ?? null;
  }

  // Use upsert
  const { data, error } = await (sb.from("lesson_progress") as any)
    .upsert(update, {
      onConflict: "user_id,lesson_slug",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LessonProgress;
}

export async function markLessonStarted(lessonSlug: string, classId?: number): Promise<void> {
  await updateLessonProgress({
    lesson_slug: lessonSlug,
    class_id: classId,
    status: "in_progress",
  });
}

export async function markLessonCompleted(lessonSlug: string, classId?: number, quizScore?: number): Promise<void> {
  await updateLessonProgress({
    lesson_slug: lessonSlug,
    class_id: classId,
    status: "completed",
    quiz_score: quizScore,
  });
}