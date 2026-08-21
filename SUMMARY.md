# Keyboard — Piano Learning Service

## Summary

A dark, minimal scale-memorization quiz. Users pick root notes and scales, then practice endlessly: “5th of C Major” and the reverse (“What is A in C Major?”). Answers use a jumbled keylist so counting left-to-right is not possible. The virtual keyboard stays hidden during the quiz.

Plain HTML / CSS / JS — no build step.

## Now (v1)

- [x] Setup: multi-select root notes (12 chromatic) and scales
- [x] Scales: Major, Natural Minor, Harmonic Minor, Melodic Minor, Major/Minor Pentatonic
- [x] Quiz types: degree → note, note → degree
- [x] Jumbled answer keylist (reshuffled each question)
- [x] Keyboard hidden during quiz
- [x] Endless quiz + running score; roots/scales always visible to change anytime
- [x] Dark monospace UI, centered layout
- [x] Degree→note answers always show all 12 keys (jumbled 4×3 grid)
- [x] Simple `index.html` + `styles.css` + `app.js`

## Next

- [ ] Virtual **63-key** keyboard (practice / non-quiz surfaces)
- [ ] Highlight pressed keys on screen

## Later

- [ ] MIDI input so users can play answers / songs on a real keyboard
- [ ] Tempo support and play-along for songs with key highlighting

## Run

Open `index.html` in your browser (double-click, or right-click → Open with).

Files:

- `index.html`
- `styles.css`
- `app.js`
