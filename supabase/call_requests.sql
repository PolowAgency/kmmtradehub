-- ============================================================
-- Appels 1:1 — Réservation de sessions avec KMM
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS call_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic        TEXT NOT NULL,
  message      TEXT,
  slot_1       TIMESTAMPTZ NOT NULL,
  slot_2       TIMESTAMPTZ,
  slot_3       TIMESTAMPTZ,
  contact      TEXT NOT NULL,              -- téléphone ou WhatsApp
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  confirmed_slot TIMESTAMPTZ,             -- le créneau retenu par Kevin
  admin_note   TEXT,                      -- message de Kevin à l'élève
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS call_requests_student_idx ON call_requests(student_id);
CREATE INDEX IF NOT EXISTS call_requests_status_idx  ON call_requests(status);
CREATE INDEX IF NOT EXISTS call_requests_created_idx ON call_requests(created_at DESC);

ALTER TABLE call_requests ENABLE ROW LEVEL SECURITY;

-- Élève : voir ses propres demandes
CREATE POLICY "Élève voit ses appels" ON call_requests
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

-- Élève : créer une demande
CREATE POLICY "Élève crée un appel" ON call_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Admin : tout modifier
CREATE POLICY "Admin gère les appels" ON call_requests
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admin supprime les appels" ON call_requests
  FOR DELETE USING (is_admin());
