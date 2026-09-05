import {
  ANSWER_IDS,
  ANSWER_LABELS,
  CLEF_IDS,
  CLEF_LABELS,
  MODE_IDS,
  MODE_LABELS,
  QUALITY_DEFS,
  QUALITY_IDS,
  ROOT_NOTES,
  SCALE_IDS,
  SCALE_LABELS,
  type AnswerId,
  type ClefId,
  type QualityId,
  type QuizConfig,
  type QuizModeId,
  type RootNote,
  type ScaleId,
} from '../theory/scales'

export function renderControls(
  container: HTMLElement,
  config: QuizConfig,
  onChange: (next: QuizConfig) => void,
): void {
  container.replaceChildren()
  container.className = 'toolbar'

  const selectedRoots = new Set<RootNote>(config.roots)
  const selectedScales = new Set<ScaleId>(config.scales)
  const selectedModes = new Set<QuizModeId>(config.modes)
  const selectedAnswers = new Set<AnswerId>(config.answers)
  const selectedQualities = new Set<QualityId>(config.qualities)
  const selectedClefs = new Set<ClefId>(config.clefs)

  const menus = document.createElement('div')
  menus.className = 'menus'

  const scoreSlot = document.createElement('div')
  scoreSlot.className = 'toolbar__score'
  scoreSlot.dataset.slot = 'score'

  function emit(): void {
    onChange({
      roots: ROOT_NOTES.filter((n) => selectedRoots.has(n)),
      scales: SCALE_IDS.filter((id) => selectedScales.has(id)),
      modes: MODE_IDS.filter((id) => selectedModes.has(id)),
      answers: ANSWER_IDS.filter((id) => selectedAnswers.has(id)),
      qualities: QUALITY_IDS.filter((id) => selectedQualities.has(id)),
      clefs: CLEF_IDS.filter((id) => selectedClefs.has(id)),
    })
    refreshSummaries()
  }

  function addCheck(
    grid: HTMLElement,
    text: string,
    checked: boolean,
    onToggle: (on: boolean) => void,
  ): void {
    const label = document.createElement('label')
    label.className = 'menu-item'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = checked
    input.addEventListener('change', () => onToggle(input.checked))
    const span = document.createElement('span')
    span.textContent = text
    label.append(input, span)
    grid.appendChild(label)
  }

  function makeMenu(
    id: string,
    panelClass: string,
    fill: (panel: HTMLElement) => void,
  ): { details: HTMLDetailsElement; summary: HTMLElement } {
    const details = document.createElement('details')
    details.className = 'menu'
    details.dataset.menu = id

    const summary = document.createElement('summary')
    summary.className = 'menu__summary'

    const panel = document.createElement('div')
    panel.className = `menu__panel ${panelClass}`
    fill(panel)

    details.append(summary, panel)
    details.addEventListener('toggle', () => {
      if (!details.open) return
      menus.querySelectorAll('details.menu').forEach((el) => {
        if (el !== details) (el as HTMLDetailsElement).open = false
      })
    })
    menus.appendChild(details)
    return { details, summary }
  }

  const practice = makeMenu('type', 'menu__panel--modes', (panel) => {
    for (const id of MODE_IDS) {
      addCheck(panel, MODE_LABELS[id], selectedModes.has(id), (on) => {
        if (on) selectedModes.add(id)
        else selectedModes.delete(id)
        emit()
      })
    }
  })

  const qualities = makeMenu('chord-type', 'menu__panel--modes', (panel) => {
    for (const def of QUALITY_DEFS) {
      addCheck(panel, def.menu, selectedQualities.has(def.id), (on) => {
        if (on) selectedQualities.add(def.id)
        else selectedQualities.delete(def.id)
        emit()
      })
    }
  })

  const clefs = makeMenu('clef', 'menu__panel--modes', (panel) => {
    for (const id of CLEF_IDS) {
      addCheck(panel, CLEF_LABELS[id], selectedClefs.has(id), (on) => {
        if (on) selectedClefs.add(id)
        else selectedClefs.delete(id)
        emit()
      })
    }
  })

  const roots = makeMenu('roots', 'menu__panel--keys', (panel) => {
    for (const note of ROOT_NOTES) {
      addCheck(panel, note, selectedRoots.has(note), (on) => {
        if (on) selectedRoots.add(note)
        else selectedRoots.delete(note)
        emit()
      })
    }
  })

  const scales = makeMenu('scales', 'menu__panel--scales', (panel) => {
    for (const id of SCALE_IDS) {
      addCheck(panel, SCALE_LABELS[id], selectedScales.has(id), (on) => {
        if (on) selectedScales.add(id)
        else selectedScales.delete(id)
        emit()
      })
    }
  })

  const answers = makeMenu('degree-notes', 'menu__panel--modes', (panel) => {
    for (const id of ANSWER_IDS) {
      addCheck(panel, ANSWER_LABELS[id], selectedAnswers.has(id), (on) => {
        if (on) selectedAnswers.add(id)
        else selectedAnswers.delete(id)
        emit()
      })
    }
  })

  function refreshSummaries(): void {
    practice.summary.textContent = 'type'
    qualities.summary.textContent = 'chord type'
    clefs.summary.textContent = 'clef'
    roots.summary.textContent = 'root note'
    scales.summary.textContent = 'scale'
    answers.summary.textContent = 'degree/notes'
  }

  refreshSummaries()

  document.addEventListener('pointerdown', (event) => {
    const target = event.target
    if (!(target instanceof Node)) return
    if (menus.contains(target)) return
    menus.querySelectorAll('details.menu').forEach((el) => {
      ;(el as HTMLDetailsElement).open = false
    })
  })

  container.append(menus, scoreSlot)
}
