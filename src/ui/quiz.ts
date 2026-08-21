import {
  chordSize,
  configCanGenerate,
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

  let config: QuizConfig = { ...DEFAULT_QUIZ_CONFIG, chordTypes: [...DEFAULT_QUIZ_CONFIG.chordTypes], roots: [...DEFAULT_QUIZ_CONFIG.roots], scales: [...DEFAULT_QUIZ_CONFIG.scales] }

  const header = document.createElement('header')
  header.className = 'quiz-header'

  const title = document.createElement('h1')
  title.className = 'title'
  title.textContent = 'scale quiz'

  const scoreEl = document.createElement('p')
  scoreEl.className = 'score'
  scoreEl.setAttribute('aria-live', 'polite')

  header.append(title, scoreEl)

  const promptEl = document.createElement('p')
  promptEl.className = 'prompt'
  promptEl.setAttribute('aria-live', 'polite')

  const selectHintEl = document.createElement('p')
  selectHintEl.className = 'hint hint--select'

  const feedbackEl = document.createElement('p')
  feedbackEl.className = 'feedback'
  feedbackEl.setAttribute('aria-live', 'assertive')

  const keylistEl = document.createElement('div')

  const quizMain = document.createElement('div')
  quizMain.className = 'quiz-main'
  quizMain.append(header, promptEl, selectHintEl, feedbackEl, keylistEl)

  const configHintEl = document.createElement('p')
  configHintEl.className = 'hint'

  const controlsEl = document.createElement('div')

  root.append(quizMain, configHintEl, controlsEl)

  const score: Score = { correct: 0, total: 0 }
  let current: QuizQuestion | null = null
  let locked = false

  function updateScore(): void {
    scoreEl.textContent = `${score.correct} / ${score.total}`
  }

  function gradeAndAdvance(ok: boolean, correctLabel: string): void {
    locked = true
    setKeylistDisabled(keylistEl, true)
    score.total += 1
    if (ok) {
      score.correct += 1
      feedbackEl.textContent = 'correct'
      feedbackEl.className = 'feedback feedback--ok'
    } else {
      feedbackEl.textContent = `incorrect · ${correctLabel}`
      feedbackEl.className = 'feedback feedback--bad'
    }
    updateScore()
    window.setTimeout(() => nextQuestion(), 900)
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
    feedbackEl.textContent = ''
    feedbackEl.className = 'feedback'

    const hint = configHint(config)
    configHintEl.textContent = hint ?? ''
    configHintEl.hidden = hint === null

    const question = generateQuestion(config)
    if (!question) {
      setKeylistDisabled(keylistEl, true)
      selectHintEl.textContent = ''
      return
    }

    current = question
    promptEl.textContent = current.prompt

    if (current.type === 'chord') {
      const n = chordSize(current.chordType)
      selectHintEl.textContent = `select ${n} keys`
      renderKeylist(keylistEl, {
        choices: current.choices,
        mode: 'multi',
        onSelect: handleChordToggle,
      })
    } else {
      selectHintEl.textContent = ''
      renderKeylist(keylistEl, {
        choices: current.choices,
        mode: 'single',
        onSelect: handleSingle,
      })
    }
  }

  renderControls(controlsEl, config, (next) => {
    config = next
    const hint = configHint(config)
    configHintEl.textContent = hint ?? ''
    configHintEl.hidden = hint === null
    if (!configCanGenerate(config)) {
      setKeylistDisabled(keylistEl, true)
    } else if (!locked) {
      setKeylistDisabled(keylistEl, false)
    }
  })

  updateScore()
  nextQuestion()
}
