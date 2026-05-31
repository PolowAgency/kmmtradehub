-- ============================================================
-- FIXES — À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Verrouiller la création de rôle à "student" lors de l'inscription
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

-- 2. Permettre aux élèves d'insérer leurs propres badges
DROP POLICY IF EXISTS "Admin attribue badges" ON student_badges;
DROP POLICY IF EXISTS "Elève ou admin insère badges" ON student_badges;

CREATE POLICY "Elève ou admin insère badges"
  ON student_badges FOR INSERT
  WITH CHECK (student_id = auth.uid() OR is_admin());

-- 3. Restreindre la lecture des réponses de quiz aux admins
DROP POLICY IF EXISTS "Réponses lisibles" ON quiz_answers;

CREATE POLICY "Admin lit réponses"
  ON quiz_answers FOR SELECT
  USING (is_admin());

-- 4. Trigger : créer automatiquement un enregistrement streaks
--    quand un nouveau profil est créé (inscription)
CREATE OR REPLACE FUNCTION create_streak_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO streaks (student_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_streak_for_new_user();

-- 5. Restreindre la lecture des ressources et quiz aux contenus publiés
DROP POLICY IF EXISTS "Ressources lisibles" ON lesson_resources;
DROP POLICY IF EXISTS "Ressources publiées lisibles" ON lesson_resources;
CREATE POLICY "Ressources publiées lisibles"
  ON lesson_resources FOR SELECT
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

DROP POLICY IF EXISTS "Quiz lisibles" ON quizzes;
DROP POLICY IF EXISTS "Quiz publiés lisibles" ON quizzes;
CREATE POLICY "Quiz publiés lisibles"
  ON quizzes FOR SELECT
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

DROP POLICY IF EXISTS "Questions lisibles" ON quiz_questions;
DROP POLICY IF EXISTS "Questions de quiz publiés lisibles" ON quiz_questions;
CREATE POLICY "Questions de quiz publiés lisibles"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
    )
    OR is_admin()
  );

-- 6. Insérer les streaks manquants pour les utilisateurs existants
INSERT INTO streaks (student_id, current_streak, longest_streak)
SELECT id, 0, 0 FROM profiles
ON CONFLICT (student_id) DO NOTHING;
