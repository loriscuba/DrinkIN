# DrinkIN

Menu digitale del bar con QR code per i tavoli. Sito statico (HTML/CSS/JS) + Supabase.

- `index.html` — menu pubblico per i clienti, in italiano, inglese, francese e tedesco (bandiere in alto). `?t=<tavolo>` mostra il numero del tavolo, `?lang=en|fr|de` apre direttamente una lingua.
- `admin.html` — gestione (solo amministratori): prodotti, disponibilità, categorie, tavoli, stampa/download dei QR, impostazioni.

## Database (Supabase)
Eseguire in ordine nell'SQL Editor:
1. `sql/01_schema.sql` — schema `drinkin` con tabelle e RLS (lettura pubblica, scrittura solo per gli utenti in `drinkin.admin`).
2. `sql/02_seed_menu.sql` — menu iniziale; non fa nulla se ci sono già prodotti.
3. `sql/03_aggiungi_admin.sql` — abilita un utente come amministratore.
4. `sql/04_traduzioni.sql` — traduzioni EN/FR/DE del menu iniziale.
5. *Project Settings → Data API → Exposed schemas*: aggiungere `drinkin`.

Le credenziali (URL e chiave publishable) sono in `js/config.js`.

## Traduzioni
Ogni categoria, prodotto e la nota a piè di pagina hanno una colonna `i18n` con le traduzioni.
Quando si salva dall'admin, i testi mancanti (o il cui italiano è cambiato) vengono tradotti
in automatico con il servizio gratuito MyMemory; restano modificabili a mano. Se una traduzione
manca, il menu mostra il testo italiano e l'admin segnala la lingua mancante con la bandierina.

## Pubblicazione (Cloudflare Pages)
Framework: *Nessuna* · Comando di generazione: vuoto · Directory di output: vuota (radice del repo).

La libreria QR (`js/vendor/qrcode.js`, MIT) è inclusa nel repo.
