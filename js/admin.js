// Pannello gestione menu bar: prodotti, categorie, tavoli/QR, impostazioni
import { supabase, esc, euro } from './sb.js'
import { COLORS, logoHtml, wavePath } from './brand.js'
import { TR_LANGS, flagSvg } from './i18n.js'
import { trFieldsHtml, fillTr, watchTr, readTr, autoTranslate, translateText, missingLangs } from './translate.js'

const $ = id => document.getElementById(id)
const state = { categorie: [], prodotti: [], tavoli: [], imp: {} }
const MENU_URL = new URL('./', location.href).href

function toast(msg) {
  const t = document.createElement('div')
  t.className = 'toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2600)
}

function fail(error, msg = 'Operazione non riuscita') {
  console.error(error)
  toast(`${msg}: ${error.message || error}`)
}

// ---------- Traduzioni ----------
const PROD_TR = ['nome', 'variante', 'descrizione']
$('p-tr').insertAdjacentHTML('beforeend', trFieldsHtml([
  { key: 'nome', label: 'Nome' }, { key: 'variante', label: 'Variante' }, { key: 'descrizione', label: 'Descrizione / ingredienti', multiline: true },
]))
$('cat-tr').insertAdjacentHTML('beforeend', trFieldsHtml([{ key: 'nome', label: 'Nome della categoria' }]))
$('imp-tr').insertAdjacentHTML('beforeend', trFieldsHtml([{ key: 'nota_piede', label: 'Nota a piè di pagina', multiline: true }]))
;['p-tr', 'cat-tr', 'imp-tr'].forEach(id => watchTr($(id)))

// Etichetta con le bandiere delle lingue a cui manca una traduzione
const missingBadge = langs => langs.length
  ? `<span class="tr-missing" title="Traduzioni mancanti">${langs.map(flagSvg).join('')}</span>`
  : ''

const trFailMsg = n => `${n} traduzion${n === 1 ? 'e' : 'i'} automatic${n === 1 ? 'a' : 'he'} non riuscit${n === 1 ? 'a' : 'e'}: il menu mostrerà l'italiano, puoi completarle a mano`

// Traduce un testo in tutte le lingue (per le categorie create o rinominate dalla lista)
async function translateAll(text, key) {
  const out = {}
  let failed = 0
  await Promise.all(TR_LANGS.map(l => translateText(text, l.code)
    .then(v => { out[l.code] = { [key]: v } })
    .catch(err => { console.warn(err); failed++ })))
  if (failed) toast(trFailMsg(failed))
  return out
}

async function withBusy(btn, fn) {
  const label = btn.textContent
  btn.disabled = true
  btn.textContent = 'Traduzione…'
  try { return await fn() } finally { btn.disabled = false; btn.textContent = label }
}

// ---------- Auth ----------
async function checkAccess() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return showLogin()
  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error) return showLogin(`Errore di verifica: ${error.message}`)
  if (!isAdmin) return showLogin('Questo account non è abilitato come amministratore.')
  $('login-view').classList.add('hidden')
  $('app-view').classList.remove('hidden')
  await loadAll()
}

function showLogin(msg = '') {
  $('app-view').classList.add('hidden')
  $('login-view').classList.remove('hidden')
  $('login-error').textContent = msg
}

$('login-form').addEventListener('submit', async e => {
  e.preventDefault()
  $('login-error').textContent = ''
  const { error } = await supabase.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value })
  if (error) return ($('login-error').textContent = 'Email o password non corretti.')
  checkAccess()
})

$('logout').addEventListener('click', async () => {
  await supabase.auth.signOut()
  showLogin()
})

// ---------- Tabs ----------
document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn))
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== btn.dataset.tab))
}))

// ---------- Data ----------
async function loadAll() {
  const [c, p, t, i] = await Promise.all([
    supabase.from('categorie').select('*').order('ordine').order('nome'),
    supabase.from('prodotti').select('*').order('ordine').order('nome'),
    supabase.from('tavoli').select('*').order('ordine').order('etichetta'),
    supabase.from('impostazioni').select('*').eq('id', 1).maybeSingle(),
  ])
  const err = c.error || p.error || t.error || i.error
  if (err) return fail(err, 'Caricamento non riuscito')
  state.categorie = c.data
  state.prodotti = p.data
  state.tavoli = t.data
  state.imp = i.data || {}
  renderBrand()
  renderProdotti()
  renderCategorie()
  renderTavoli()
  renderImpostazioni()
}

function renderBrand() {
  $('top-name').textContent = state.imp.nome_bar || 'Menu'
}

// ---------- Prodotti ----------
function renderProdotti() {
  const q = $('prod-search').value.trim().toLowerCase()
  const html = state.categorie.map(c => {
    const items = state.prodotti.filter(p => p.categoria_id === c.id &&
      (!q || `${p.nome} ${p.variante || ''} ${p.descrizione || ''}`.toLowerCase().includes(q)))
    if (!items.length && q) return ''
    return `<div class="card">
      <h3>${esc(c.nome)}${c.attiva ? '' : ' <span class="muted">(nascosta)</span>'}</h3>
      ${items.map(p => `<div class="list-row ${p.disponibile ? '' : 'off'}">
        <label class="switch" title="Disponibile"><input type="checkbox" data-toggle="${p.id}" ${p.disponibile ? 'checked' : ''}><span></span></label>
        <div class="grow">
          <div class="item-name">${esc(p.nome)}${p.variante ? ` <span class="muted">· ${esc(p.variante)}</span>` : ''}${p.surgelato ? '<span class="star">*</span>' : ''}</div>
          ${p.descrizione ? `<div class="item-desc">${esc(p.descrizione)}</div>` : ''}
        </div>
        ${missingBadge(missingLangs(p, PROD_TR))}
        <div class="item-price">${euro(p.prezzo)}</div>
        <button class="btn sm" data-edit="${p.id}">Modifica</button>
      </div>`).join('') || '<p class="muted" style="font-size:.9rem">Nessun prodotto.</p>'}
    </div>`
  }).join('')
  $('prod-list').innerHTML = html || '<p class="muted">Nessun risultato.</p>'
}

$('prod-search').addEventListener('input', renderProdotti)

$('prod-list').addEventListener('change', async e => {
  const id = e.target.dataset.toggle
  if (!id) return
  const disponibile = e.target.checked
  const { error } = await supabase.from('prodotti').update({ disponibile }).eq('id', id)
  if (error) { e.target.checked = !disponibile; return fail(error) }
  state.prodotti.find(p => p.id === id).disponibile = disponibile
  e.target.closest('.list-row').classList.toggle('off', !disponibile)
  toast(disponibile ? 'Prodotto visibile nel menu' : 'Prodotto nascosto dal menu')
})

$('prod-list').addEventListener('click', e => {
  const id = e.target.dataset.edit
  if (id) openProdotto(state.prodotti.find(p => p.id === id))
})

$('new-prod').addEventListener('click', () => openProdotto(null))
$('p-cancel').addEventListener('click', () => $('prod-dialog').close())

let editing = null
function openProdotto(p) {
  if (!state.categorie.length) return toast('Crea prima una categoria')
  editing = p
  $('prod-title').textContent = p ? 'Modifica prodotto' : 'Nuovo prodotto'
  $('p-cat').innerHTML = state.categorie.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('')
  $('p-cat').value = p?.categoria_id || state.categorie[0].id
  $('p-nome').value = p?.nome || ''
  $('p-var').value = p?.variante || ''
  $('p-desc').value = p?.descrizione || ''
  $('p-prezzo').value = p?.prezzo ?? ''
  $('p-ordine').value = p?.ordine ?? ''
  $('p-surg').checked = !!p?.surgelato
  $('p-disp').checked = p ? p.disponibile : true
  fillTr($('p-tr'), p?.i18n)
  toggleVarTr()
  $('p-del').classList.toggle('hidden', !p)
  $('prod-dialog').showModal()
}

// I campi "Variante" tradotti servono solo se il prodotto ha una variante
const toggleVarTr = () => $('p-tr').classList.toggle('no-var', !$('p-var').value.trim())
$('p-var').addEventListener('input', toggleVarTr)

const prodSource = () => ({ nome: $('p-nome').value, variante: $('p-var').value, descrizione: $('p-desc').value })

$('p-tr').querySelector('[data-auto-tr]').addEventListener('click', e => withBusy(e.target, async () => {
  const failed = await autoTranslate($('p-tr'), prodSource(), { force: true })
  if (failed) toast(trFailMsg(failed))
}))

$('prod-form').addEventListener('submit', async e => {
  e.preventDefault()
  const submit = e.submitter || $('prod-form').querySelector('[type=submit]')
  // Traduce i campi mancanti e rifà quelli il cui testo italiano è cambiato (se non corretti a mano)
  const source = prodSource()
  const changed = PROD_TR.filter(k => (source[k] || '').trim() !== (editing?.[k] || ''))
  const failed = await withBusy(submit, () => autoTranslate($('p-tr'), source, { changed }))
  if (failed) toast(trFailMsg(failed))
  const ordine = $('p-ordine').value === ''
    ? Math.max(0, ...state.prodotti.map(p => p.ordine)) + 1
    : parseInt($('p-ordine').value, 10)
  const row = {
    categoria_id: $('p-cat').value,
    nome: $('p-nome').value.trim(),
    variante: $('p-var').value.trim() || null,
    descrizione: $('p-desc').value.trim() || null,
    prezzo: Number($('p-prezzo').value),
    ordine,
    surgelato: $('p-surg').checked,
    disponibile: $('p-disp').checked,
    i18n: readTr($('p-tr')),
  }
  const { error } = editing
    ? await supabase.from('prodotti').update(row).eq('id', editing.id)
    : await supabase.from('prodotti').insert(row)
  if (error) return fail(error, 'Salvataggio non riuscito')
  $('prod-dialog').close()
  toast('Prodotto salvato')
  loadAll()
})

$('p-del').addEventListener('click', async () => {
  if (!editing || !confirm(`Eliminare "${editing.nome}${editing.variante ? ' ' + editing.variante : ''}"?`)) return
  const { error } = await supabase.from('prodotti').delete().eq('id', editing.id)
  if (error) return fail(error)
  $('prod-dialog').close()
  toast('Prodotto eliminato')
  loadAll()
})

// ---------- Categorie ----------
function renderCategorie() {
  $('cat-list').innerHTML = state.categorie.map(c => {
    const n = state.prodotti.filter(p => p.categoria_id === c.id).length
    return `<div class="list-row" data-cat="${c.id}">
      <input type="number" class="c-ordine" value="${c.ordine}" style="width:70px" title="Ordine">
      <input type="text" class="c-nome grow" value="${esc(c.nome)}">
      <label class="check" style="margin:0"><input type="checkbox" class="c-attiva" ${c.attiva ? 'checked' : ''}> Visibile</label>
      <span class="muted" style="font-size:.85rem;white-space:nowrap">${n} prod.</span>
      ${missingBadge(missingLangs(c, ['nome']))}
      <button class="btn sm" data-tr-cat title="Nome in inglese, francese e tedesco">Lingue</button>
      <button class="btn sm" data-save-cat>Salva</button>
      <button class="btn sm danger" data-del-cat ${n ? 'disabled title="Svuota prima la categoria"' : ''}>Elimina</button>
    </div>`
  }).join('') || '<p class="muted">Nessuna categoria.</p>'
}

$('cat-list').addEventListener('click', async e => {
  const row = e.target.closest('[data-cat]')
  if (!row) return
  const id = row.dataset.cat
  if (e.target.hasAttribute('data-save-cat')) {
    const upd = {
      nome: row.querySelector('.c-nome').value.trim(),
      ordine: parseInt(row.querySelector('.c-ordine').value, 10) || 0,
      attiva: row.querySelector('.c-attiva').checked,
    }
    if (!upd.nome) return toast('Il nome è obbligatorio')
    const cat = state.categorie.find(c => c.id === id)
    if (upd.nome !== cat.nome) upd.i18n = await withBusy(e.target, () => translateAll(upd.nome, 'nome'))
    const { error } = await supabase.from('categorie').update(upd).eq('id', id)
    if (error) return fail(error)
    toast('Categoria salvata')
    loadAll()
  } else if (e.target.hasAttribute('data-tr-cat')) {
    openCatTr(state.categorie.find(c => c.id === id))
  } else if (e.target.hasAttribute('data-del-cat')) {
    if (!confirm('Eliminare questa categoria?')) return
    const { error } = await supabase.from('categorie').delete().eq('id', id)
    if (error) return fail(error)
    toast('Categoria eliminata')
    loadAll()
  }
})

$('cat-form').addEventListener('submit', async e => {
  e.preventDefault()
  const nome = $('cat-new').value.trim()
  if (!nome) return
  const ordine = Math.max(0, ...state.categorie.map(c => c.ordine)) + 1
  const i18n = await withBusy(e.submitter || $('cat-form').querySelector('[type=submit]'), () => translateAll(nome, 'nome'))
  const { error } = await supabase.from('categorie').insert({ nome, ordine, i18n })
  if (error) return fail(error)
  $('cat-new').value = ''
  toast('Categoria aggiunta')
  loadAll()
})

let catEditing = null
function openCatTr(c) {
  catEditing = c
  $('cat-tr-it').textContent = `Italiano: ${c.nome}`
  fillTr($('cat-tr'), c.i18n)
  $('cat-dialog').showModal()
}
$('cat-tr-cancel').addEventListener('click', () => $('cat-dialog').close())
$('cat-tr').querySelector('[data-auto-tr]').addEventListener('click', e => withBusy(e.target, async () => {
  const failed = await autoTranslate($('cat-tr'), { nome: catEditing.nome }, { force: true })
  if (failed) toast(trFailMsg(failed))
}))
$('cat-tr-form').addEventListener('submit', async e => {
  e.preventDefault()
  const { error } = await supabase.from('categorie').update({ i18n: readTr($('cat-tr')) }).eq('id', catEditing.id)
  if (error) return fail(error)
  $('cat-dialog').close()
  toast('Traduzioni salvate')
  loadAll()
})

// ---------- Tavoli e QR ----------
const tableUrl = etichetta => etichetta == null ? MENU_URL : `${MENU_URL}?t=${encodeURIComponent(etichetta)}`

function qrSvg(text) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount(), m = 2, size = n + m * 2
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`
  return `<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="${COLORS.navy}"/></svg>`
}

function qrCard(t) {
  const label = t ? `Tavolo ${esc(t.etichetta)}` : 'Menu'
  return `<div class="qr-card" data-tav="${t ? t.id : ''}">
    ${logoHtml(state.imp)}
    <div class="qr-code">${qrSvg(tableUrl(t?.etichetta))}</div>
    <div class="qr-table">${label}</div>
    <div class="qr-sub">Inquadra per vedere il menu</div>
    <div class="qr-tools">
      <button class="btn sm" data-png>PNG</button>
      <a class="btn sm" href="${esc(tableUrl(t?.etichetta))}" target="_blank" rel="noopener">Apri</a>
      ${t ? '<button class="btn sm danger" data-del-tav>Elimina</button>' : ''}
    </div>
  </div>`
}

function renderTavoli() {
  $('qr-url').textContent = MENU_URL
  const attivi = state.tavoli.filter(t => t.attivo)
  $('qr-grid').innerHTML = attivi.map(qrCard).join('') + qrCard(null)
}

async function addTavoli(etichette) {
  const esistenti = new Set(state.tavoli.map(t => t.etichetta))
  let ordine = Math.max(0, ...state.tavoli.map(t => t.ordine))
  const rows = etichette.filter(e => e && !esistenti.has(e)).map(etichetta => ({ etichetta, ordine: ++ordine }))
  if (!rows.length) return toast('Tavoli già presenti')
  const { error } = await supabase.from('tavoli').insert(rows)
  if (error) return fail(error)
  toast(rows.length === 1 ? 'Tavolo aggiunto' : `${rows.length} tavoli aggiunti`)
  loadAll()
}

$('tav-form').addEventListener('submit', e => {
  e.preventDefault()
  addTavoli([$('tav-new').value.trim()])
  $('tav-new').value = ''
})

$('tav-range').addEventListener('submit', e => {
  e.preventDefault()
  const from = parseInt($('tav-from').value, 10), to = parseInt($('tav-to').value, 10)
  if (!(from >= 1 && to >= from && to - from < 200)) return toast('Intervallo non valido')
  addTavoli(Array.from({ length: to - from + 1 }, (_, i) => String(from + i)))
})

$('qr-grid').addEventListener('click', async e => {
  const card = e.target.closest('.qr-card')
  if (!card) return
  if (e.target.hasAttribute('data-del-tav')) {
    if (!confirm('Eliminare questo tavolo? Il QR già stampato continuerà a funzionare.')) return
    const { error } = await supabase.from('tavoli').delete().eq('id', card.dataset.tav)
    if (error) return fail(error)
    loadAll()
  } else if (e.target.hasAttribute('data-png')) {
    downloadPng(card)
  }
})

// Esporta la card QR (logo + codice + tavolo) come PNG ad alta risoluzione, con i colori del menu
async function downloadPng(card) {
  const svg = card.querySelector('svg.qr').outerHTML
  const label = card.querySelector('.qr-table').textContent
  const nome = state.imp.nome_bar || 'Il nostro Bar'
  const sub = state.imp.sottotitolo || ''
  const serif = "'Playfair Display', Georgia, serif", sans = "'Josefin Sans', 'Century Gothic', Arial, sans-serif"
  await Promise.all([document.fonts.load(`italic 700 120px ${serif}`), document.fonts.load(`700 40px ${sans}`)]).catch(() => {})

  const img = new Image()
  img.onload = () => {
    const W = 1000, H = 1400, canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    // Testo con spaziatura tra le lettere, centrato
    const spaced = (text, y, font, color, spacing) => {
      ctx.font = font; ctx.fillStyle = color
      const chars = [...text.toUpperCase()]
      const w = chars.reduce((s, ch) => s + ctx.measureText(ch).width + spacing, -spacing)
      let x = W / 2 - w / 2
      ctx.textAlign = 'left'
      for (const ch of chars) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + spacing }
      return w
    }

    ctx.fillStyle = COLORS.navy; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(246,239,227,.45)'; ctx.lineWidth = 2; ctx.strokeRect(30, 30, W - 60, H - 60)

    // — BAR —
    const kw = spaced('Bar', 130, `700 30px ${sans}`, COLORS.gold, 14)
    ctx.fillStyle = 'rgba(246,239,227,.7)'
    ctx.fillRect(W / 2 - kw / 2 - 120, 119, 90, 2); ctx.fillRect(W / 2 + kw / 2 + 30, 119, 90, 2)
    // Nome (ridotto se troppo lungo)
    let size = 110
    do { ctx.font = `italic 700 ${size}px ${serif}`; size -= 4 } while (ctx.measureText(nome).width > W - 140 && size > 40)
    ctx.fillStyle = COLORS.cream; ctx.textAlign = 'center'; ctx.fillText(nome, W / 2, 250)
    // Onda
    ctx.save()
    const k = 500 / 162 // larghezza dell'onda a 8 ondulazioni
    ctx.translate(W / 2 - 250, 262); ctx.scale(k, k)
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke(new Path2D(wavePath(8)))
    ctx.restore()
    if (sub) spaced(sub, 350, `600 30px ${sans}`, COLORS.cream, 12)

    // Codice QR su fondo bianco
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.roundRect(190, 400, 620, 620, 24); ctx.fill()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 210, 420, 580, 580)

    spaced(label, 1135, `700 64px ${sans}`, COLORS.gold, 20)
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(246,239,227,.75)'; ctx.font = `400 32px ${sans}`
    ctx.fillText('Inquadra per vedere il menu', W / 2, 1205)

    const a = document.createElement('a')
    a.download = `qr-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

$('print-qr').addEventListener('click', () => {
  $('print-area').innerHTML = `<div class="qr-grid">${$('qr-grid').innerHTML}</div>`
  document.body.classList.add('printing-qr')
  window.print()
})
window.addEventListener('afterprint', () => document.body.classList.remove('printing-qr'))

// ---------- Impostazioni ----------
function renderImpostazioni() {
  $('imp-nome').value = state.imp.nome_bar || ''
  $('imp-sub').value = state.imp.sottotitolo || ''
  $('imp-nota').value = state.imp.nota_piede || ''
  fillTr($('imp-tr'), state.imp.i18n)
}

$('imp-tr').querySelector('[data-auto-tr]').addEventListener('click', e => withBusy(e.target, async () => {
  const failed = await autoTranslate($('imp-tr'), { nota_piede: $('imp-nota').value }, { force: true })
  if (failed) toast(trFailMsg(failed))
}))

$('imp-form').addEventListener('submit', async e => {
  e.preventDefault()
  const nota = $('imp-nota').value.trim()
  const changed = nota !== (state.imp.nota_piede || '') ? ['nota_piede'] : []
  const failed = await withBusy(e.submitter || $('imp-form').querySelector('[type=submit]'),
    () => autoTranslate($('imp-tr'), { nota_piede: nota }, { changed }))
  if (failed) toast(trFailMsg(failed))
  const row = {
    id: 1,
    nome_bar: $('imp-nome').value.trim(),
    sottotitolo: $('imp-sub').value.trim() || null,
    nota_piede: nota || null,
    i18n: readTr($('imp-tr')),
  }
  const { error } = await supabase.from('impostazioni').upsert(row)
  if (error) return fail(error)
  toast('Impostazioni salvate')
  loadAll()
})

// Logo nella schermata di accesso (le impostazioni sono leggibili anche senza login)
supabase.from('impostazioni').select('nome_bar,sottotitolo').eq('id', 1).maybeSingle()
  .then(({ data }) => { $('login-brand').innerHTML = logoHtml(data || {}) })

checkAccess().catch(e => showLogin(`Errore: ${e.message}`))
