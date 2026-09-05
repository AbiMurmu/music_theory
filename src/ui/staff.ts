import type { ClefId } from '../theory/clef'

export type StaffRenderOptions = {
  clef: ClefId
  /** Steps above the bottom staff line (0 = bottom line). */
  step: number
}

const VIEW_W = 280
const VIEW_H = 140
const STAFF_LEFT = 72
const STAFF_RIGHT = 250
const LINE_GAP = 12
/** Y of the bottom staff line. */
const BOTTOM_Y = 100

function lineY(stepFromBottom: number): number {
  return BOTTOM_Y - stepFromBottom * (LINE_GAP / 2)
}

function clefGlyph(clef: ClefId): { text: string; x: number; y: number; size: number } {
  if (clef === 'treble') {
    return { text: '\u{1D11E}', x: 18, y: 92, size: 64 }
  }
  return { text: '\u{1D122}', x: 20, y: 88, size: 52 }
}

/** Ledger lines through `step` (outside the 0–8 staff). */
function ledgerSteps(step: number): number[] {
  const lines: number[] = []
  if (step < 0) {
    for (let s = -2; s >= step; s -= 2) lines.push(s)
  } else if (step > 8) {
    for (let s = 10; s <= step; s += 2) lines.push(s)
  }
  return lines
}

export function renderStaff(
  container: HTMLElement,
  options: StaffRenderOptions,
): void {
  container.replaceChildren()
  container.className = 'staff'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`)
  svg.setAttribute('role', 'img')
  svg.setAttribute(
    'aria-label',
    `${options.clef} clef note on the staff`,
  )
  svg.classList.add('staff__svg')

  for (let i = 0; i < 5; i++) {
    const y = lineY(i * 2)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', String(STAFF_LEFT))
    line.setAttribute('x2', String(STAFF_RIGHT))
    line.setAttribute('y1', String(y))
    line.setAttribute('y2', String(y))
    line.classList.add('staff__line')
    svg.appendChild(line)
  }

  const glyph = clefGlyph(options.clef)
  const clefText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  clefText.setAttribute('x', String(glyph.x))
  clefText.setAttribute('y', String(glyph.y))
  clefText.setAttribute('font-size', String(glyph.size))
  clefText.classList.add('staff__clef')
  clefText.textContent = glyph.text
  svg.appendChild(clefText)

  const noteX = 168
  const noteY = lineY(options.step)

  for (const ls of ledgerSteps(options.step)) {
    const y = lineY(ls)
    const ledger = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    ledger.setAttribute('x1', String(noteX - 14))
    ledger.setAttribute('x2', String(noteX + 14))
    ledger.setAttribute('y1', String(y))
    ledger.setAttribute('y2', String(y))
    ledger.classList.add('staff__line', 'staff__ledger')
    svg.appendChild(ledger)
  }

  const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  head.setAttribute('cx', String(noteX))
  head.setAttribute('cy', String(noteY))
  head.setAttribute('rx', '9')
  head.setAttribute('ry', '7')
  head.setAttribute('transform', `rotate(-18 ${noteX} ${noteY})`)
  head.classList.add('staff__note')
  svg.appendChild(head)

  const stemUp = options.step < 4
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  const stemX = stemUp ? noteX + 8 : noteX - 8
  stem.setAttribute('x1', String(stemX))
  stem.setAttribute('x2', String(stemX))
  stem.setAttribute('y1', String(noteY))
  stem.setAttribute(
    'y2',
    String(stemUp ? noteY - 36 : noteY + 36),
  )
  stem.classList.add('staff__stem')
  svg.appendChild(stem)

  container.appendChild(svg)
}
