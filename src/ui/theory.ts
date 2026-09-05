import {
  CLEF_IDS,
  LINE_COUNTS,
  MIN_LINE_COUNT,
  generateClefQuestion,
  type ClefId,
  type ClefQuestion,
  type LineCount,
} from '../theory/clef'
import { renderKeylist, setKeylistDisabled } from './keylist'
import { renderStaff } from './staff'
import { renderNav } from './nav'

type Score = { correct: number; total: number }

export function renderTheory(root: HTMLElement): void {
  root.replaceChildren()
  root.className = 'screen theory'

  let clefs: ClefId[] = [...CLEF_IDS]
  let lines: LineCount = MIN_LINE_COUNT

  const toolbar = document.createElement('div')
  toolbar.className = 'toolbar'

  const navHost = document.createElement('div')
  renderNav(navHost, 'theory')

  const menus = document.createElement('div')
  menus.className = 'menus'

  const scoreSlot = document.createElement('div')
  scoreSlot.className = 'toolbar__score'
  scoreSlot.dataset.slot = 'score'

  const selectedClefs = new Set<ClefId>(clefs)

  function refreshAndNext(): void {
    window.clearTimeout(advanceTimer)
    nextQuestion()
  }

  function makeMenu(
    id: string,
    summaryText: string,
    fill: (panel: HTMLElement) => void,
  ): HTMLDetailsElement {
    const details = document.createElement('details')
    details.className = 'menu'
    details.dataset.menu = id

    const summary = document.createElement('summary')
    summary.className = 'menu__summary'
    summary.textContent = summaryText

    const panel = document.createElement('div')
    panel.className = 'menu__panel menu__panel--modes'
    fill(panel)

    details.append(summary, panel)
    details.addEventListener('toggle', () => {
      if (!details.open) return
      menus.querySelectorAll('details.menu').forEach((el) => {
        if (el !== details) (el as HTMLDetailsElement).open = false
      })
    })
    menus.appendChild(details)
    return details
  }

  makeMenu('clef', 'clef', (panel) => {
    for (const id of CLEF_IDS) {
      const label = document.createElement('label')
      label.className = 'menu-item'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.checked = selectedClefs.has(id)
      input.addEventListener('change', () => {
        if (input.checked) selectedClefs.add(id)
        else selectedClefs.delete(id)
        clefs = CLEF_IDS.filter((c) => selectedClefs.has(c))
        refreshAndNext()
      })
      const span = document.createElement('span')
      span.textContent = id
      label.append(input, span)
      panel.appendChild(label)
    }
  })

  const linesMenu = makeMenu('lines', 'lines', (panel) => {
    for (const count of LINE_COUNTS) {
      const label = document.createElement('label')
      label.className = 'menu-item'
      const input = document.createElement('input')
      input.type = 'radio'
      input.name = 'theory-lines'
      input.checked = count === lines
      input.addEventListener('change', () => {
        if (!input.checked) return
        lines = count
        linesMenu.querySelector('summary')!.textContent =
          count === 5 ? '5 lines' : `${count} lines`
        refreshAndNext()
      })
      const span = document.createElement('span')
      const extra = count - MIN_LINE_COUNT
      span.textContent =
        extra === 0 ? '5 (staff only)' : `${count} (+${extra} ledger)`
      label.append(input, span)
      panel.appendChild(label)
    }
  })
  linesMenu.querySelector('summary')!.textContent = '5 lines'

  toolbar.append(navHost, menus, scoreSlot)

  const staffEl = document.createElement('div')
  staffEl.className = 'staff-host'

  const metaEl = document.createElement('p')
  metaEl.className = 'meta'
  metaEl.setAttribute('aria-live', 'assertive')

  const keylistEl = document.createElement('div')

  const stage = document.createElement('div')
  stage.className = 'quiz-stage'
  stage.append(staffEl, metaEl, keylistEl)

  root.append(toolbar, stage)

  const score: Score = { correct: 0, total: 0 }
  let current: ClefQuestion | null = null
  let locked = false
  let advanceTimer = 0

  function updateScore(): void {
    scoreSlot.textContent = `${score.correct} / ${score.total}`
  }

  function setMeta(text: string, kind: '' | 'ok' | 'bad' | 'warn'): void {
    metaEl.textContent = text
    metaEl.className = kind ? `meta meta--${kind}` : 'meta'
  }

  function gradeAndAdvance(ok: boolean, correctLabel: string): void {
    locked = true
    setKeylistDisabled(keylistEl, true)
    score.total += 1
    if (ok) {
      score.correct += 1
      setMeta('correct', 'ok')
    } else {
      setMeta(`incorrect · ${correctLabel}`, 'bad')
    }
    updateScore()
    advanceTimer = window.setTimeout(() => nextQuestion(), 900)
  }

  function handleSelect(value: string): void {
    if (!current || locked) return
    gradeAndAdvance(value === current.correctAnswer, current.correctAnswer)
  }

  function nextQuestion(): void {
    locked = false
    if (clefs.length === 0) {
      staffEl.replaceChildren()
      setMeta('select treble or bass clef', 'warn')
      setKeylistDisabled(keylistEl, true)
      return
    }

    current = generateClefQuestion(clefs, lines)
    renderStaff(staffEl, { clef: current.clef, step: current.step })
    setMeta('which note?', '')
    renderKeylist(keylistEl, {
      choices: current.choices,
      mode: 'single',
      onSelect: handleSelect,
    })
  }

  updateScore()
  nextQuestion()
}
