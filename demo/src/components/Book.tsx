import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  COVER_Z_CLOSED, COVER_Z_OPEN, coverOpenAngle, currentSpread, faceFolio,
  folioLabel, restAngle, RUNWAY_VH_PER_UNIT, SHEETS, sheetFlipStart,
  tocTargetUnits, totalUnits, zFlipped, zStacked,
} from '../lib/bookTimeline'
import { CHAPTER_HEADS, TOC } from '../data/content'
import BookHUD from './BookHUD'
import CoverFace from './pages/CoverFace'
import Frontispiece from './pages/Frontispiece'
import TocPage from './pages/TocPage'
import { CraftContLeft, CraftContRight, CraftLeft, CraftRight } from './pages/CraftPages'
import { CatalogLeft, CatalogRight } from './pages/CatalogPages'
import { RecordLeft, RecordRight } from './pages/RecordPages'
import ColophonLeft from './pages/ColophonPage'
import BackCoverFace from './pages/BackCoverFace'

gsap.registerPlugin(ScrollTrigger)

const folioStyle = (n: number): CSSProperties => ({ ['--folio' as string]: n })

export default function Book({ flat, started }: { flat: boolean; started: boolean }) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [spread, setSpread] = useState(0)

  // Lenis smooth scroll (book mode only; preloader gates start)
  useEffect(() => {
    if (flat) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenisRef.current = lenis
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [flat])

  useEffect(() => {
    if (started) lenisRef.current?.start()
  }, [started])

  const scrollToSpread = (target: number, hash: string, jump = false) => {
    if (flat) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const runway = runwayRef.current
    if (!runway) return
    const max = runway.offsetHeight - window.innerHeight
    const y = runway.offsetTop + (tocTargetUnits(target) / totalUnits()) * max
    // force: a stopped Lenis (preloader) silently ignores scrollTo otherwise
    if (lenisRef.current) lenisRef.current.scrollTo(y, jump ? { immediate: true, force: true } : { duration: 1.6 })
    else window.scrollTo({ top: y })
  }

  // Master timeline
  useEffect(() => {
    if (flat) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const book = bookRef.current
      const runway = runwayRef.current
      if (!book || !runway) return
      const cover = book.querySelector<HTMLElement>('.cover')!
      const sheets = gsap.utils.toArray<HTMLElement>('.sheet', book)
      const baseDevelop = book.querySelector<HTMLElement>('.base-right .develop')!

      gsap.set(book, { xPercent: -25 })
      gsap.set(cover, { zIndex: COVER_Z_CLOSED })
      sheets.forEach((el, i) => gsap.set(el, { zIndex: zStacked(i + 1) }))
      gsap.set(book.querySelectorAll('.sheet .develop'), { opacity: 0.45 })
      gsap.set(baseDevelop, { opacity: 0.45 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: runway,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: self => {
            const s = currentSpread(self.progress * totalUnits())
            setSpread(prev => (prev === s ? prev : s))
          },
        },
      })

      // Cover opens; book re-centers on its spine; spine appears; chrome starts
      tl.to(book, { xPercent: 0, duration: 1 }, 0)
      tl.to(cover, { rotationY: coverOpenAngle(), duration: 1 }, 0)
      // R1 (TOC) is revealed by the cover, not by a sheet flip — develop it here
      tl.to(sheets[0].querySelector('.develop'), { opacity: 0, duration: 0.4, ease: 'power1.out' }, 0.4)
      tl.to('.spine', { opacity: 1, duration: 0.2 }, 0.9)
      tl.set(cover, { zIndex: COVER_Z_OPEN }, 1.05)
      tl.to('.ribbon', { scaleY: 1, duration: totalUnits() - 1.4, ease: 'none' }, 1)
      // the bookmark has nothing left to mark on the final spread — retire it
      tl.to('.ribbon', { opacity: 0, duration: 0.35, ease: 'power1.in' }, totalUnits() - 0.4)
      tl.to('.page-edges', { scaleX: 0, duration: totalUnits() - 1.15, ease: 'none' }, 1.15)

      // Sheet flips with z choreography, shade, and develop on the incoming right page
      sheets.forEach((el, i) => {
        const k = i + 1
        const at = sheetFlipStart(k)
        const shade = el.querySelector('.sheet-shade')
        const nextDevelop = k < SHEETS ? sheets[k].querySelector('.develop') : baseDevelop
        tl.set(el, { zIndex: zFlipped(k), willChange: 'transform' }, at)
        tl.to(el, { rotationY: restAngle(k), duration: 1 }, at)
        tl.set(el, { willChange: 'auto' }, at + 1)
        tl.to(shade, { opacity: 0.5, duration: 0.5, ease: 'power1.in' }, at)
        tl.to(shade, { opacity: 0, duration: 0.5, ease: 'power1.out' }, at + 0.5)
        tl.to(nextDevelop, { opacity: 0, duration: 0.4, ease: 'power1.out' }, at + 0.3)
      })

      // Final CTA emphasis
      tl.fromTo('.cta-glint', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.in' }, totalUnits() - 0.4)

      // Hash deep link (e.g. hard-load /#ch-2)
      const match = location.hash.match(/^#ch-(\d)$/)
      if (match) {
        const entry = TOC[Number(match[1]) - 1]
        if (entry) requestAnimationFrame(() => scrollToSpread(entry.spread, entry.hash, true))
      }
      return () => setSpread(0)
    })
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat])

  const sheetFaces: [ReactNode, ReactNode][] = [
    [<TocPage key="r1" onNav={(s, h) => scrollToSpread(s, h)} />, <CraftLeft key="l2" />],
    [<CraftRight key="r2" />, <CraftContLeft key="l3" />],
    [<CraftContRight key="r3" />, <CatalogLeft key="l4" />],
    [<CatalogRight key="r4" />, <RecordLeft key="l5" />],
    [<RecordRight key="r5" />, <ColophonLeft key="l6" />],
  ]

  // Which faces are interactable at the current spread (book mode):
  // fronts belong to spread k (front of sheet k = R_k), backs to spread k+1.
  const frontActive = (k: number) => !flat && (spread === k || spread === k + 1)
  const backActive = (k: number) => !flat && (spread === k + 1 || spread === k + 2)

  return (
    <>
      {!flat && <BookHUD spread={spread} label={folioLabel(spread)} head={CHAPTER_HEADS[spread] ?? ''} />}
      <div ref={runwayRef} className="runway" style={{ height: flat ? 'auto' : `${totalUnits() * RUNWAY_VH_PER_UNIT}vh` }}>
        <div className="book-stage">
          <div className="book-persp">
            <div ref={bookRef} className="book">
              <div className="leaf cover" style={{ zIndex: COVER_Z_CLOSED }}>
                <div className="face front leather" style={folioStyle(faceFolio('coverFront', 0))}>
                  <CoverFace onOpen={() => scrollToSpread(1, 'ch-1')} />
                </div>
                <div className="face back paper" style={folioStyle(faceFolio('coverBack', 0))}>
                  <Frontispiece />
                </div>
              </div>
              {sheetFaces.map(([front, back], i) => (
                <div key={i} className="leaf sheet" style={{ zIndex: zStacked(i + 1) }}>
                  <div className="face front paper" inert={!flat && !frontActive(i + 1) ? true : undefined} style={folioStyle(faceFolio('sheetFront', i + 1))}>
                    {front}
                    <div className="develop" />
                  </div>
                  <div className="face back paper" inert={!flat && !backActive(i + 1) ? true : undefined} style={folioStyle(faceFolio('sheetBack', i + 1))}>{back}</div>
                  <div className="sheet-shade" />
                </div>
              ))}
              <div className="leaf base-right" style={{ zIndex: 0 }}>
                <div className="face front paper" style={folioStyle(faceFolio('base', 0))}>
                  <BackCoverFace />
                  <div className="develop" />
                </div>
              </div>
              <div className="spine" aria-hidden="true" />
              <div className="page-edges" aria-hidden="true" />
              <div className="ribbon" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
