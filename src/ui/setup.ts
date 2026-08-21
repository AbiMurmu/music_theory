import {
  MODE_IDS,
  MODE_LABELS,
  ROOT_NOTES,
  SCALE_IDS,
  SCALE_LABELS,
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

  const practice = makeMenu('practice', 'menu__panel--modes', (panel) => {
    for (const id of MODE_IDS) {
      addCheck(panel, MODE_LABELS[id], selectedModes.has(id), (on) => {
        if (on) selectedModes.add(id)
        else selectedModes.delete(id)
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

  function refreshSummaries(): void {
    const modeNames = MODE_IDS.filter((id) => selectedModes.has(id)).map(
      (id) => MODE_LABELS[id],
    )
    practice.summary.textContent =
      modeNames.length === 0
        ? 'practice'
        : modeNames.length <= 2
          ? modeNames.join(' · ')
          : `practice · ${modeNames.length}`

    const rootList = ROOT_NOTES.filter((n) => selectedRoots.has(n))
    roots.summary.textContent =
      rootList.length === 0
        ? 'roots'
        : rootList.length === 1
          ? rootList[0]
          : `roots · ${rootList.length}`

    const scaleList = SCALE_IDS.filter((id) => selectedScales.has(id))
    scales.summary.textContent =
      scaleList.length === 0
        ? 'scales'
        : scaleList.length === 1
          ? SCALE_LABELS[scaleList[0]]
          : `scales · ${scaleList.length}`
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
