/** Fisher–Yates shuffle — returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export type KeylistMode = 'single' | 'multi'

export type KeylistOptions = {
  choices: readonly string[]
  mode?: KeylistMode
  disabled?: boolean
  onSelect: (value: string) => void
}

/** Render a jumbled list of answer buttons into `container`. */
export function renderKeylist(
  container: HTMLElement,
  options: KeylistOptions,
): void {
  container.replaceChildren()
  const mode = options.mode ?? 'single'
  container.className =
    mode === 'multi' ? 'keylist keylist--notes' : 'keylist'
  if (options.choices.length === 12) {
    container.classList.add('keylist--notes')
  }

  const order = shuffle(options.choices)

  for (const choice of order) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'keylist__btn'
    button.textContent = choice
    button.dataset.value = choice
    button.disabled = options.disabled ?? false
    button.addEventListener('click', () => {
      if (mode === 'multi') {
        button.classList.toggle('keylist__btn--on')
      }
      options.onSelect(choice)
    })
    container.appendChild(button)
  }
}

export function selectedKeylistValues(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.keylist__btn--on')].map(
    (btn) => (btn as HTMLButtonElement).dataset.value ?? btn.textContent ?? '',
  )
}

export function setKeylistDisabled(
  container: HTMLElement,
  disabled: boolean,
): void {
  container.querySelectorAll('button').forEach((btn) => {
    ;(btn as HTMLButtonElement).disabled = disabled
  })
}
