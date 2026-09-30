// Lingue del menu: italiano (testo originale nelle colonne) + traduzioni in i18n = { en: {...}, fr: {...}, de: {...} }

export const LANGS = [
  { code: 'it', label: 'Italiano', locale: 'it-IT' },
  { code: 'en', label: 'English', locale: 'en-GB' },
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
]
export const TR_LANGS = LANGS.filter(l => l.code !== 'it')

// Testo nella lingua richiesta, con l'italiano come riserva se la traduzione manca
export function pick(row, field, lang) {
  return (lang !== 'it' && row?.i18n?.[lang]?.[field]) || row?.[field] || ''
}

// Bandiere in SVG (le emoji non si vedono su Windows). Tutte in formato 3:2.
let ukId = 0
export function flagSvg(code) {
  const a = 'class="flag" viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true" focusable="false"'
  if (code === 'it') return `<svg ${a}><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#CE2B37"/></svg>`
  if (code === 'fr') return `<svg ${a}><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>`
  if (code === 'de') return `<svg ${a}><rect width="3" height=".67" fill="#000"/><rect y=".67" width="3" height=".67" fill="#DD0000"/><rect y="1.33" width="3" height=".67" fill="#FFCE00"/></svg>`
  const id = `uk${++ukId}`
  return `<svg class="flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <clipPath id="${id}"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#${id})" stroke="#C8102E" stroke-width="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
  </svg>`
}

// Testi fissi del menu pubblico
export const UI = {
  it: { table: 'Tavolo', prices: 'Prezzi in euro.', mark: 'Menu', loading: 'Caricamento del menu…', empty: 'Il menu non è ancora disponibile.', error: 'Impossibile caricare il menu. Riprova tra poco.', frozen: 'Prodotto surgelato', categories: 'Categorie', language: 'Lingua' },
  en: { table: 'Table', prices: 'Prices in euros.', mark: 'Menu', loading: 'Loading the menu…', empty: 'The menu is not available yet.', error: 'Unable to load the menu. Please try again shortly.', frozen: 'Frozen product', categories: 'Categories', language: 'Language' },
  fr: { table: 'Table', prices: 'Prix en euros.', mark: 'Menu', loading: 'Chargement du menu…', empty: 'Le menu n’est pas encore disponible.', error: 'Impossible de charger le menu. Réessayez dans un instant.', frozen: 'Produit surgelé', categories: 'Catégories', language: 'Langue' },
  de: { table: 'Tisch', prices: 'Preise in Euro.', mark: 'Speisekarte', loading: 'Speisekarte wird geladen…', empty: 'Die Speisekarte ist noch nicht verfügbar.', error: 'Die Speisekarte konnte nicht geladen werden. Bitte gleich noch einmal versuchen.', frozen: 'Tiefkühlprodukt', categories: 'Kategorien', language: 'Sprache' },
}
