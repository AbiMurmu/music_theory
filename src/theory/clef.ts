export const CLEF_IDS = ['treble', 'bass'] as const

export type ClefId = (typeof CLEF_IDS)[number]

export const CLEF_LABELS: Record<ClefId, string> = {
  treble: 'treble',
  bass: 'bass',
}

export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

export type NoteLetter = (typeof NOTE_LETTERS)[number]

const LETTER_INDEX: Record<NoteLetter, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
}

/** Diatonic index: C0 = 0, D0 = 1, … B0 = 6, C1 = 7, … */
export function diatonicIndex(letter: NoteLetter, octave: number): number {
  return octave * 7 + LETTER_INDEX[letter]
}

export function noteFromDiatonic(index: number): {
  letter: NoteLetter
  octave: number
} {
  const octave = Math.floor(index / 7)
  const letter = NOTE_LETTERS[((index % 7) + 7) % 7]
  return { letter, octave }
}

/**
 * Helmholtz-style labels:
 * C2=C, C3=c, C4=c', C5=c'', C6=c'''
 */
export function pitchLabel(letter: NoteLetter, octave: number): string {
  const lower = letter.toLowerCase()
  if (octave >= 4) return lower + "'".repeat(octave - 3)
  if (octave === 3) return lower
  if (octave === 2) return letter
  return letter + ','.repeat(2 - octave)
}

/** Bottom staff line as diatonic index. */
const CLEF_BOTTOM: Record<ClefId, number> = {
  treble: diatonicIndex('E', 4),
  bass: diatonicIndex('G', 2),
}

/** Staff step 0 = bottom line; +1 each space/line upward. */
export function staffStep(
  clef: ClefId,
  letter: NoteLetter,
  octave: number,
): number {
  return diatonicIndex(letter, octave) - CLEF_BOTTOM[clef]
}

export type StaffNote = {
  clef: ClefId
  letter: NoteLetter
  octave: number
  step: number
  label: string
}

/** Inclusive step ranges (ledger lines included). */
const CLEF_STEP_RANGE: Record<ClefId, readonly [number, number]> = {
  treble: [-5, 12], // F3 … C6
  bass: [-5, 12], // C2 … E4
}

export function notesForClef(clef: ClefId): StaffNote[] {
  const [lo, hi] = CLEF_STEP_RANGE[clef]
  const notes: StaffNote[] = []
  for (let step = lo; step <= hi; step++) {
    const { letter, octave } = noteFromDiatonic(CLEF_BOTTOM[clef] + step)
    notes.push({
      clef,
      letter,
      octave,
      step,
      label: pitchLabel(letter, octave),
    })
  }
  return notes
}

export type ClefQuestion = {
  type: 'clef'
  clef: ClefId
  letter: NoteLetter
  octave: number
  step: number
  correctAnswer: string
  choices: string[]
}

export function generateClefQuestion(
  clefs: readonly ClefId[] = CLEF_IDS,
): ClefQuestion {
  const active = clefs.length > 0 ? clefs : CLEF_IDS
  const pool = active.flatMap((clef) => notesForClef(clef))
  const note = pool[Math.floor(Math.random() * pool.length)]
  const choiceSet = new Set(pool.map((n) => n.label))
  return {
    type: 'clef',
    clef: note.clef,
    letter: note.letter,
    octave: note.octave,
    step: note.step,
    correctAnswer: note.label,
    choices: [...choiceSet],
  }
}
