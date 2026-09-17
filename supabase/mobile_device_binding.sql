-- ============================================================
-- MOBILE DEVICE BINDING — subscriptions + devices + security_events
-- À exécuter dans Supabase SQL Editor (idempotent, additive — voir kmm-mobile/ARCHITECTURE.md §3/§4/§6)
--
-- Contexte : kmm-mobile (app Expo) authentifie contre CE projet Supabase et appelle
-- register_device()/revoke_device() au login pour limiter le nombre d'appareils actifs par
-- compte. Ces fonctions et les tables qu'elles utilisent n'existaient pas encore ici — le client
-- mobile est déjà écrit contre ce contrat (voir kmm-mobile/src/lib/registerDevice.ts,
-- src/hooks/useDevices.ts, src/types/devices.ts) et échouait jusqu'ici avec une erreur Postgres
-- "function not found", traitée côté client comme "no_active_subscription" (voir le commentaire
-- de registerDevice.ts).
-- ============================================================

-- ── Subscriptions ───────────────────────────────────────────
-- N'existait pas : l'accès aujourd'hui est simplement "un profil existe = accès à vie" (paiement
-- Stripe unique, voir app/api/webhook/route.ts + lib/learning.ts:createOrInviteStudent). On
-- matérialise ce même modèle dans une table plutôt que de coder en dur "profil existe" dans
-- register_device — ends_at NULL = accès à vie, exactement le comportement actuel, mais ça
-- supporte un futur avec offres à durée limitée ou révocation admin sans nouvelle migration.
CREATE TABLE IF NOT EXISTS subscriptions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'vip',
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  starts_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill : chaque profil existant a payé (webhook Stripe = seul point d'entrée aujourd'hui) et a
-- donc un accès à vie sous le modèle actuel. Sans ce backfill, register_device bloquerait tous les
-- membres réels existants dès leur première connexion mobile. Idempotent (WHERE NOT EXISTS) —
-- sûr à ré-exécuter.
INSERT INTO subscriptions (user_id, plan, status, ends_at)
SELECT id, 'vip', 'active', NULL
FROM profiles
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.user_id = profiles.id);

-- Étend le trigger existant (schema.sql) pour que tout nouveau profil (invitation Stripe ou
-- création admin) reçoive automatiquement le même accès à vie par défaut, sans dépendre d'un
-- second point d'écriture dans le webhook. CREATE OR REPLACE : même trigger, juste plus complet.
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
  INSERT INTO public.subscriptions (user_id, plan, status, ends_at)
  VALUES (NEW.id, 'vip', 'active', NULL);
  RETURN NEW;
END;
$$;

-- ── Devices ─────────────────────────────────────────────────
-- Colonnes alignées 1:1 sur DeviceRow (kmm-mobile/src/types/devices.ts) — ne pas renommer sans
-- mettre à jour ce type. Pas de colonne IP ici : l'IP est journalisée dans security_events
-- (ci-dessous), pas conservée sur l'appareil lui-même.
CREATE TABLE IF NOT EXISTS devices (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  device_id    TEXT NOT NULL,
  device_name  TEXT,
  os           TEXT,
  os_version   TEXT,
  app_version  TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

-- ── Security events ─────────────────────────────────────────
-- Journal d'audit (nouvel appareil, appareil bloqué, révocation, refus faute d'abonnement) — pas
-- de lecture directe côté app aujourd'hui, réservé au futur outillage admin (is_admin()).
CREATE TABLE IF NOT EXISTS security_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  device_id  TEXT,
  ip         TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- subscriptions : lecture propre + admin, aucune écriture directe (webhook/trigger via
-- SECURITY DEFINER, ou admin via service role qui bypass RLS de toute façon).
CREATE POLICY "Lecture abonnement propre" ON subscriptions FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- devices : lecture propre + admin ; toute écriture passe par register_device/revoke_device
-- (SECURITY DEFINER ci-dessous), jamais directement par le client.
CREATE POLICY "Lecture appareils propres" ON devices FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- security_events : admin uniquement (pas de policy pour l'utilisateur courant).
CREATE POLICY "Admin lit les événements sécurité" ON security_events FOR SELECT USING (is_admin());

-- ============================================================
-- RPC : register_device
-- ============================================================
-- Limite : 2 appareils actifs par compte (voir kmm-mobile/ARCHITECTURE.md §6). Un appareil déjà
-- connu (actif) ne consomme pas une place supplémentaire ; le réactiver après révocation en
-- consomme une comme un appareil neuf (sinon révoquer/re-enregistrer immédiatement contournerait
-- la limite).
CREATE OR REPLACE FUNCTION register_device(
  p_device_id   TEXT,
  p_device_name TEXT,
  p_os          TEXT,
  p_os_version  TEXT,
  p_app_version TEXT,
  p_ip          TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id        UUID := auth.uid();
  v_has_access     BOOLEAN;
  v_existing       devices%ROWTYPE;
  v_device_existed BOOLEAN;
  v_active_count   INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'register_device: no authenticated user';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = v_user_id AND status = 'active' AND (ends_at IS NULL OR ends_at > NOW())
  ) INTO v_has_access;

  IF NOT v_has_access THEN
    INSERT INTO security_events (user_id, event_type, device_id, ip)
    VALUES (v_user_id, 'register_device_no_subscription', p_device_id, p_ip);
    RETURN jsonb_build_object('status', 'no_active_subscription');
  END IF;

  SELECT * INTO v_existing FROM devices WHERE user_id = v_user_id AND device_id = p_device_id;
  -- Capturé immédiatement : FOUND serait sinon écrasé par le SELECT COUNT(*) juste en dessous
  -- (une requête d'agrégat sans GROUP BY renvoie toujours exactement une ligne, donc FOUND passerait
  -- systématiquement à TRUE après elle, quel que soit le résultat de CE SELECT-ci).
  v_device_existed := FOUND;

  IF v_device_existed AND v_existing.status = 'active' THEN
    UPDATE devices
    SET device_name = p_device_name, os = p_os, os_version = p_os_version,
        app_version = p_app_version, last_seen_at = NOW()
    WHERE id = v_existing.id;
    RETURN jsonb_build_object('status', 'ok');
  END IF;

  SELECT COUNT(*) INTO v_active_count FROM devices WHERE user_id = v_user_id AND status = 'active';

  IF v_active_count >= 2 THEN
    INSERT INTO security_events (user_id, event_type, device_id, ip)
    VALUES (v_user_id, 'register_device_limit_reached', p_device_id, p_ip);
    RETURN jsonb_build_object('status', 'device_limit_reached');
  END IF;

  IF v_device_existed THEN
    -- Réactivation d'un appareil précédemment révoqué : compte comme un nouvel appareil pour la
    -- limite (déjà vérifiée ci-dessus), mais on garde la même ligne (historique last_seen_at).
    UPDATE devices
    SET status = 'active', revoked_at = NULL, device_name = p_device_name, os = p_os,
        os_version = p_os_version, app_version = p_app_version, last_seen_at = NOW()
    WHERE id = v_existing.id;
  ELSE
    INSERT INTO devices (user_id, device_id, device_name, os, os_version, app_version)
    VALUES (v_user_id, p_device_id, p_device_name, p_os, p_os_version, p_app_version);
  END IF;

  INSERT INTO security_events (user_id, event_type, device_id, ip)
  VALUES (v_user_id, 'register_device_new', p_device_id, p_ip);

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- ============================================================
-- RPC : revoke_device
-- ============================================================
-- Cooldown 14 jours entre deux révocations par compte (voir kmm-mobile/ARCHITECTURE.md §6) — sans
-- ça, révoquer/re-enregistrer en boucle contournerait la limite de 2 appareils. Le cooldown est
-- dérivé de security_events plutôt que d'une colonne dédiée : une seule source de vérité pour
-- l'historique des révocations.
CREATE OR REPLACE FUNCTION revoke_device(p_device_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_last_revoke  TIMESTAMPTZ;
  v_available_at TIMESTAMPTZ;
  v_device_id    UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'revoke_device: no authenticated user';
  END IF;

  SELECT MAX(created_at) INTO v_last_revoke
  FROM security_events
  WHERE user_id = v_user_id AND event_type = 'revoke_device';

  IF v_last_revoke IS NOT NULL AND v_last_revoke + INTERVAL '14 days' > NOW() THEN
    v_available_at := v_last_revoke + INTERVAL '14 days';
    RETURN jsonb_build_object('status', 'cooldown', 'available_at', v_available_at);
  END IF;

  SELECT id INTO v_device_id
  FROM devices
  WHERE user_id = v_user_id AND device_id = p_device_id AND status = 'active';

  -- Idempotent : déjà révoqué ou introuvable pour ce compte → succès silencieux plutôt qu'une
  -- erreur (le client ne distingue pas ce cas, voir useRevokeDevice dans kmm-mobile).
  IF v_device_id IS NULL THEN
    RETURN jsonb_build_object('status', 'ok');
  END IF;

  UPDATE devices SET status = 'revoked', revoked_at = NOW() WHERE id = v_device_id;

  INSERT INTO security_events (user_id, event_type, device_id)
  VALUES (v_user_id, 'revoke_device', p_device_id);

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

GRANT EXECUTE ON FUNCTION register_device(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_device(TEXT) TO authenticated;
