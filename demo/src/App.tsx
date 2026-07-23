import { useEffect, useState } from 'react'
import Book from './components/Book'

export const FLAT_QUERY = '(max-width: 767px), (prefers-reduced-motion: reduce)'

export default function App() {
  const [flat, setFlat] = useState(() => window.matchMedia(FLAT_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(FLAT_QUERY)
    const onChange = () => setFlat(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return (
    <div className={flat ? 'book-flat' : ''}>
      <main>
        <Book flat={flat} started />
      </main>
    </div>
  )
}
