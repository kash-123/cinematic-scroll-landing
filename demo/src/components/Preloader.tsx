import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BRAND } from '../data/content'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      onDone()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    const counter = { v: 0 }
    const tl = gsap.timeline()
    tl.to(counter, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
      },
    })
    tl.to('.wipe', { scaleY: 0, transformOrigin: 'top', duration: 0.7, ease: 'power4.inOut', stagger: 0.08 })
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.25 }, '<0.45')
    tl.call(finish)
    const failsafe = window.setTimeout(finish, 3500)
    return () => {
      window.clearTimeout(failsafe)
      tl.kill()
    }
  }, [onDone])

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="wipe" />
      <div className="wipe" />
      <div className="preloader-center">
        <span className="foil font-display text-2xl tracking-[0.25em]">{BRAND}</span>
        <span ref={numRef} className="mono text-sm tracking-[0.4em] text-ink/60">000</span>
      </div>
    </div>
  )
}
