export const SPREADS = 6
export const SHEETS = SPREADS - 1
export const RUNWAY_VH_PER_UNIT = 110

const COVER_OPEN = 1.0
const SETTLE = 0.15
const FLIP = 1.0
const FINAL = 0.4

export function totalUnits(): number {
  return COVER_OPEN + SETTLE + SHEETS * (FLIP + SETTLE) + FINAL
}

/** Timeline position (units) where sheet k (1-indexed) begins its flip. */
export function sheetFlipStart(k: number): number {
  return COVER_OPEN + SETTLE + (k - 1) * (FLIP + SETTLE)
}

/** Scroll target (units) that lands settled on spread k. */
export function tocTargetUnits(spread: number): number {
  return (COVER_OPEN + SETTLE) * spread // 1.15·k: cover+settle, then k−1 flip+settle blocks
}

/** Current spread for HUD: 0 = cover; spread k once sheet k−1 passes its midpoint. */
export function currentSpread(u: number): number {
  if (u < COVER_OPEN / 2) return 0
  let flipped = 0
  for (let k = 1; k <= SHEETS; k++) if (u >= sheetFlipStart(k) + FLIP / 2) flipped++
  return Math.min(1 + flipped, SPREADS)
}

export function restAngle(k: number): number {
  return -178 + 0.4 * k
}
export function coverOpenAngle(): number {
  return -179
}

export const COVER_Z_CLOSED = 20
export const COVER_Z_OPEN = 1
export function zStacked(k: number): number {
  return SHEETS + 2 - k
}
export function zFlipped(k: number): number {
  return SHEETS + 2 + k
}

export type FaceKind = 'coverFront' | 'coverBack' | 'sheetFront' | 'sheetBack' | 'base'
/** Reading order of a face (drives flat-mode flex `order` and folio math). */
export function faceFolio(kind: FaceKind, k: number): number {
  switch (kind) {
    case 'coverFront': return 0
    case 'coverBack': return 1
    case 'sheetFront': return 2 * k
    case 'sheetBack': return 2 * k + 1
    case 'base': return 2 * SPREADS
  }
}

export function folioLabel(spread: number): string {
  if (spread < 1) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `PAGE ${pad(2 * spread - 1)} — ${pad(2 * spread)} / ${2 * SPREADS}`
}
