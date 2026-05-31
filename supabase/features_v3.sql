-- ============================================================
-- FEATURES V3 — Journal de trading + Notes de leçon
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- ── Journal de trading ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS trading_journal (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  traded_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  pair         TEXT NOT NULL,
  direction    TEXT CHECK (direction IN ('long', 'short')) NOT NULL,
  entry_price  NUMERIC,
  exit_price   NUMERIC,
  lot_size     NUMERIC,
  rr           NUMERIC,
  pnl          NUMERIC,
  result       TEXT CHECK (result IN ('win', 'loss', 'breakeven')) NOT NULL,
  emotion      TEXT CHECK (emotion IN ('confident', 'fearful', 'greedy', 'neutral', 'frustrated')),
  screenshot_url TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notes de leçon ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_notes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE trading_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes    ENABLE ROW LEVEL SECURITY;

-- trading_journal
CREATE POLICY "Journal visible owner+admin" ON trading_journal FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Membre crée trade"           ON trading_journal FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre modifie trade"        ON trading_journal FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre supprime trade"       ON trading_journal FOR DELETE USING (user_id = auth.uid());

-- lesson_notes
CREATE POLICY "Notes visibles owner"   ON lesson_notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Membre crée note"       ON lesson_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre modifie note"    ON lesson_notes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Membre supprime note"   ON lesson_notes FOR DELETE USING (user_id = auth.uid());
