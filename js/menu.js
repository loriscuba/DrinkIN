// Menu pubblico: letto dai clienti tramite QR code (?t=<tavolo>, ?lang=it|en|fr|de)
import { supabase, esc } from './sb.js'
import { logoHtml, waveSvg } from './brand.js'
import { LANGS, UI, pick, flagSvg } from './i18n.js'

const $ = id => document.getElementById(id)
const params = new URLSearchParams(location.search)
const tavolo = params.get('t')
const data = { imp: null, cat: [], prod: [] }

// Lingua: ?lang= → scelta precedente → lingua del telefono → italiano
const codes = LANGS.map(l => l.code)
function initialLang() {
  const fromUrl = params.get('lang')
  if (codes.includes(fromUrl)) return fromUrl
  try { const saved = localStorage.getItem('drinkin-lang'); if (codes.includes(saved)) return saved } catch {}
  const nav = (navigator.language || 'it').slice(0, 2).toLowerCase()
  return codes.includes(nav) ? nav : 'it'
}
let lang = initialLang()
const t = key => UI[lang][key]

function renderLangs() {
  $('langs').setAttribute('aria-label', t('language'))
  $('langs').innerHTML = LANGS.map(l => `<button type="button" class="lang ${l.code === lang ? 'active' : ''}" data-lang="${l.code}"
    lang="${l.code}" title="${l.label}" aria-label="${l.label}" aria-pressed="${l.code === lang}">${flagSvg(l.code)}</button>`).join('')
}

$('langs').addEventListener('click', e => {
  const btn = e.target.closest('[data-lang]')
  if (!btn || btn.dataset.lang === lang) return
  lang = btn.dataset.lang
  try { localStorage.setItem('drinkin-lang', lang) } catch {}
  render()
})

// Raggruppa le voci con lo stesso nome e una variante (es. Piccolo / Grande) sotto un'unica voce
function groupVariants(prodotti) {
  const out = []
  for (const p of prodotti) {
    const last = out[out.length - 1]
    if (p.variante && last && last.nome === p.nome && last.varianti) {
      last.varianti.push(p)
      last.surgelato ||= p.surgelato
      last.descrizione ||= p.descrizione
    } else if (p.variante) {
      out.push({ ...p, varianti: [p] })
    } else {
      out.push(p)
    }
  }
  return out
}

function renderItem(p, price) {
  const line = (label, value, cls = '') =>
    `<div class="item-line ${cls}"><span class="item-name">${label}</span><span class="leader" aria-hidden="true"></span><span class="item-price">${value}</span></div>`
  const name = esc(pick(p, 'nome', lang)) + (p.surgelato ? `<span class="star" title="${t('frozen')}">*</span>` : '')
  const d = pick(p, 'descrizione', lang)
  const desc = d ? `<div class="item-desc">${esc(d)}</div>` : ''
  if (!p.varianti) return `<div class="item">${line(name, price(p.prezzo))}${desc}</div>`
  return `<div class="item">
    <div class="item-line"><span class="item-name">${name}</span></div>
    ${desc}
    ${p.varianti.map(v => line(esc(pick(v, 'variante', lang)), price(v.prezzo), 'variant')).join('')}
  </div>`
}

function render() {
  const locale = LANGS.find(l => l.code === lang).locale
  const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const price = n => fmt.format(Number(n || 0))
  document.documentElement.lang = lang
  renderLangs()
  $('cat-nav').setAttribute('aria-label', t('categories'))
  $('foot-mark').textContent = t('mark')
  if (tavolo) {
    $('table-badge').textContent = `${t('table')} ${tavolo.slice(0, 30)}`
    $('table-badge').classList.remove('hidden')
  }
  if (!data.imp) return

  const s = data.imp
  $('logo').innerHTML = logoHtml(s)
  document.title = `${t('mark')} · ${s.nome_bar || ''}`
  $('foot').textContent = [pick(s, 'nota_piede', lang), t('prices')].filter(Boolean).join(' ')

  const byCat = new Map(data.cat.map(c => [c.id, []]))
  for (const p of data.prod) byCat.get(p.categoria_id)?.push(p)
  const cats = data.cat.filter(c => byCat.get(c.id).length)
  if (!cats.length) {
    $('cat-nav').classList.add('hidden')
    $('menu').innerHTML = `<p class="state">${t('empty')}</p>`
    return
  }

  $('cat-chips').innerHTML = cats.map(c => `<a class="chip" href="#c-${c.id}" data-id="${c.id}">${esc(pick(c, 'nome', lang))}</a>`).join('')
  $('cat-nav').classList.remove('hidden')
  $('menu').innerHTML = cats.map(c => `<section class="cat" id="c-${c.id}">
    <h2><span>${esc(pick(c, 'nome', lang))}</span>${waveSvg(2, 'cat-wave')}</h2>
    <div class="items">${groupVariants(byCat.get(c.id)).map(p => renderItem(p, price)).join('')}</div>
  </section>`).join('')
  observeSections()
}

// ---------- Categoria evidenziata nella barra in alto ----------
// La categoria toccata resta evidenziata finché l'utente non scorre di sua mano; altrimenti vale
// l'ultima sezione il cui titolo ha superato la barra, e in fondo alla pagina l'ultima sezione
// (le ultime categorie, se corte, non riescono ad arrivare in cima allo schermo).
let tapped = null

function currentSection() {
  const secs = [...document.querySelectorAll('.cat')]
  if (!secs.length) return null
  const doc = document.documentElement
  if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4 && window.scrollY > 0) return secs.at(-1).id.slice(2)
  const line = $('cat-nav').getBoundingClientRect().bottom + 24
  let cur = secs[0]
  for (const sec of secs) if (sec.getBoundingClientRect().top <= line) cur = sec
  return cur.id.slice(2)
}

function setActive(id) {
  const box = $('cat-chips')
  let active = null
  box.querySelectorAll('.chip').forEach(ch => {
    const on = ch.dataset.id === id
    ch.classList.toggle('active', on)
    if (on) active = ch
  })
  // Porta il bottone attivo al centro della barra (solo in orizzontale, senza muovere la pagina)
  if (active) box.scrollTo({ left: active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' })
}

function observeSections() {
  setActive(tapped || currentSection())
}

$('cat-chips').addEventListener('click', e => {
  const chip = e.target.closest('.chip')
  if (!chip) return
  e.preventDefault()
  tapped = chip.dataset.id
  setActive(tapped)
  document.getElementById(`c-${tapped}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

// Un gesto dell'utente (dito, rotella, tastiera) riporta l'evidenziazione a seguire lo scorrimento
;['touchstart', 'wheel', 'keydown'].forEach(ev => window.addEventListener(ev, () => { tapped = null }, { passive: true }))

let ticking = false
window.addEventListener('scroll', () => {
  if (ticking || tapped) return
  ticking = true
  requestAnimationFrame(() => { ticking = false; setActive(currentSection()) })
}, { passive: true })

async function load() {
  const [imp, cat, prod] = await Promise.all([
    supabase.from('impostazioni').select('*').eq('id', 1).maybeSingle(),
    supabase.from('categorie').select('id,nome,ordine,i18n').eq('attiva', true).order('ordine').order('nome'),
    supabase.from('prodotti').select('id,categoria_id,nome,variante,descrizione,prezzo,surgelato,ordine,i18n')
      .eq('disponibile', true).order('ordine').order('nome'),
  ])
  const err = imp.error || cat.error || prod.error
  if (err) throw err
  data.imp = imp.data || {}
  data.cat = cat.data
  data.prod = prod.data
  render()
}

$('logo').innerHTML = logoHtml({ nome_bar: ' ' }, 'is-loading')
$('menu').innerHTML = `<p class="state">${t('loading')}</p>`
render()
load().catch(e => {
  console.error(e)
  $('menu').innerHTML = `<p class="state">${t('error')}</p>`
})
