-- ============================================================
-- Proyecto Catecismo — Quiz & Progress Tables Migration 031
-- lesson_quizzes, quiz_attempts, lesson_progress
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── lesson_quizzes ──────────────────────────────────────────
-- Stores quiz definitions per lesson. A lesson can have multiple quizzes.
-- questions is a JSONB array of question objects.
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,            -- matches lesson_slug / lesson_path
  quiz_type text NOT NULL DEFAULT 'multiple_choice'
    CHECK (quiz_type IN ('multiple_choice', 'true_false', 'fill_blank', 'mixed')),
  title_es text,
  title_en text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array of question objects
  passing_score integer NOT NULL DEFAULT 70,      -- percentage to pass
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_quizzes_lesson ON lesson_quizzes(lesson_id);
CREATE INDEX idx_lesson_quizzes_published ON lesson_quizzes(is_published) WHERE is_published = true;

-- ─── quiz_attempts ───────────────────────────────────────────
-- Records each student attempt at a quiz.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES lesson_quizzes(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,     -- array of { question_id, selected }
  score integer NOT NULL DEFAULT 0,                -- percentage 0–100
  correct_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_spent_seconds integer,                      -- optional time tracking
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);

-- ─── lesson_progress ─────────────────────────────────────────
-- Tracks student progress on individual lessons within a class context.
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,                          -- matches lesson_slug
  class_id integer REFERENCES classes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  notes text,                                       -- optional student notes
  UNIQUE(user_id, lesson_id, class_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_class ON lesson_progress(class_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);
CREATE INDEX idx_lesson_progress_user_class ON lesson_progress(user_id, class_id);

-- ─── RLS Policies ────────────────────────────────────────────

-- lesson_quizzes: catechists/admins manage, students read published
ALTER TABLE lesson_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published quizzes are visible to all authenticated users" ON lesson_quizzes
  FOR SELECT USING (
    is_published = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
  );

CREATE POLICY "Catechists and admins can create quizzes" ON lesson_quizzes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
  );

CREATE POLICY "Catechists and admins can update quizzes" ON lesson_quizzes
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

CREATE POLICY "Catechists and admins can delete quizzes" ON lesson_quizzes
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- quiz_attempts: students can insert their own, catechists see class results
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can see own attempts" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Catechists see attempts in their classes" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE cs.student_id = quiz_attempts.user_id
      AND c.catechist_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
  );

CREATE POLICY "Students can create own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students cannot update attempts" ON quiz_attempts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- lesson_progress: students manage own, catechists see class progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own progress" ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Catechists see progress in their classes" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE cs.student_id = lesson_progress.user_id
      AND c.catechist_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
  );

CREATE POLICY "Students can insert own progress" ON lesson_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own progress" ON lesson_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all progress" ON lesson_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- ─── Trigger: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON lesson_quizzes;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON lesson_quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();