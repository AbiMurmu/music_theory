# Theory Drills

Browser quiz for music theory practice. Deployed at [music-theory-wine.vercel.app](https://music-theory-wine.vercel.app). Repo: [AbiMurmu/music_theory](https://github.com/AbiMurmu/music_theory).

Two practice modes:

- **Grades 1–8** — Trinity-style chapters (reading, rhythm, keys, scales, intervals, triads, sevenths, cadences, Italian terms). Grade unlocks keys, clefs, rhythms, and question types. Notation via VexFlow.
- **Basics** — no staff: scale degrees, chord of a degree, semitone gaps, and jumbled/build-chord drills (optional 7ths and 9ths).

Settings persist in `localStorage` under `theory-drills-v3`.

## Source of truth

**`index.html` is the product.** One self-contained file: CSS, theory engine, VexFlow drawing, and UI. Edit that file for feature work.

Everything else is scaffolding or legacy:

| Path | Role |
|------|------|
| `index.html` | Live app (edit here) |
| `package.json` / `vite.config.ts` | Vite build so Vercel can ship `dist/` |
| `src/**`, `app.js`, `styles.css` | Older TypeScript / plain-JS quiz — **not** loaded by current `index.html` |
| `SUMMARY.md` | Outdated product notes — prefer this README |

CDN deps (loaded from `index.html`): VexFlow 4.2.2, Google Fonts (Bricolage Grotesque, IBM Plex Sans/Mono).

## Run and deploy

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc + vite build → dist/
npm run preview  # preview dist/
```

Or open `index.html` directly in a browser (CDN requires network for notation).

Push to `main` deploys on Vercel (`homepage` on the GitHub repo).

## Architecture (for agents)

Flow inside `index.html`:

1. **Setup** — mode, grade, chapters/topics, key pool, basics scale/extension toggles → `S.set`, saved on change.
2. **Question** — `makeQuestion(topic, set)` via `GENS` / `TOPICS`; each `q*` returns `{html, opts, ans, staff?, fb, …}`.
3. **Notation** — `drawStaff(el, spec)` when `staff` is set and VexFlow loaded; questions with `vex:1` need it.
4. **Grade** — `quiz` card; multi-select answers for some basics chord topics.
5. **Feedback** — explanation + optional scale/chord chip rows; progress / missed queue in the side panel.

Important symbols:

- `TOPICS`, `CHAPS`, `GENS`, `GTEXT` — curriculum surface and generators
- `KEYADD`, `keysFor`, `clefsFor`, `PAT` — grade-gated keys/clefs and scale patterns
- `DEFAULTS`, `S`, `save` — settings and runtime state

British note names in copy (crotchet, quaver, …); US names appear as secondary labels where useful.

## Conventions when changing the app

- Prefer editing `index.html` in place over resurrecting `src/` unless the user asks to restore the Vite TypeScript quiz.
- Keep grade gating consistent with `GTEXT` and `KEYADD` when adding topics or unlocking content.
- Staff ink stays on the light `--paper` panel in both themes so notation stays readable.
- After substantive `index.html` changes: `npm run build` should still succeed (Vite emits the HTML into `dist/`).
- Do not commit secrets; none are required for this app.

## Folder name

Local directory may be `keyboard` (historical). Product name is **Theory Drills**; GitHub remote is `music_theory`.
