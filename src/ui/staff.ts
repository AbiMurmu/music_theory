import type { ClefId } from '../theory/clef'

export type StaffRenderOptions = {
  clef: ClefId
  /** Steps above the bottom staff line (0 = bottom line). */
  step: number
}

const VIEW_W = 340
const STAFF_LEFT = 100
const STAFF_RIGHT = 325
const LINE_GAP = 16
const BOTTOM_Y = 140

function lineY(stepFromBottom: number): number {
  return BOTTOM_Y - stepFromBottom * (LINE_GAP / 2)
}

function ledgerSteps(step: number): number[] {
  const lines: number[] = []
  if (step < 0) {
    for (let s = -2; s >= step; s -= 2) lines.push(s)
  } else if (step > 8) {
    for (let s = 10; s <= step; s += 2) lines.push(s)
  }
  return lines
}

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number>,
  className?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name)
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v))
  }
  if (className) node.classList.add(...className.split(/\s+/))
  return node
}

/** Recognizable G-clef: spiral on the G line, tall stem, top curl. */
function appendTrebleClef(svg: SVGElement): void {
  const gY = lineY(2)
  const path = el(
    'path',
    {
      'fill-rule': 'evenodd',
      d: [
        // Outer silhouette
        `M 50 ${gY + 58}`,
        `C 50 ${gY + 74}, 36 ${gY + 84}, 22 ${gY + 84}`,
        `C 6 ${gY + 84}, -2 ${gY + 70}, -2 ${gY + 56}`,
        `C -2 ${gY + 34}, 20 ${gY + 24}, 36 ${gY + 6}`,
        `C 50 ${gY - 10}, 56 ${gY - 30}, 56 ${gY - 48}`,
        `C 56 ${gY - 70}, 40 ${gY - 84}, 24 ${gY - 84}`,
        `C 8 ${gY - 84}, -2 ${gY - 70}, 0 ${gY - 54}`,
        `C 2 ${gY - 40}, 16 ${gY - 32}, 30 ${gY - 38}`,
        `C 42 ${gY - 44}, 46 ${gY - 58}, 40 ${gY - 68}`,
        `L 40 ${gY - 68}`,
        `C 48 ${gY - 78}, 62 ${gY - 72}, 66 ${gY - 56}`,
        `C 72 ${gY - 32}, 62 ${gY - 12}, 50 ${gY + 2}`,
        `L 50 ${gY + 58}`,
        'Z',
        // Cut out spiral eye (centered on G line)
        `M 22 ${gY + 56}`,
        `A 11 11 0 1 0 22.01 ${gY + 56}`,
        'Z',
      ].join(' '),
    },
    'staff__clef-fill',
  )
  svg.appendChild(path)
}

/** Recognizable F-clef: curve + two dots on the F line. */
function appendBassClef(svg: SVGElement): void {
  const fY = lineY(6)
  const g = el('g', {}, 'staff__clef')

  g.appendChild(
    el(
      'path',
      {
        d: [
          `M 10 ${fY - 6}`,
          `C 10 ${fY - 40}, 40 ${fY - 56}, 64 ${fY - 42}`,
          `C 84 ${fY - 30}, 90 ${fY - 4}, 78 ${fY + 18}`,
          `C 66 ${fY + 40}, 36 ${fY + 50}, 14 ${fY + 36}`,
          `L 14 ${fY + 18}`,
          `C 32 ${fY + 32}, 58 ${fY + 24}, 66 ${fY + 4}`,
          `C 74 ${fY - 16}, 64 ${fY - 34}, 46 ${fY - 34}`,
          `C 30 ${fY - 34}, 20 ${fY - 22}, 20 ${fY - 6}`,
          'Z',
        ].join(' '),
      },
      'staff__clef-fill',
    ),
  )

  const dotX = 84
  const gap = LINE_GAP * 0.55
  g.appendChild(
    el('circle', { cx: dotX, cy: fY - gap, r: 6 }, 'staff__clef-fill'),
  )
  g.appendChild(
    el('circle', { cx: dotX, cy: fY + gap, r: 6 }, 'staff__clef-fill'),
  )

  svg.appendChild(g)
}

function appendNote(svg: SVGElement, step: number): void {
  const noteX = 205
  const noteY = lineY(step)

  for (const ls of ledgerSteps(step)) {
    svg.appendChild(
      el(
        'line',
        {
          x1: noteX - 18,
          x2: noteX + 18,
          y1: lineY(ls),
          y2: lineY(ls),
        },
        'staff__line staff__ledger',
      ),
    )
  }

  svg.appendChild(
    el(
      'ellipse',
      {
        cx: noteX,
        cy: noteY,
        rx: 11,
        ry: 8,
        transform: `rotate(-20 ${noteX} ${noteY})`,
      },
      'staff__note',
    ),
  )

  const stemUp = step < 4
  const stemX = stemUp ? noteX + 10 : noteX - 10
  svg.appendChild(
    el(
      'line',
      {
        x1: stemX,
        x2: stemX,
        y1: noteY,
        y2: stemUp ? noteY - 50 : noteY + 50,
      },
      'staff__stem',
    ),
  )
}

export function renderStaff(
  container: HTMLElement,
  options: StaffRenderOptions,
): void {
  container.replaceChildren()
  container.className = 'staff'

  const minStep = Math.min(options.step, -1)
  const maxStep = Math.max(options.step, 9)
  const topY = lineY(maxStep) - 60
  const bottomY = lineY(minStep) + 60
  const height = bottomY - topY

  const svg = el('svg', {
    viewBox: `0 ${topY} ${VIEW_W} ${height}`,
    role: 'img',
    'aria-label': `${options.clef} clef — name the note on the staff`,
  })
  svg.classList.add('staff__svg')

  for (let i = 0; i < 5; i++) {
    const y = lineY(i * 2)
    svg.appendChild(
      el(
        'line',
        { x1: STAFF_LEFT, x2: STAFF_RIGHT, y1: y, y2: y },
        'staff__line',
      ),
    )
  }

  if (options.clef === 'treble') appendTrebleClef(svg)
  else appendBassClef(svg)

  appendNote(svg, options.step)
  container.appendChild(svg)
}
