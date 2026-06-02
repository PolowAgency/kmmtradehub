-- ============================================================
-- FIX : Onboarding + Badges
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Ajouter la colonne onboarding_done au profil
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Ajouter une contrainte UNIQUE sur badges.name (nécessaire pour ON CONFLICT)
DO $$ BEGIN
  ALTER TABLE badges ADD CONSTRAINT badges_name_unique UNIQUE (name);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 3. Insérer les badges par défaut
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
  ('Premier pas',     'Complète ta première leçon',         '🎯', 'lessons_completed', 1),
  ('Sur la lancée',   'Complète 5 leçons',                  '🔥', 'lessons_completed', 5),
  ('Trader en herbe', 'Complète 10 leçons',                 '📈', 'lessons_completed', 10),
  ('Assidu',          'Maintiens un streak de 7 jours',     '📅', 'streak_days',       7),
  ('Régulier',        'Maintiens un streak de 30 jours',    '💎', 'streak_days',       30),
  ('Expert quiz',     'Réussis 3 quiz',                     '✅', 'quiz_passed',       3),
  ('Maître quiz',     'Réussis 10 quiz',                    '🏅', 'quiz_passed',       10),
  ('Module complet',  'Termine un module en entier',        '🏆', 'module_completed',  1),
  ('Tout maîtriser',  'Termine 3 modules en entier',        '👑', 'module_completed',  3)
ON CONFLICT (name) DO NOTHING;

-- 3. Policy pour que l'élève puisse mettre à jour son propre onboarding_done
-- (la policy UPDATE existante couvre déjà le profil entier)
