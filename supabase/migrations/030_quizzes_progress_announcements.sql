-- Migration 030: Quizzes, Announcements, Lesson Progress, Gradebook
-- Supports: quiz system, class announcements, lesson progress tracking, gradebook view

-- ══════════════════════════════════════════════════════════════════════════
-- LESSON PROGRESS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  class_id INTEGER REFERENCES public.classes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  quiz_score INTEGER,
  time_spent INTEGER, -- seconds
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_class ON public.lesson_progress(class_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_slug);

-- ══════════════════════════════════════════════════════════════════════════
-- LESSON QUIZZES
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_slug TEXT NOT NULL,
  quiz_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (quiz_type IN ('multiple_choice', 'true_false', 'fill_blank', 'mixed')),
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.lesson_quizzes(lesson_slug);

-- ══════════════════════════════════════════════════════════════════════════
-- QUIZ ATTEMPTS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- ══════════════════════════════════════════════════════════════════════════
-- CLASS ANNOUNCEMENTS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.class_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_class ON public.class_announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.class_announcements(class_id, pinned);

-- ══════════════════════════════════════════════════════════════════════════
-- CLASS ASSIGNMENTS (enhanced with due_date, section_name, notes)
-- ══════════════════════════════════════════════════════════════════════════

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_assignments' AND column_name = 'due_date') THEN
    ALTER TABLE public.class_assignments ADD COLUMN due_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_assignments' AND column_name = 'section_name') THEN
    ALTER TABLE public.class_assignments ADD COLUMN section_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_assignments' AND column_name = 'notes') THEN
    ALTER TABLE public.class_assignments ADD COLUMN notes TEXT;
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_announcements ENABLE ROW LEVEL SECURITY;

-- lesson_progress: users can see/update their own progress; catechists can see class progress
CREATE POLICY "Users can view own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- lesson_quizzes: anyone authenticated can read; only catechists/admins can write
CREATE POLICY "Authenticated users can read quizzes" ON public.lesson_quizzes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Catechists can manage quizzes" ON public.lesson_quizzes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.catechist_profiles WHERE user_id = auth.uid())
  );

-- quiz_attempts: users can submit and view their own
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- class_announcements: class members can read; catechists can write
CREATE POLICY "Class members can read announcements" ON public.class_announcements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.class_students WHERE class_id = class_announcements.class_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.class_catechists WHERE class_id = class_announcements.class_id AND catechist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.classes WHERE id = class_announcements.class_id AND catechist_id = auth.uid())
  );

CREATE POLICY "Catechists can manage announcements" ON public.class_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.catechist_profiles WHERE user_id = auth.uid())
  );

-- ══════════════════════════════════════════════════════════════════════════
-- UPDATED AT TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lesson_progress_updated ON public.lesson_progress;
CREATE TRIGGER trigger_lesson_progress_updated
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_lesson_quizzes_updated ON public.lesson_quizzes;
CREATE TRIGGER trigger_lesson_quizzes_updated
  BEFORE UPDATE ON public.lesson_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_class_announcements_updated ON public.class_announcements;
CREATE TRIGGER trigger_class_announcements_updated
  BEFORE UPDATE ON public.class_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();