;(function () {
  'use strict'

  var ROOT_NOTES = [
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
  ]

  var SCALE_IDS = [
    'major',
    'naturalMinor',
    'harmonicMinor',
    'melodicMinor',
    'majorPentatonic',
    'minorPentatonic',
  ]

  var HEPTATONIC = {
    major: true,
    naturalMinor: true,
    harmonicMinor: true,
    melodicMinor: true,
  }

  var SCALE_LABELS = {
    major: 'Major',
    naturalMinor: 'Natural Minor',
    harmonicMinor: 'Harmonic Minor',
    melodicMinor: 'Melodic Minor',
    majorPentatonic: 'Major Pentatonic',
    minorPentatonic: 'Minor Pentatonic',
  }

  var CHORD_TYPE_IDS = ['triad', 'seventh', 'ninth']

  var CHORD_TYPE_LABELS = {
    triad: 'triad',
    seventh: '7th',
    ninth: '9th',
  }

  var SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    naturalMinor: [0, 2, 3, 5, 7, 8, 10],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    melodicMinor: [0, 2, 3, 5, 7, 9, 11],
    majorPentatonic: [0, 2, 4, 7, 9],
    minorPentatonic: [0, 3, 5, 7, 10],
  }

  var NOTE_INDEX = {}
  for (var i = 0; i < ROOT_NOTES.length; i++) {
    NOTE_INDEX[ROOT_NOTES[i]] = i
  }

  function degreeLabel(degree) {
    var suffixes = ['th', 'st', 'nd', 'rd']
    var v = degree % 100
    var suffix =
      v >= 11 && v <= 13 ? 'th' : suffixes[degree % 10] || 'th'
    return degree + suffix
  }

  function buildScale(root, scaleId) {
    var rootIndex = NOTE_INDEX[root]
    return SCALE_INTERVALS[scaleId].map(function (semitones) {
      return ROOT_NOTES[(rootIndex + semitones) % 12]
    })
  }

  function chordSize(type) {
    if (type === 'triad') return 3
    if (type === 'seventh') return 4
    return 5
  }

  function chordPromptLabel(type) {
    if (type === 'triad') return 'chord'
    if (type === 'seventh') return '7th'
    return '9th'
  }

  function diatonicChord(root, scaleId, degree, size) {
    var scale = buildScale(root, scaleId)
    var notes = []
    for (var i = 0; i < size; i++) {
      notes.push(scale[(degree - 1 + i * 2) % scale.length])
    }
    return notes
  }

  function notesMatch(selected, correct) {
    if (selected.length !== correct.length) return false
    var want = {}
    for (var i = 0; i < correct.length; i++) want[correct[i]] = true
    for (var j = 0; j < selected.length; j++) {
      if (!want[selected[j]]) return false
    }
    return true
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)]
  }

  function shuffle(items) {
    var result = items.slice()
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var tmp = result[i]
      result[i] = result[j]
      result[j] = tmp
    }
    return result
  }

  function keysOf(obj) {
    return Object.keys(obj)
  }

  function heptatonicScales(scales) {
    return scales.filter(function (id) {
      return HEPTATONIC[id]
    })
  }

  function getConfig() {
    return {
      roots: keysOf(selectedRoots),
      scales: keysOf(selectedScales),
      includeDegrees: includeDegrees,
      includeChords: includeChords,
      chordTypes: keysOf(selectedChordTypes),
    }
  }

  function enabledFamilies(config) {
    var families = []
    if (config.includeDegrees && config.scales.length > 0) {
      families.push('degreeToNote', 'noteToDegree')
    }
    if (
      config.includeChords &&
      heptatonicScales(config.scales).length > 0 &&
      config.chordTypes.length > 0
    ) {
      families.push('chord')
    }
    return families
  }

  function configCanGenerate(config) {
    return config.roots.length > 0 && enabledFamilies(config).length > 0
  }

  function configHint(config) {
    if (config.roots.length === 0) return 'select at least one root'
    if (config.scales.length === 0) return 'select at least one scale'
    if (!config.includeDegrees && !config.includeChords) {
      return 'select degrees or chords'
    }
    if (config.includeChords && config.chordTypes.length === 0) {
      if (!config.includeDegrees) return 'select a chord type'
    }
    if (config.includeChords && heptatonicScales(config.scales).length === 0) {
      return 'chords need a 7-note scale'
    }
    if (config.includeChords && config.chordTypes.length === 0) {
      return 'select a chord type'
    }
    return null
  }

  function generateQuestion(config) {
    var families = enabledFamilies(config)
    if (config.roots.length === 0 || families.length === 0) return null

    var family = pickRandom(families)
    var root = pickRandom(config.roots)

    if (family === 'chord') {
      var scaleId = pickRandom(heptatonicScales(config.scales))
      var chordType = pickRandom(config.chordTypes)
      var scale = buildScale(root, scaleId)
      var degrees = []
      for (var d = 1; d <= scale.length; d++) degrees.push(d)
      var degree = pickRandom(degrees)
      return {
        type: 'chord',
        prompt:
          degreeLabel(degree) +
          ' ' +
          chordPromptLabel(chordType) +
          ' of ' +
          root +
          ' ' +
          SCALE_LABELS[scaleId],
        correctNotes: diatonicChord(root, scaleId, degree, chordSize(chordType)),
        chordType: chordType,
        choices: ROOT_NOTES.slice(),
      }
    }

    var scaleId2 = pickRandom(config.scales)
    var scale2 = buildScale(root, scaleId2)
    var scaleLabel = SCALE_LABELS[scaleId2]

    if (family === 'degreeToNote') {
      var degList = []
      for (var n = 1; n <= scale2.length; n++) degList.push(n)
      var deg = pickRandom(degList)
      return {
        type: 'degreeToNote',
        prompt: degreeLabel(deg) + ' of ' + root + ' ' + scaleLabel,
        correctAnswer: scale2[deg - 1],
        choices: ROOT_NOTES.slice(),
      }
    }

    var note = pickRandom(scale2)
    var noteDegree = scale2.indexOf(note) + 1
    var degreeChoices = []
    for (var k = 1; k <= scale2.length; k++) {
      degreeChoices.push(degreeLabel(k))
    }

    return {
      type: 'noteToDegree',
      prompt: 'What is ' + note + ' in ' + root + ' ' + scaleLabel + '?',
      correctAnswer: degreeLabel(noteDegree),
      choices: degreeChoices,
    }
  }

  var selectedRoots = { C: true }
  var selectedScales = { major: true }
  var selectedChordTypes = { triad: true }
  var includeDegrees = true
  var includeChords = true

  var app = document.getElementById('app')
  var screen = document.createElement('div')
  screen.className = 'screen'
  app.appendChild(screen)

  var header = document.createElement('header')
  header.className = 'quiz-header'

  var title = document.createElement('h1')
  title.className = 'title'
  title.textContent = 'scale quiz'

  var scoreEl = document.createElement('p')
  scoreEl.className = 'score'
  header.appendChild(title)
  header.appendChild(scoreEl)

  var promptEl = document.createElement('p')
  promptEl.className = 'prompt'

  var selectHintEl = document.createElement('p')
  selectHintEl.className = 'hint hint--select'

  var feedbackEl = document.createElement('p')
  feedbackEl.className = 'feedback'

  var keylistEl = document.createElement('div')

  var quizMain = document.createElement('div')
  quizMain.className = 'quiz-main'
  quizMain.appendChild(header)
  quizMain.appendChild(promptEl)
  quizMain.appendChild(selectHintEl)
  quizMain.appendChild(feedbackEl)
  quizMain.appendChild(keylistEl)

  var configHintEl = document.createElement('p')
  configHintEl.className = 'hint'

  var controlsEl = document.createElement('div')
  controlsEl.className = 'controls'

  function addCheck(grid, text, checked, onToggle) {
    var label = document.createElement('label')
    label.className = 'check'
    var input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = checked
    input.addEventListener('change', function () {
      onToggle(input.checked)
    })
    label.appendChild(input)
    label.appendChild(document.createTextNode(text))
    grid.appendChild(label)
    return input
  }

  function fieldset(legendText, gridClass) {
    var fs = document.createElement('fieldset')
    fs.className = 'fieldset'
    var legend = document.createElement('legend')
    legend.textContent = legendText
    var grid = document.createElement('div')
    grid.className = gridClass
    fs.appendChild(legend)
    fs.appendChild(grid)
    return { fs: fs, grid: grid }
  }

  var roots = fieldset('root notes', 'check-grid')
  for (var ri = 0; ri < ROOT_NOTES.length; ri++) {
    ;(function (note) {
      addCheck(roots.grid, note, !!selectedRoots[note], function (on) {
        if (on) selectedRoots[note] = true
        else delete selectedRoots[note]
        onParamsChanged()
      })
    })(ROOT_NOTES[ri])
  }

  var scales = fieldset('scales', 'check-grid check-grid--wide')
  for (var si = 0; si < SCALE_IDS.length; si++) {
    ;(function (id) {
      addCheck(
        scales.grid,
        SCALE_LABELS[id],
        !!selectedScales[id],
        function (on) {
          if (on) selectedScales[id] = true
          else delete selectedScales[id]
          onParamsChanged()
        },
      )
    })(SCALE_IDS[si])
  }

  var types = fieldset('quiz types', 'check-grid check-grid--wide')
  addCheck(types.grid, 'degrees', includeDegrees, function (on) {
    includeDegrees = on
    onParamsChanged()
  })
  addCheck(types.grid, 'chords', includeChords, function (on) {
    includeChords = on
    onParamsChanged()
  })

  var chords = fieldset('chord types', 'check-grid')
  var chordInputs = []
  for (var ci = 0; ci < CHORD_TYPE_IDS.length; ci++) {
    ;(function (id) {
      var input = addCheck(
        chords.grid,
        CHORD_TYPE_LABELS[id],
        !!selectedChordTypes[id],
        function (on) {
          if (on) selectedChordTypes[id] = true
          else delete selectedChordTypes[id]
          onParamsChanged()
        },
      )
      chordInputs.push(input)
    })(CHORD_TYPE_IDS[ci])
  }

  controlsEl.appendChild(roots.fs)
  controlsEl.appendChild(scales.fs)
  controlsEl.appendChild(types.fs)
  controlsEl.appendChild(chords.fs)

  screen.appendChild(quizMain)
  screen.appendChild(configHintEl)
  screen.appendChild(controlsEl)

  var score = { correct: 0, total: 0 }
  var current = null
  var locked = false
  var nextTimer = null

  function updateScore() {
    scoreEl.textContent = score.correct + ' / ' + score.total
  }

  function selectedKeylistValues() {
    var selected = []
    var ons = keylistEl.querySelectorAll('.keylist__btn--on')
    for (var i = 0; i < ons.length; i++) {
      selected.push(ons[i].getAttribute('data-value'))
    }
    return selected
  }

  function renderKeylist(choices, mode, disabled) {
    keylistEl.replaceChildren()
    keylistEl.className =
      mode === 'multi' || choices.length === 12
        ? 'keylist keylist--notes'
        : 'keylist keylist--degrees'

    var order = shuffle(choices)
    for (var i = 0; i < order.length; i++) {
      ;(function (choice) {
        var button = document.createElement('button')
        button.type = 'button'
        button.className = 'keylist__btn'
        button.textContent = choice
        button.setAttribute('data-value', choice)
        button.disabled = !!disabled
        button.addEventListener('click', function () {
          if (mode === 'multi') {
            if (button.classList.contains('keylist__btn--on')) {
              button.classList.remove('keylist__btn--on')
            } else {
              button.classList.add('keylist__btn--on')
            }
            handleChordToggle()
          } else {
            handleSingle(choice)
          }
        })
        keylistEl.appendChild(button)
      })(order[i])
    }
  }

  function setKeylistDisabled(disabled) {
    var buttons = keylistEl.querySelectorAll('button')
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = disabled
    }
  }

  function clearNextTimer() {
    if (nextTimer !== null) {
      window.clearTimeout(nextTimer)
      nextTimer = null
    }
  }

  function showConfigHint() {
    var hint = configHint(getConfig())
    configHintEl.textContent = hint || ''
    configHintEl.hidden = hint === null
  }

  function nextQuestion() {
    clearNextTimer()
    locked = false
    feedbackEl.textContent = ''
    feedbackEl.className = 'feedback'
    showConfigHint()

    var question = generateQuestion(getConfig())
    if (!question) {
      setKeylistDisabled(true)
      selectHintEl.textContent = ''
      return
    }

    current = question
    promptEl.textContent = current.prompt

    if (current.type === 'chord') {
      selectHintEl.textContent = 'select ' + chordSize(current.chordType) + ' keys'
      renderKeylist(current.choices, 'multi', false)
    } else {
      selectHintEl.textContent = ''
      renderKeylist(current.choices, 'single', false)
    }
  }

  function gradeAndAdvance(ok, correctLabel) {
    locked = true
    setKeylistDisabled(true)
    score.total += 1
    if (ok) {
      score.correct += 1
      feedbackEl.textContent = 'correct'
      feedbackEl.className = 'feedback feedback--ok'
    } else {
      feedbackEl.textContent = 'incorrect · ' + correctLabel
      feedbackEl.className = 'feedback feedback--bad'
    }
    updateScore()
    nextTimer = window.setTimeout(nextQuestion, 900)
  }

  function handleSingle(value) {
    if (!current || locked || current.type === 'chord') return
    gradeAndAdvance(value === current.correctAnswer, current.correctAnswer)
  }

  function handleChordToggle() {
    if (!current || locked || current.type !== 'chord') return
    var selected = selectedKeylistValues()
    var need = chordSize(current.chordType)
    if (selected.length < need) return
    gradeAndAdvance(
      notesMatch(selected, current.correctNotes),
      current.correctNotes.join(' '),
    )
  }

  function syncChordTypes() {
    if (includeChords) {
      chords.fs.classList.remove('fieldset--dim')
    } else {
      chords.fs.classList.add('fieldset--dim')
    }
    for (var i = 0; i < chordInputs.length; i++) {
      chordInputs[i].disabled = !includeChords
    }
  }

  function onParamsChanged() {
    syncChordTypes()
    showConfigHint()
    var config = getConfig()
    if (!configCanGenerate(config)) {
      setKeylistDisabled(true)
      return
    }
    if (!locked) setKeylistDisabled(false)
  }

  updateScore()
  syncChordTypes()
  nextQuestion()
})()
