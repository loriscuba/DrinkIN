-- 01_schema.sql — DrinkIN: menu bar con QR code per i tavoli.
-- Tutto nello schema "drinkin". Lettura pubblica (anon) per il menu;
-- scrittura solo per gli utenti elencati in drinkin.admin. Idempotente: si può rieseguire.
-- Dopo l'esecuzione: Project Settings → Data API → Exposed schemas → aggiungere "drinkin".

CREATE SCHEMA IF NOT EXISTS drinkin;
GRANT USAGE ON SCHEMA drinkin TO anon, authenticated, service_role;

-- Amministratori (utenti Supabase Auth abilitati a modificare il menu)
CREATE TABLE IF NOT EXISTS drinkin.admin (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE drinkin.admin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_read" ON drinkin.admin;
CREATE POLICY "self_read" ON drinkin.admin FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON drinkin.admin FROM anon;
GRANT SELECT ON drinkin.admin TO authenticated;

-- Helper: l'utente corrente è amministratore?
CREATE OR REPLACE FUNCTION drinkin.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM drinkin.admin WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION drinkin.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION drinkin.is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS drinkin.categorie (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL UNIQUE,
  ordine     integer NOT NULL DEFAULT 0,
  attiva     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drinkin.prodotti (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES drinkin.categorie(id) ON DELETE RESTRICT,
  nome         text NOT NULL,
  variante     text,
  descrizione  text,
  prezzo       numeric(7,2) NOT NULL CHECK (prezzo >= 0),
  surgelato    boolean NOT NULL DEFAULT false,
  disponibile  boolean NOT NULL DEFAULT true,
  ordine       integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prodotti_categoria_idx ON drinkin.prodotti (categoria_id, ordine);

CREATE TABLE IF NOT EXISTS drinkin.tavoli (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etichetta  text NOT NULL UNIQUE,   -- es. "1", "12", "Terrazza 3"
  ordine     integer NOT NULL DEFAULT 0,
  attivo     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Impostazioni (riga singola, id = 1)
CREATE TABLE IF NOT EXISTS drinkin.impostazioni (
  id          smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome_bar    text NOT NULL DEFAULT 'Il nostro Bar',
  sottotitolo text,
  nota_piede  text DEFAULT '* Prodotto surgelato. Per informazioni su allergeni chiedere al personale.',
  updated_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO drinkin.impostazioni (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Traduzioni: {"en": {"nome": ..., "descrizione": ..., "variante": ...}, "fr": {...}, "de": {...}}
-- (impostazioni: {"en": {"nota_piede": ...}, ...}). Se manca una traduzione il menu mostra l'italiano.
ALTER TABLE drinkin.categorie    ADD COLUMN IF NOT EXISTS i18n jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(i18n) = 'object');
ALTER TABLE drinkin.prodotti     ADD COLUMN IF NOT EXISTS i18n jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(i18n) = 'object');
ALTER TABLE drinkin.impostazioni ADD COLUMN IF NOT EXISTS i18n jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(i18n) = 'object');

-- updated_at automatico
CREATE OR REPLACE FUNCTION drinkin.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prodotti_touch ON drinkin.prodotti;
CREATE TRIGGER prodotti_touch BEFORE UPDATE ON drinkin.prodotti
  FOR EACH ROW EXECUTE FUNCTION drinkin.touch_updated_at();

DROP TRIGGER IF EXISTS impostazioni_touch ON drinkin.impostazioni;
CREATE TRIGGER impostazioni_touch BEFORE UPDATE ON drinkin.impostazioni
  FOR EACH ROW EXECUTE FUNCTION drinkin.touch_updated_at();

-- RLS
ALTER TABLE drinkin.categorie    ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinkin.prodotti     ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinkin.tavoli       ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinkin.impostazioni ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['categorie','prodotti','tavoli','impostazioni'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read" ON drinkin.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_insert" ON drinkin.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_update" ON drinkin.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_delete" ON drinkin.%I', t);
    EXECUTE format('CREATE POLICY "public_read" ON drinkin.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "admin_insert" ON drinkin.%I FOR INSERT TO authenticated WITH CHECK ((SELECT drinkin.is_admin()))', t);
    EXECUTE format('CREATE POLICY "admin_update" ON drinkin.%I FOR UPDATE TO authenticated USING ((SELECT drinkin.is_admin())) WITH CHECK ((SELECT drinkin.is_admin()))', t);
    EXECUTE format('CREATE POLICY "admin_delete" ON drinkin.%I FOR DELETE TO authenticated USING ((SELECT drinkin.is_admin()))', t);
  END LOOP;
END $$;

GRANT SELECT ON drinkin.categorie, drinkin.prodotti, drinkin.tavoli, drinkin.impostazioni TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON drinkin.categorie, drinkin.prodotti, drinkin.tavoli, drinkin.impostazioni TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA drinkin TO service_role;
