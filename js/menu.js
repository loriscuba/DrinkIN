// Menu pubblico: letto dai clienti tramite QR code (?t=<tavolo>)
import { supabase, esc } from './sb.js'
import { logoHtml, waveSvg } from './brand.js'

const $ = id => document.getElementById(id)
const fmt = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const price = n => fmt.format(Number(n || 0))

$('logo').innerHTML = logoHtml({ nome_bar: ' ' }, 'is-loading')

const tavolo = new URLSearchParams(location.search).get('t')
if (tavolo) {
  $('table-badge').textContent = `Tavolo ${tavolo.slice(0, 30)}`
  $('table-badge').classList.remove('hidden')
}

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

const line = (label, value, cls = '') =>
  `<div class="item-line ${cls}"><span class="item-name">${label}</span><span class="leader" aria-hidden="true"></span><span class="item-price">${value}</span></div>`

function renderItem(p) {
  const name = esc(p.nome) + (p.surgelato ? '<span class="star" title="Prodotto surgelato">*</span>' : '')
  const desc = p.descrizione ? `<div class="item-desc">${esc(p.descrizione)}</div>` : ''
  if (!p.varianti) return `<div class="item">${line(name, price(p.prezzo))}${desc}</div>`
  return `<div class="item">
    <div class="item-line"><span class="item-name">${name}</span></div>
    ${desc}
    ${p.varianti.map(v => line(esc(v.variante), price(v.prezzo), 'variant')).join('')}
  </div>`
}

async function load() {
  const [imp, cat, prod] = await Promise.all([
    supabase.from('impostazioni').select('*').eq('id', 1).maybeSingle(),
    supabase.from('categorie').select('id,nome,ordine').eq('attiva', true).order('ordine').order('nome'),
    supabase.from('prodotti').select('id,categoria_id,nome,variante,descrizione,prezzo,surgelato,ordine')
      .eq('disponibile', true).order('ordine').order('nome'),
  ])
  const err = imp.error || cat.error || prod.error
  if (err) throw err

  const s = imp.data || {}
  $('logo').innerHTML = logoHtml(s)
  if (s.nome_bar) document.title = `Menu · ${s.nome_bar}`
  $('foot').textContent = [s.nota_piede, 'Prezzi in euro.'].filter(Boolean).join(' ')

  const byCat = new Map(cat.data.map(c => [c.id, []]))
  for (const p of prod.data) byCat.get(p.categoria_id)?.push(p)
  const cats = cat.data.filter(c => byCat.get(c.id).length)

  if (!cats.length) {
    $('menu').innerHTML = '<p class="state">Il menu non è ancora disponibile.</p>'
    return
  }

  $('cat-chips').innerHTML = cats.map(c => `<a class="chip" href="#c-${c.id}" data-id="${c.id}">${esc(c.nome)}</a>`).join('')
  $('cat-nav').classList.remove('hidden')
  $('menu').innerHTML = cats.map(c => `<section class="cat" id="c-${c.id}">
    <h2><span>${esc(c.nome)}</span>${waveSvg(2, 'cat-wave')}</h2>
    <div class="items">${groupVariants(byCat.get(c.id)).map(renderItem).join('')}</div>
  </section>`).join('')

  // Evidenzia la categoria visibile nella barra in alto
  const chips = [...document.querySelectorAll('.chip')]
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      chips.forEach(ch => ch.classList.toggle('active', ch.dataset.id === e.target.id.slice(2)))
      const active = chips.find(ch => ch.classList.contains('active'))
      active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, { rootMargin: '-70px 0px -70% 0px' })
  document.querySelectorAll('.cat').forEach(sec => io.observe(sec))
}

load().catch(e => {
  console.error(e)
  $('menu').innerHTML = '<p class="state">Impossibile caricare il menu. Riprova tra poco.</p>'
})
