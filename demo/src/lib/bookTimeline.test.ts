import { describe, expect, it } from 'vitest'
import {
  COVER_Z_CLOSED, COVER_Z_OPEN, coverOpenAngle, currentSpread, faceFolio,
  folioLabel, restAngle, SHEETS, sheetFlipStart, SPREADS, tocTargetUnits,
  totalUnits, zFlipped, zStacked,
} from './bookTimeline'

describe('bookTimeline math', () => {
  it('has 6 spreads / 5 sheets and 7.3 total units', () => {
    expect(SPREADS).toBe(6)
    expect(SHEETS).toBe(5)
    expect(totalUnits()).toBeCloseTo(7.3, 5)
  })
  it('computes sheet flip starts: k=1 → 1.15, k=5 → 5.75', () => {
    expect(sheetFlipStart(1)).toBeCloseTo(1.15, 5)
    expect(sheetFlipStart(5)).toBeCloseTo(5.75, 5)
  })
  it('TOC target for spread k is 1.15·k units', () => {
    expect(tocTargetUnits(1)).toBeCloseTo(1.15, 5)
    expect(tocTargetUnits(4)).toBeCloseTo(4.6, 5)
    expect(tocTargetUnits(6)).toBeCloseTo(6.9, 5)
  })
  it('maps progress units to current spread (0=cover)', () => {
    expect(currentSpread(0)).toBe(0)
    expect(currentSpread(0.6)).toBe(1)     // cover half-open
    expect(currentSpread(1.66)).toBe(2)    // sheet 1 past midpoint
    expect(currentSpread(7.3)).toBe(6)     // end
  })
  it('staggers rest angles and manages z choreography', () => {
    expect(restAngle(1)).toBeCloseTo(-177.6, 5)
    expect(restAngle(5)).toBeCloseTo(-176.0, 5)
    expect(coverOpenAngle()).toBe(-179)
    expect(zStacked(1)).toBe(6)
    expect(zStacked(5)).toBe(2)
    expect(zFlipped(1)).toBe(8)
    expect(zFlipped(5)).toBe(12)
    expect(COVER_Z_CLOSED).toBe(20)
    expect(COVER_Z_OPEN).toBe(1)
    // flipping sheet k beats every already-flipped and every stacked sheet
    expect(zFlipped(3)).toBeGreaterThan(zFlipped(2))
    expect(zFlipped(3)).toBeGreaterThan(zStacked(4))
  })
  it('computes folio order and labels', () => {
    expect(faceFolio('coverFront', 0)).toBe(0)
    expect(faceFolio('coverBack', 0)).toBe(1)
    expect(faceFolio('sheetFront', 1)).toBe(2)   // R1
    expect(faceFolio('sheetBack', 1)).toBe(3)    // L2
    expect(faceFolio('sheetBack', 5)).toBe(11)   // L6
    expect(faceFolio('base', 0)).toBe(12)        // R6
    expect(folioLabel(2)).toBe('PAGE 03 — 04 / 12')
    expect(folioLabel(6)).toBe('PAGE 11 — 12 / 12')
    expect(folioLabel(0)).toBe('')
  })
})
