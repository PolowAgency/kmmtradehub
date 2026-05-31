-- ============================================================
-- KMM TRADE — Schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Modules ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  level            TEXT CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  duration_minutes INT DEFAULT 0,
  thumbnail_url    TEXT,
  order_index      INT NOT NULL DEFAULT 0,
  is_published     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lessons ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id        UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title            TEXT NOT NULL,
  content          TEXT,
  order_index      INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  is_published     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lesson Resources ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_resources (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  type       TEXT CHECK (type IN ('pdf', 'audio', 'video', 'link')) NOT NULL,
  url        TEXT NOT NULL,
  file_size  BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Quizzes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id     UUID REFERENCES lessons(id) ON DELETE CASCADE,
  module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  passing_score INT DEFAULT 70,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Quiz Questions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id     UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question    TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Quiz Answers ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_answers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  answer      TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT FALSE,
  order_index INT NOT NULL DEFAULT 0
);

-- ── Student Progress ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_progress (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id        UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed        BOOLEAN DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- ── Quiz Results ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id      UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  score        INT NOT NULL CHECK (score >= 0 AND score <= 100),
  passed       BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Badges ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  icon             TEXT DEFAULT '🏆',
  condition_type   TEXT CHECK (condition_type IN ('lessons_completed', 'streak_days', 'quiz_passed', 'module_completed')),
  condition_value  INT DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Student Badges ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_badges (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id   UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- ── Streaks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak     INT DEFAULT 0,
  longest_streak     INT DEFAULT 0,
  last_activity_date DATE,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_modules_updated_at     BEFORE UPDATE ON modules     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lessons_updated_at     BEFORE UPDATE ON lessons     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quizzes_updated_at     BEFORE UPDATE ON quizzes     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_streaks_updated_at     BEFORE UPDATE ON streaks     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks         ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles
CREATE POLICY "Lecture profil propre"     ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Mise à jour profil propre" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin insert profiles"     ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update profiles"     ON profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete profiles"     ON profiles FOR DELETE USING (is_admin());

-- modules
CREATE POLICY "Modules publiés lisibles"  ON modules FOR SELECT USING (is_published = TRUE OR is_admin());
CREATE POLICY "Admin insert modules"      ON modules FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update modules"      ON modules FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete modules"      ON modules FOR DELETE USING (is_admin());

-- lessons
CREATE POLICY "Leçons publiées lisibles"  ON lessons FOR SELECT USING (is_published = TRUE OR is_admin());
CREATE POLICY "Admin insert lessons"      ON lessons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update lessons"      ON lessons FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete lessons"      ON lessons FOR DELETE USING (is_admin());

-- lesson_resources
CREATE POLICY "Ressources publiées lisibles" ON lesson_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      WHERE lessons.id = lesson_resources.lesson_id
        AND lessons.is_published = TRUE
        AND modules.is_published = TRUE
    )
    OR is_admin()
  );
CREATE POLICY "Admin insert resources"    ON lesson_resources FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update resources"    ON lesson_resources FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete resources"    ON lesson_resources FOR DELETE USING (is_admin());

-- quizzes
CREATE POLICY "Quiz publiés lisibles"     ON quizzes
  FOR SELECT
  USING (
    (
      lesson_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM lessons
        JOIN modules ON modules.id = lessons.module_id
        WHERE lessons.id = quizzes.lesson_id
          AND lessons.is_published = TRUE
          AND modules.is_published = TRUE
      )
    )
    OR (
      module_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM modules
        WHERE modules.id = quizzes.module_id
          AND modules.is_published = TRUE
      )
    )
    OR is_admin()
  );
CREATE POLICY "Admin insert quizzes"      ON quizzes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update quizzes"      ON quizzes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete quizzes"      ON quizzes FOR DELETE USING (is_admin());

-- quiz_questions
CREATE POLICY "Questions de quiz publiés lisibles" ON quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
    )
    OR is_admin()
  );
CREATE POLICY "Admin insert questions"    ON quiz_questions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update questions"    ON quiz_questions FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete questions"    ON quiz_questions FOR DELETE USING (is_admin());

-- quiz_answers
CREATE POLICY "Admin lit réponses"        ON quiz_answers FOR SELECT USING (is_admin());
CREATE POLICY "Admin insert answers"      ON quiz_answers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update answers"      ON quiz_answers FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete answers"      ON quiz_answers FOR DELETE USING (is_admin());

-- student_progress
CREATE POLICY "Progression propre"        ON student_progress FOR SELECT USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "Upsert progression propre" ON student_progress FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Update progression propre" ON student_progress FOR UPDATE USING (student_id = auth.uid());

-- quiz_results
CREATE POLICY "Résultats propres"         ON quiz_results FOR SELECT USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "Insérer résultat propre"   ON quiz_results FOR INSERT WITH CHECK (student_id = auth.uid());

-- badges
CREATE POLICY "Badges lisibles"           ON badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin insert badges"       ON badges FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update badges"       ON badges FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete badges"       ON badges FOR DELETE USING (is_admin());

-- student_badges
CREATE POLICY "Badges élève propres"      ON student_badges FOR SELECT USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "Élève ou admin attribue badges" ON student_badges
  FOR INSERT
  WITH CHECK (student_id = auth.uid() OR is_admin());
CREATE POLICY "Admin delete badges élève" ON student_badges FOR DELETE USING (is_admin());

-- streaks
CREATE POLICY "Streak propre"             ON streaks FOR SELECT USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "Upsert streak propre"      ON streaks FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Update streak propre"      ON streaks FOR UPDATE USING (student_id = auth.uid());

-- ============================================================
-- Storage buckets
-- ============================================================
-- À créer dans Supabase Dashboard > Storage :
-- • pdf-resources     (public: false)
-- • audio-resources   (public: false)
-- • video-resources   (public: false)
-- • thumbnails        (public: true)

-- ============================================================
-- Données initiales — Badges
-- ============================================================
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
  ('Premier pas',    'Complète ta première leçon',         '🎯', 'lessons_completed', 1),
  ('Sur la lancée',  'Complète 5 leçons',                  '🔥', 'lessons_completed', 5),
  ('Assidu',         'Maintiens un streak de 7 jours',     '📅', 'streak_days',       7),
  ('Expert quiz',    'Réussis 3 quiz',                     '✅', 'quiz_passed',       3),
  ('Module complet', 'Termine un module en entier',        '🏆', 'module_completed',  1),
  ('Trader en herbe','Complète 10 leçons',                 '📈', 'lessons_completed', 10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Données initiales — Modules
-- ============================================================
INSERT INTO modules (title, description, level, duration_minutes, order_index, is_published) VALUES
  ('Bases du trading',        'Comprendre les fondamentaux : marchés, acteurs, mécanismes.',      'debutant',      45,  1, TRUE),
  ('Comprendre les marchés',  'Forex, indices, matières premières — fonctionnement global.',      'debutant',      60,  2, TRUE),
  ('Gestion du risque',       'Dimensionner ses positions, protéger son capital.',                'intermediaire', 90,  3, TRUE),
  ('Analyse technique',       'Lire les graphiques, identifier les structures de prix.',          'intermediaire', 120, 4, TRUE),
  ('Psychologie du trader',   'Gérer ses émotions et biais cognitifs en trading.',                'intermediaire', 75,  5, TRUE),
  ('Construire une routine',  'Créer un processus de trading reproductible au quotidien.',        'avance',        60,  6, FALSE),
  ('Erreurs à éviter',        'Les pièges classiques et comment les contourner.',                 'avance',        50,  7, FALSE)
ON CONFLICT DO NOTHING;
