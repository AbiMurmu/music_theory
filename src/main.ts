import './styles.css'
import { currentPage } from './ui/nav'
import { renderQuiz } from './ui/quiz'
import { renderTheory } from './ui/theory'

function getAppRoot(): HTMLElement {
  const node = document.querySelector('#app')
  if (!(node instanceof HTMLElement)) {
    throw new Error('#app not found')
  }
  return node
}

const root = getAppRoot()

function route(): void {
  if (currentPage() === 'theory') renderTheory(root)
  else renderQuiz(root)
}

window.addEventListener('hashchange', route)
route()
