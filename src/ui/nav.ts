export type AppPage = 'keys' | 'theory'

export function currentPage(): AppPage {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash === 'theory' ? 'theory' : 'keys'
}

export function renderNav(container: HTMLElement, active: AppPage): void {
  container.replaceChildren()
  container.className = 'nav'

  const pages: { id: AppPage; label: string; href: string }[] = [
    { id: 'keys', label: 'keys', href: '#/' },
    { id: 'theory', label: 'theory', href: '#/theory' },
  ]

  for (const page of pages) {
    const a = document.createElement('a')
    a.href = page.href
    a.className =
      page.id === active ? 'nav__link nav__link--on' : 'nav__link'
    a.textContent = page.label
    container.appendChild(a)
  }
}
