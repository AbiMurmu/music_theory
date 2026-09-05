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

/** Bottom staff line as diatonic index. */
const CLEF_BOTTOM: Record<ClefId, number> = {
  treble: diatonicIndex('E', 4),
  bass: diatonicIndex('G', 2),
}

/** Staff step 0 = bottom line; +1 each space/line upward. */
export function staffStep(clef: ClefId, letter: NoteLetter, octave: number): number {
  return diatonicIndex(letter, octave) - CLEF_BOTTOM[clef]
}

export type StaffNote = {
  clef: ClefId
  letter: NoteLetter
  octave: number
  /** Steps above the bottom staff line. */
  step: number
}

/** Inclusive step ranges (ledger lines included). */
const CLEF_STEP_RANGE: Record<ClefId, readonly [number, number]> = {
  treble: [-2, 10], // C4 … A5
  bass: [-2, 10], // E2 … C4
}

export function notesForClef(clef: ClefId): StaffNote[] {
  const [lo, hi] = CLEF_STEP_RANGE[clef]
  const notes: StaffNote[] = []
  for (let step = lo; step <= hi; step++) {
    const { letter, octave } = noteFromDiatonic(CLEF_BOTTOM[clef] + step)
    notes.push({ clef, letter, octave, step })
  }
  return notes
}

export function pickClefNote(clefs: readonly ClefId[]): StaffNote {
  const pool = clefs.flatMap((clef) => notesForClef(clef))
  return pool[Math.floor(Math.random() * pool.length)]
}
