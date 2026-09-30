// Traduzione automatica (admin) dall'italiano verso EN/FR/DE, con il servizio gratuito MyMemory.
// Le traduzioni restano modificabili a mano; se il servizio non risponde il menu mostra l'italiano.
import { esc } from './sb.js'
import { TR_LANGS, flagSvg } from './i18n.js'

const decoder = document.createElement('textarea')
const cache = new Map()

export async function translateText(text, to) {
  const key = `${to}|${text}`
  if (cache.has(key)) return cache.get(key)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|${to}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`servizio di traduzione non disponibile (${res.status})`)
  const json = await res.json()
  const out = json?.responseData?.translatedText
  if (Number(json?.responseStatus) !== 200 || !out || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(out)) {
    throw new Error(json?.responseDetails || 'traduzione non disponibile')
  }
  decoder.innerHTML = out
  const clean = decoder.value.trim()
  cache.set(key, clean)
  return clean
}

// ---------- Campi di traduzione nei form dell'admin ----------
// fields: [{ key: 'nome', label: 'Nome', multiline?: true }]
export function trFieldsHtml(fields) {
  return TR_LANGS.map(l => `<div class="tr-lang" data-lang="${l.code}">
    <div class="tr-head">${flagSvg(l.code)}<span>${l.label}</span></div>
    ${fields.map(f => f.multiline
      ? `<textarea data-tr="${f.key}" rows="2" placeholder="${esc(f.label)}"></textarea>`
      : `<input type="text" data-tr="${f.key}" placeholder="${esc(f.label)}">`).join('')}
  </div>`).join('')
}

// Riempie i campi e azzera il segno "modificato a mano"
export function fillTr(box, i18n = {}) {
  box.querySelectorAll('[data-tr]').forEach(el => {
    const lang = el.closest('[data-lang]').dataset.lang
    el.value = i18n?.[lang]?.[el.dataset.tr] || ''
    delete el.dataset.touched
  })
}

export function watchTr(box) {
  box.addEventListener('input', e => { if (e.target.dataset.tr) e.target.dataset.touched = '1' })
}

export function readTr(box) {
  const out = {}
  box.querySelectorAll('[data-tr]').forEach(el => {
    const lang = el.closest('[data-lang]').dataset.lang
    const v = el.value.trim()
    if (v) (out[lang] ||= {})[el.dataset.tr] = v
  })
  return out
}

// Traduce i campi vuoti (o tutti con force) a partire dal testo italiano: source = { nome: '...', ... }.
// Se un testo italiano è cambiato, le sue traduzioni non modificate a mano vengono rifatte.
// Ritorna il numero di traduzioni non riuscite.
export async function autoTranslate(box, source, { changed = [], force = false } = {}) {
  const jobs = []
  box.querySelectorAll('[data-tr]').forEach(el => {
    const text = (source[el.dataset.tr] || '').trim()
    if (!text) { el.value = ''; return }
    const stale = changed.includes(el.dataset.tr) && !el.dataset.touched
    if (!force && el.value.trim() && !stale) return
    const lang = el.closest('[data-lang]').dataset.lang
    jobs.push(translateText(text, lang).then(t => { el.value = t }).catch(err => { console.warn(err); if (stale || force) el.value = ''; return 'fail' }))
  })
  box.classList.add('busy')
  const results = await Promise.all(jobs)
  box.classList.remove('busy')
  return results.filter(r => r === 'fail').length
}

// Lingue a cui manca almeno un testo presente in italiano
export function missingLangs(row, fields) {
  return TR_LANGS.filter(l => fields.some(f => row[f] && !row.i18n?.[l.code]?.[f])).map(l => l.code)
}
