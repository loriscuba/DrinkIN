-- 03_aggiungi_admin.sql — abilita un utente come amministratore del menu.
-- 1. Crea l'utente in Supabase: Authentication → Users → Add user (email + password).
-- 2. Sostituisci l'email qui sotto ed esegui nell'SQL Editor.
INSERT INTO public.bar_admin (user_id)
SELECT id FROM auth.users WHERE email = 'tua@email.it'
ON CONFLICT (user_id) DO NOTHING;
