// Logo del bar (— BAR — / nome in corsivo / onda / sottotitolo), condiviso da menu, admin e QR
import { esc } from './sb.js'

export const COLORS = { navy: '#16304D', gold: '#F2C14E', cream: '#F6EFE3' }

// Onda dorata: `periods` ondulazioni complete, larghe 20 unità ciascuna
export function wavePath(periods) {
  return 'M1 5' + ' q5 -5 10 0 q5 5 10 0'.repeat(periods)
}

export function waveSvg(periods, cls = 'wave') {
  return `<svg class="${cls}" viewBox="0 0 ${periods * 20 + 2} 10" aria-hidden="true" focusable="false"><path d="${wavePath(periods)}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

export function logoHtml(imp = {}, cls = '') {
  const nome = imp.nome_bar || 'Il nostro Bar'
  return `<div class="brand ${cls}">
    <div class="brand-kicker"><span>Bar</span></div>
    <div class="brand-name">${esc(nome)}</div>
    ${waveSvg(8, 'brand-wave')}
    ${imp.sottotitolo ? `<div class="brand-sub">${esc(imp.sottotitolo)}</div>` : ''}
  </div>`
}
