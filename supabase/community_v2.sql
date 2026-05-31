-- ============================================================
-- COMMUNAUTÉ V2 — À exécuter dans Supabase SQL Editor
-- ============================================================

-- ── Réactions emoji (remplace les likes simples) ─────────────
CREATE TABLE IF NOT EXISTS community_reactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id    UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('fire','check','target','pray','laugh')) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- ── Bookmarks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ── Questions live ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_questions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id     UUID REFERENCES lives(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Rappels avant live ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_reminders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id    UUID REFERENCES lives(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email      TEXT NOT NULL,
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(live_id, user_id)
);

-- ── Suivi dernière visite communauté (notifications badge) ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_last_seen_at TIMESTAMPTZ;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE community_reactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_bookmarks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_reminders       ENABLE ROW LEVEL SECURITY;

-- community_reactions
CREATE POLICY "Reactions visibles connectés" ON community_reactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre réagit"                ON community_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre change réaction"       ON community_reactions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre retire réaction"       ON community_reactions FOR DELETE USING (user_id = auth.uid());

-- community_bookmarks
CREATE POLICY "Bookmarks propres"            ON community_bookmarks FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Membre sauvegarde"            ON community_bookmarks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre supprime bookmark"     ON community_bookmarks FOR DELETE USING (user_id = auth.uid());

-- live_questions
CREATE POLICY "Questions live visibles"      ON live_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre pose question"         ON live_questions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin répond question"        ON live_questions FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin supprime question"      ON live_questions FOR DELETE USING (is_admin());

-- live_reminders
CREATE POLICY "Rappels propres"              ON live_reminders FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Membre s'inscrit rappel"      ON live_reminders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre annule rappel"         ON live_reminders FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Système marque envoyé"        ON live_reminders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
