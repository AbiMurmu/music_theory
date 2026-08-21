import './styles.css'
import { renderQuiz } from './ui/quiz'

const el = document.querySelector<HTMLDivElement>('#app')
if (!el) {
  throw new Error('#app not found')
}

renderQuiz(el)
