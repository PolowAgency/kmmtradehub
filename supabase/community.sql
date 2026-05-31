-- ============================================================
-- COMMUNAUTÉ + CHAT + LIVE — À exécuter dans Supabase SQL Editor
-- ============================================================

-- ── Catégories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT DEFAULT '📌',
  order_index INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Posts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  category_id UUID REFERENCES community_categories(id) ON DELETE SET NULL,
  author_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  is_pinned   BOOLEAN DEFAULT FALSE,
  views       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Pièces jointes (admin only) ───────────────────────────────
CREATE TABLE IF NOT EXISTS community_attachments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  url        TEXT NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT CHECK (type IN ('image','pdf','video','link')) DEFAULT 'link',
  file_size  BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Commentaires (membres) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id  UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Likes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- ── Signalements ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_reports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id  UUID REFERENCES community_comments(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, reporter_id)
);

-- ── Chat global ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_pinned  BOOLEAN DEFAULT FALSE,
  deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Logs modération chat ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_moderation_logs (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action    TEXT CHECK (action IN ('delete_message','pin_message','unpin_message','block_user')),
  target_id UUID,
  reason    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lives ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lives (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  stream_url       TEXT,
  thumbnail_url    TEXT,
  status           TEXT CHECK (status IN ('scheduled','live','ended')) DEFAULT 'scheduled',
  category_id      UUID REFERENCES community_categories(id) ON DELETE SET NULL,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Messages live ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id    UUID REFERENCES lives(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Replays ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_replays (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id          UUID REFERENCES lives(id) ON DELETE CASCADE NOT NULL,
  url              TEXT NOT NULL,
  title            TEXT,
  duration_minutes INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Participants live ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_attendees (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id   UUID REFERENCES lives(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(live_id, user_id)
);

-- ============================================================
-- ACTIVER RLS
-- ============================================================
ALTER TABLE community_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_attachments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lives                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_replays           ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendees         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES — community_categories
-- ============================================================
CREATE POLICY "Cat visibles connectés"      ON community_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin gère catégories"       ON community_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update catégories"     ON community_categories FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete catégories"     ON community_categories FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — community_posts
-- ============================================================
CREATE POLICY "Posts publiés visibles"      ON community_posts FOR SELECT USING (is_published = TRUE OR is_admin());
CREATE POLICY "Admin crée posts"            ON community_posts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin modifie posts"         ON community_posts FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin supprime posts"        ON community_posts FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — community_attachments
-- ============================================================
CREATE POLICY "PJ posts publiés visibles"
  ON community_attachments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM community_posts WHERE id = community_attachments.post_id AND (is_published = TRUE OR is_admin()))
  );
CREATE POLICY "Admin ajoute PJ"             ON community_attachments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin supprime PJ"           ON community_attachments FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — community_comments
-- ============================================================
CREATE POLICY "Commentaires visibles"
  ON community_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM community_posts WHERE id = community_comments.post_id AND (is_published = TRUE OR is_admin()))
  );
CREATE POLICY "Membres commentent"          ON community_comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Membre modifie son cmt"      ON community_comments FOR UPDATE USING (author_id = auth.uid() OR is_admin()) WITH CHECK (author_id = auth.uid() OR is_admin());
CREATE POLICY "Admin supprime cmt"          ON community_comments FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — community_likes
-- ============================================================
CREATE POLICY "Likes visibles connectés"    ON community_likes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre like"                 ON community_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre unlike"               ON community_likes FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- POLICIES — comment_reports
-- ============================================================
CREATE POLICY "Admin voit signalements"     ON comment_reports FOR SELECT USING (is_admin());
CREATE POLICY "Membre signale"              ON comment_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- ============================================================
-- POLICIES — chat_messages
-- ============================================================
CREATE POLICY "Chat lisible connectés"      ON chat_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre envoie message"       ON chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin modère chat"           ON chat_messages FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin supprime message"      ON chat_messages FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — chat_moderation_logs
-- ============================================================
CREATE POLICY "Admin voit logs modération"  ON chat_moderation_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admin insère log modération" ON chat_moderation_logs FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- POLICIES — lives
-- ============================================================
CREATE POLICY "Lives visibles connectés"    ON lives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin crée live"             ON lives FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin modifie live"          ON lives FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin supprime live"         ON lives FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — live_messages
-- ============================================================
CREATE POLICY "Messages live visibles"      ON live_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre chat live"            ON live_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin modère live chat"      ON live_messages FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — live_replays
-- ============================================================
CREATE POLICY "Replays visibles connectés"  ON live_replays FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin ajoute replay"         ON live_replays FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin supprime replay"       ON live_replays FOR DELETE USING (is_admin());

-- ============================================================
-- POLICIES — live_attendees
-- ============================================================
CREATE POLICY "Participants visibles"       ON live_attendees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Membre rejoint live"         ON live_attendees FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre quitte live"          ON live_attendees FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- SEED — Catégories
-- ============================================================
INSERT INTO community_categories (name, slug, icon, order_index) VALUES
  ('Annonces KMM',       'annonces',       '📢', 1),
  ('Analyses de marché', 'analyses',       '📊', 2),
  ('Psychologie',        'psychologie',    '🧠', 3),
  ('Gestion du risque',  'risque',         '🛡️', 4),
  ('Questions fréquentes','faq',           '❓', 5),
  ('Ressources',         'ressources',     '📚', 6),
  ('Lives',              'lives',          '🎙️', 7),
  ('Mises à jour',       'mises-a-jour',   '🔄', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Storage bucket : community-admin-files
-- (créer manuellement dans Supabase > Storage, puis appliquer policy)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('community-admin-files', 'community-admin-files', true)
-- ON CONFLICT DO NOTHING;

-- Storage RLS (à activer dans Supabase Storage > Policies) :
-- SELECT : bucket_id = 'community-admin-files'         → auth.uid() IS NOT NULL
-- INSERT : bucket_id = 'community-admin-files'         → is_admin()
-- DELETE : bucket_id = 'community-admin-files'         → is_admin()
