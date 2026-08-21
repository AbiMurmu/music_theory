import {
  CHORD_TYPE_IDS,
  CHORD_TYPE_LABELS,
  ROOT_NOTES,
  SCALE_IDS,
  SCALE_LABELS,
  type ChordTypeId,
  type QuizConfig,
  type RootNote,
  type ScaleId,
} from '../theory/scales'

export function renderControls(
  container: HTMLElement,
  config: QuizConfig,
  onChange: (next: QuizConfig) => void,
): void {
  container.replaceChildren()
  container.className = 'controls'

  const selectedRoots = new Set<RootNote>(config.roots)
  const selectedScales = new Set<ScaleId>(config.scales)
  const selectedChordTypes = new Set<ChordTypeId>(config.chordTypes)
  let includeDegrees = config.includeDegrees
  let includeChords = config.includeChords

  function emit(): void {
    onChange({
      roots: ROOT_NOTES.filter((n) => selectedRoots.has(n)),
      scales: SCALE_IDS.filter((id) => selectedScales.has(id)),
      includeDegrees,
      includeChords,
      chordTypes: CHORD_TYPE_IDS.filter((id) => selectedChordTypes.has(id)),
    })
    syncChordTypes()
  }

  function addCheck(
    grid: HTMLElement,
    text: string,
    checked: boolean,
    onToggle: (on: boolean) => void,
  ): HTMLInputElement {
    const label = document.createElement('label')
    label.className = 'check'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = checked
    input.addEventListener('change', () => onToggle(input.checked))
    label.append(input, document.createTextNode(text))
    grid.appendChild(label)
    return input
  }

  const rootsFieldset = document.createElement('fieldset')
  rootsFieldset.className = 'fieldset'
  const rootsLegend = document.createElement('legend')
  rootsLegend.textContent = 'root notes'
  const rootsGrid = document.createElement('div')
  rootsGrid.className = 'check-grid'
  for (const note of ROOT_NOTES) {
    addCheck(rootsGrid, note, selectedRoots.has(note), (on) => {
      if (on) selectedRoots.add(note)
      else selectedRoots.delete(note)
      emit()
    })
  }
  rootsFieldset.append(rootsLegend, rootsGrid)

  const scalesFieldset = document.createElement('fieldset')
  scalesFieldset.className = 'fieldset'
  const scalesLegend = document.createElement('legend')
  scalesLegend.textContent = 'scales'
  const scalesGrid = document.createElement('div')
  scalesGrid.className = 'check-grid check-grid--wide'
  for (const id of SCALE_IDS) {
    addCheck(scalesGrid, SCALE_LABELS[id], selectedScales.has(id), (on) => {
      if (on) selectedScales.add(id)
      else selectedScales.delete(id)
      emit()
    })
  }
  scalesFieldset.append(scalesLegend, scalesGrid)

  const typesFieldset = document.createElement('fieldset')
  typesFieldset.className = 'fieldset'
  const typesLegend = document.createElement('legend')
  typesLegend.textContent = 'quiz types'
  const typesGrid = document.createElement('div')
  typesGrid.className = 'check-grid check-grid--wide'
  addCheck(typesGrid, 'degrees', includeDegrees, (on) => {
    includeDegrees = on
    emit()
  })
  addCheck(typesGrid, 'chords', includeChords, (on) => {
    includeChords = on
    emit()
  })
  typesFieldset.append(typesLegend, typesGrid)

  const chordsFieldset = document.createElement('fieldset')
  chordsFieldset.className = 'fieldset'
  const chordsLegend = document.createElement('legend')
  chordsLegend.textContent = 'chord types'
  const chordsGrid = document.createElement('div')
  chordsGrid.className = 'check-grid'
  const chordInputs: HTMLInputElement[] = []
  for (const id of CHORD_TYPE_IDS) {
    const input = addCheck(
      chordsGrid,
      CHORD_TYPE_LABELS[id],
      selectedChordTypes.has(id),
      (on) => {
        if (on) selectedChordTypes.add(id)
        else selectedChordTypes.delete(id)
        emit()
      },
    )
    chordInputs.push(input)
  }
  chordsFieldset.append(chordsLegend, chordsGrid)

  function syncChordTypes(): void {
    chordsFieldset.classList.toggle('fieldset--dim', !includeChords)
    for (const input of chordInputs) {
      input.disabled = !includeChords
    }
  }
  syncChordTypes()

  container.append(rootsFieldset, scalesFieldset, typesFieldset, chordsFieldset)
}
