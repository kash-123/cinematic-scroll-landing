import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { faceFolio, RUNWAY_VH_PER_UNIT, totalUnits, zStacked, COVER_Z_CLOSED } from '../lib/bookTimeline'
import CoverFace from './pages/CoverFace'
import Frontispiece from './pages/Frontispiece'
import TocPage from './pages/TocPage'
import { CraftContLeft, CraftContRight, CraftLeft, CraftRight } from './pages/CraftPages'
import { CatalogLeft, CatalogRight } from './pages/CatalogPages'
import { RecordLeft, RecordRight } from './pages/RecordPages'
import ColophonLeft from './pages/ColophonPage'
import BackCoverFace from './pages/BackCoverFace'

const folioStyle = (n: number): CSSProperties => ({ ['--folio' as string]: n })

export default function Book({ flat, started }: { flat: boolean; started: boolean }) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const [spread, setSpread] = useState(0)
  void spread; void setSpread; void started // wired in Task 8

  const scrollToSpread = (_spread: number, hash: string) => {
    if (flat) document.getElementById(hash)?.scrollIntoView() // book mode wired in Task 8
  }

  const sheetFaces: [ReactNode, ReactNode][] = [
    [<TocPage key="r1" onNav={scrollToSpread} />, <CraftLeft key="l2" />],
    [<CraftRight key="r2" />, <CraftContLeft key="l3" />],
    [<CraftContRight key="r3" />, <CatalogLeft key="l4" />],
    [<CatalogRight key="r4" />, <RecordLeft key="l5" />],
    [<RecordRight key="r5" />, <ColophonLeft key="l6" />],
  ]

  return (
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
                <div className="face front paper" style={folioStyle(faceFolio('sheetFront', i + 1))}>
                  {front}
                  <div className="develop" />
                </div>
                <div className="face back paper" style={folioStyle(faceFolio('sheetBack', i + 1))}>{back}</div>
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
  )
}
