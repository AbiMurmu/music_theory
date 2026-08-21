import {
  chordSize,
  configHint,
  DEFAULT_QUIZ_CONFIG,
  generateQuestion,
  notesMatch,
  type QuizConfig,
  type QuizQuestion,
} from '../theory/scales'
import { renderControls } from './setup'
import {
  renderKeylist,
  selectedKeylistValues,
  setKeylistDisabled,
} from './keylist'

type Score = { correct: number; total: number }

export function renderQuiz(root: HTMLElement): void {
  root.replaceChildren()
  root.className = 'screen quiz'

  let config: QuizConfig = {
    roots: [...DEFAULT_QUIZ_CONFIG.roots],
    scales: [...DEFAULT_QUIZ_CONFIG.scales],
    modes: [...DEFAULT_QUIZ_CONFIG.modes],
  }

  const toolbar = document.createElement('div')
  renderControls(toolbar, config, (next) => {
    config = next
    window.clearTimeout(advanceTimer)
    nextQuestion()
  })

  const scoreHost = toolbar.querySelector('[data-slot="score"]')
  scoreHost?.setAttribute('aria-live', 'polite')

  const promptEl = document.createElement('p')
  promptEl.className = 'prompt'
  promptEl.setAttribute('aria-live', 'polite')

  const metaEl = document.createElement('p')
  metaEl.className = 'meta'
  metaEl.setAttribute('aria-live', 'assertive')

  const keylistEl = document.createElement('div')

  const stage = document.createElement('div')
  stage.className = 'quiz-stage'
  stage.append(promptEl, metaEl, keylistEl)

  root.append(toolbar, stage)

  const score: Score = { correct: 0, total: 0 }
  let current: QuizQuestion | null = null
  let locked = false
  let advanceTimer = 0

  function updateScore(): void {
    const el = toolbar.querySelector('[data-slot="score"]')
    if (el) el.textContent = `${score.correct} / ${score.total}`
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

  function handleSingle(value: string): void {
    if (!current || locked || current.type === 'chord') return
    gradeAndAdvance(value === current.correctAnswer, current.correctAnswer)
  }

  function handleChordToggle(): void {
    if (!current || locked || current.type !== 'chord') return
    const selected = selectedKeylistValues(keylistEl)
    const need = chordSize(current.chordType)
    if (selected.length < need) return
    const label = current.correctNotes.join(' ')
    gradeAndAdvance(notesMatch(selected, current.correctNotes), label)
  }

  function nextQuestion(): void {
    locked = false
    const hint = configHint(config)
    const question = generateQuestion(config)
    if (!question) {
      setMeta(hint ?? 'select options in the menus', 'warn')
      setKeylistDisabled(keylistEl, true)
      return
    }

    current = question
    promptEl.textContent = current.prompt

    if (current.type === 'chord') {
      setMeta(`select ${chordSize(current.chordType)} keys`, '')
      renderKeylist(keylistEl, {
        choices: current.choices,
        mode: 'multi',
        onSelect: handleChordToggle,
      })
    } else {
      setMeta('', '')
      renderKeylist(keylistEl, {
        choices: current.choices,
        mode: 'single',
        onSelect: handleSingle,
      })
    }
  }

  updateScore()
  nextQuestion()
}
