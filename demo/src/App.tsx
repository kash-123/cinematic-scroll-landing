import { useCallback, useEffect, useState } from 'react'
import Atmosphere from './components/Atmosphere'
import Preloader from './components/Preloader'
import Book from './components/Book'

export const FLAT_QUERY = '(max-width: 767px), (prefers-reduced-motion: reduce)'

export default function App() {
  const [flat, setFlat] = useState(() => window.matchMedia(FLAT_QUERY).matches)
  const [ready, setReady] = useState(false)
  const onDone = useCallback(() => setReady(true), [])
  useEffect(() => {
    const mq = window.matchMedia(FLAT_QUERY)
    const onChange = () => setFlat(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return (
    <div className={flat ? 'book-flat' : ''}>
      <Atmosphere />
      {!ready && <Preloader onDone={onDone} />}
      <main>
        <Book flat={flat} started={ready} />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
