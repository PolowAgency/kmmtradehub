-- ============================================================
-- DMs — Messages privés entre membres
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS direct_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dm_sender_idx    ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS dm_recipient_idx ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS dm_created_idx   ON direct_messages(created_at DESC);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Lire ses propres messages (envoyés ou reçus)
CREATE POLICY "Lire ses DMs" ON direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Envoyer un message (sender = soi-même)
CREATE POLICY "Envoyer un DM" ON direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Marquer comme lu (recipient = soi-même)
CREATE POLICY "Marquer DM lu" ON direct_messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Activer Realtime sur la table
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
