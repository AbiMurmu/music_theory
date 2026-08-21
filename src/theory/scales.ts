export const ROOT_NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export type RootNote = (typeof ROOT_NOTES)[number]

export const SCALE_IDS = [
  'major',
  'naturalMinor',
  'harmonicMinor',
  'melodicMinor',
  'majorPentatonic',
  'minorPentatonic',
] as const

export type ScaleId = (typeof SCALE_IDS)[number]

export const HEPTATONIC_SCALE_IDS = [
  'major',
  'naturalMinor',
  'harmonicMinor',
  'melodicMinor',
] as const satisfies readonly ScaleId[]

export function isHeptatonic(scaleId: ScaleId): boolean {
  return (HEPTATONIC_SCALE_IDS as readonly string[]).includes(scaleId)
}

export const SCALE_LABELS: Record<ScaleId, string> = {
  major: 'Major',
  naturalMinor: 'Natural Minor',
  harmonicMinor: 'Harmonic Minor',
  melodicMinor: 'Melodic Minor',
  majorPentatonic: 'Major Pentatonic',
  minorPentatonic: 'Minor Pentatonic',
}

export const MODE_IDS = ['single', 'triad', 'seventh', 'ninth'] as const

export type QuizModeId = (typeof MODE_IDS)[number]

export const MODE_LABELS: Record<QuizModeId, string> = {
  single: 'single note',
  triad: 'triad',
  seventh: '7th',
  ninth: '9th',
}

export const CHORD_TYPE_IDS = ['triad', 'seventh', 'ninth'] as const

export type ChordTypeId = (typeof CHORD_TYPE_IDS)[number]

export const ANSWER_IDS = ['notes', 'degrees'] as const

export type AnswerId = (typeof ANSWER_IDS)[number]

export const ANSWER_LABELS: Record<AnswerId, string> = {
  notes: 'notes',
  degrees: 'degrees',
}

export const DEGREE_CHOICES = [
  '1',
  'b2',
  '2',
  'b3',
  '3',
  '4',
  'b5',
  '5',
  '#5',
  '6',
  'b7',
  '7',
] as const

export const NINTH_DEGREE_CHOICES = [
  '1',
  'b3',
  '3',
  '4',
  'b5',
  '5',
  '#5',
  '6',
  'b7',
  '7',
  'b9',
  '9',
] as const

/** Semitone offsets from root for each scale. */
const SCALE_INTERVALS: Record<ScaleId, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
}

const NOTE_INDEX: Record<RootNote, number> = Object.fromEntries(
  ROOT_NOTES.map((n, i) => [n, i]),
) as Record<RootNote, number>

export function degreeLabel(degree: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = degree % 100
  const suffix =
    v >= 11 && v <= 13 ? 'th' : suffixes[degree % 10] ?? 'th'
  return `${degree}${suffix}`
}

export function buildScale(root: RootNote, scaleId: ScaleId): RootNote[] {
  const rootIndex = NOTE_INDEX[root]
  return SCALE_INTERVALS[scaleId].map(
    (semitones) => ROOT_NOTES[(rootIndex + semitones) % 12],
  )
}

export function noteAtDegree(
  root: RootNote,
  scaleId: ScaleId,
  degree: number,
): RootNote {
  const scale = buildScale(root, scaleId)
  if (degree < 1 || degree > scale.length) {
    throw new Error(`Degree ${degree} out of range for ${scaleId}`)
  }
  return scale[degree - 1]
}

export function degreeOfNote(
  root: RootNote,
  scaleId: ScaleId,
  note: RootNote,
): number | null {
  const scale = buildScale(root, scaleId)
  const index = scale.indexOf(note)
  return index === -1 ? null : index + 1
}

export function chordSize(type: ChordTypeId): number {
  if (type === 'triad') return 3
  if (type === 'seventh') return 4
  return 5
}

export function diatonicChord(
  root: RootNote,
  scaleId: ScaleId,
  degree: number,
  size: number,
): RootNote[] {
  const scale = buildScale(root, scaleId)
  if (!isHeptatonic(scaleId)) {
    throw new Error(`Diatonic chords require a 7-note scale, got ${scaleId}`)
  }
  if (degree < 1 || degree > scale.length) {
    throw new Error(`Degree ${degree} out of range for ${scaleId}`)
  }
  const notes: RootNote[] = []
  for (let i = 0; i < size; i++) {
    notes.push(scale[(degree - 1 + i * 2) % scale.length])
  }
  return notes
}

export function chordPromptLabel(type: ChordTypeId): string {
  if (type === 'triad') return 'chord'
  if (type === 'seventh') return '7th'
  return '9th'
}

const CHROMATIC_DEGREE = [
  '1',
  'b2',
  '2',
  'b3',
  '3',
  '4',
  'b5',
  '5',
  '#5',
  '6',
  'b7',
  '7',
] as const

function intervalLabel(voice: number, semitones: number): string {
  if (voice === 0) return '1'
  if (voice === 1) {
    if (semitones === 2) return '2'
    if (semitones === 3) return 'b3'
    if (semitones === 4) return '3'
    if (semitones === 5) return '4'
  }
  if (voice === 2) {
    if (semitones === 6) return 'b5'
    if (semitones === 7) return '5'
    if (semitones === 8) return '#5'
  }
  if (voice === 3) {
    if (semitones === 9) return '6'
    if (semitones === 10) return 'b7'
    if (semitones === 11) return '7'
  }
  if (voice >= 4) {
    if (semitones === 1) return 'b9'
    if (semitones === 2) return '9'
    if (semitones === 3) return '#9'
  }
  return CHROMATIC_DEGREE[semitones] ?? String(semitones)
}

/** Chord tones as 1, b3, 5, b7, 9, … from the chord root. */
export function chordDegreeLabels(notes: readonly RootNote[]): string[] {
  if (notes.length === 0) return []
  const rootIndex = NOTE_INDEX[notes[0]]
  return notes.map((note, voice) => {
    const semitones = (NOTE_INDEX[note] - rootIndex + 12) % 12
    return intervalLabel(voice, semitones)
  })
}

export function notesMatch(
  selected: readonly string[],
  correct: readonly string[],
): boolean {
  if (selected.length !== correct.length) return false
  const want = new Set(correct)
  return selected.every((n) => want.has(n))
}

export type QuestionType = 'degreeToNote' | 'noteToDegree' | 'chord'

export type DegreeToNoteQuestion = {
  type: 'degreeToNote'
  root: RootNote
  scaleId: ScaleId
  degree: number
  prompt: string
  correctAnswer: string
  choices: string[]
}

export type NoteToDegreeQuestion = {
  type: 'noteToDegree'
  root: RootNote
  scaleId: ScaleId
  note: RootNote
  prompt: string
  correctAnswer: string
  choices: string[]
}

export type ChordQuestion = {
  type: 'chord'
  root: RootNote
  scaleId: ScaleId
  degree: number
  chordType: ChordTypeId
  answerKind: AnswerId
  prompt: string
  correctNotes: RootNote[]
  correctAnswers: string[]
  choices: string[]
}

export type QuizQuestion =
  | DegreeToNoteQuestion
  | NoteToDegreeQuestion
  | ChordQuestion

export type QuizConfig = {
  roots: RootNote[]
  scales: ScaleId[]
  modes: QuizModeId[]
  answers: AnswerId[]
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  roots: ['C'],
  scales: ['major'],
  modes: ['single', 'triad', 'seventh', 'ninth'],
  answers: ['notes', 'degrees'],
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function chordModesOf(config: QuizConfig): ChordTypeId[] {
  return config.modes.filter((m): m is ChordTypeId => m !== 'single')
}

function playableModes(config: QuizConfig): QuizModeId[] {
  if (config.roots.length === 0 || config.scales.length === 0) return []
  const modes: QuizModeId[] = []
  if (config.modes.includes('single')) modes.push('single')
  const heptatonic = config.scales.some(isHeptatonic)
  for (const mode of chordModesOf(config)) {
    if (heptatonic && config.answers.length > 0) modes.push(mode)
  }
  return modes
}

export function configCanGenerate(config: QuizConfig): boolean {
  return playableModes(config).length > 0
}

export function configHint(config: QuizConfig): string | null {
  if (config.roots.length === 0) return 'select at least one root'
  if (config.scales.length === 0) return 'select at least one scale'
  if (config.modes.length === 0) {
    return 'select single note, triad, 7th or 9th'
  }
  if (chordModesOf(config).length > 0 && config.answers.length === 0) {
    return 'select notes or degrees'
  }
  if (
    !config.modes.includes('single') &&
    chordModesOf(config).length > 0 &&
    !config.scales.some(isHeptatonic)
  ) {
    return 'chords need a 7-note scale'
  }
  if (
    config.modes.includes('single') === false &&
    chordModesOf(config).length === 0
  ) {
    return 'select single note, triad, 7th or 9th'
  }
  if (
    chordModesOf(config).length > 0 &&
    !config.scales.some(isHeptatonic) &&
    config.modes.includes('single')
  ) {
    return 'chords need a 7-note scale'
  }
  return null
}

export function generateQuestion(config: QuizConfig): QuizQuestion | null {
  const modes = playableModes(config)
  if (modes.length === 0) return null

  const mode = pickRandom(modes)
  const root = pickRandom(config.roots)

  if (mode !== 'single') {
    const scaleId = pickRandom(config.scales.filter(isHeptatonic))
    const scale = buildScale(root, scaleId)
    const degree = pickRandom(
      Array.from({ length: scale.length }, (_, i) => i + 1),
    )
    const notes = diatonicChord(root, scaleId, degree, chordSize(mode))
    const scaleLabel = SCALE_LABELS[scaleId]
    const formats =
      config.answers.length > 0 ? config.answers : (['notes'] as AnswerId[])
    const answerKind = pickRandom(formats)
    const degrees = chordDegreeLabels(notes)
    return {
      type: 'chord',
      root,
      scaleId,
      degree,
      chordType: mode,
      answerKind,
      prompt: `${degreeLabel(degree)} ${chordPromptLabel(mode)} of ${root} ${scaleLabel}`,
      correctNotes: notes,
      correctAnswers: answerKind === 'degrees' ? degrees : [...notes],
      choices:
        answerKind === 'degrees'
          ? mode === 'ninth'
            ? [...NINTH_DEGREE_CHOICES]
            : [...DEGREE_CHOICES]
          : [...ROOT_NOTES],
    }
  }

  const scaleId = pickRandom(config.scales)
  const scale = buildScale(root, scaleId)
  const scaleLabel = SCALE_LABELS[scaleId]
  const degree = pickRandom(
    Array.from({ length: scale.length }, (_, i) => i + 1),
  )
  const correct = noteAtDegree(root, scaleId, degree)
  return {
    type: 'degreeToNote',
    root,
    scaleId,
    degree,
    prompt: `${degreeLabel(degree)} of ${root} ${scaleLabel}`,
    correctAnswer: correct,
    choices: [...ROOT_NOTES],
  }
}
