# DrinkIN

Menu digitale del bar con QR code per i tavoli. Sito statico (HTML/CSS/JS) + Supabase.

- `index.html` — menu pubblico per i clienti. `?t=<tavolo>` mostra il numero del tavolo.
- `admin.html` — gestione (solo amministratori): prodotti, disponibilità, categorie, tavoli, stampa/download dei QR, impostazioni.

## Database (Supabase)
Eseguire in ordine nell'SQL Editor:
1. `sql/01_schema.sql` — schema `drinkin` con tabelle e RLS (lettura pubblica, scrittura solo per gli utenti in `drinkin.admin`).
2. `sql/02_seed_menu.sql` — menu iniziale; non fa nulla se ci sono già prodotti.
3. `sql/03_aggiungi_admin.sql` — abilita un utente come amministratore.
4. *Project Settings → Data API → Exposed schemas*: aggiungere `drinkin`.

Le credenziali (URL e chiave publishable) sono in `js/config.js`.

## Pubblicazione (Cloudflare Pages)
Framework: *Nessuna* · Comando di generazione: vuoto · Directory di output: vuota (radice del repo).

La libreria QR (`js/vendor/qrcode.js`, MIT) è inclusa nel repo.
