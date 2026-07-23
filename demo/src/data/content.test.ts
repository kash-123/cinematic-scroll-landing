import { describe, expect, it } from 'vitest'
import { CHAPTER_HEADS, COURSES, FEATURES_A, FEATURES_B, IMAGES, STATS, TOC } from './content'

describe('content integrity', () => {
  it('has 4 TOC chapters targeting spreads 2,4,5,6 with ch-N hashes', () => {
    expect(TOC.map(t => t.spread)).toEqual([2, 4, 5, 6])
    expect(TOC.map(t => t.hash)).toEqual(['ch-1', 'ch-2', 'ch-3', 'ch-4'])
  })
  it('has chapter heads for spreads 0..6', () => {
    expect(CHAPTER_HEADS).toHaveLength(7)
  })
  it('has 3+3 features, 4 courses, 3 stats', () => {
    expect(FEATURES_A).toHaveLength(3)
    expect(FEATURES_B).toHaveLength(3)
    expect(COURSES).toHaveLength(4)
    expect(STATS).toHaveLength(3)
  })
  it('has 10 uniquely-named png images under /images or /og', () => {
    expect(IMAGES).toHaveLength(10)
    expect(new Set(IMAGES.map(i => i.id)).size).toBe(10)
    for (const img of IMAGES) expect(img.src).toMatch(/^\/(images|og)\/[a-z-]+\.png$/)
  })
  it('every course card image exists in the manifest', () => {
    const srcs = new Set(IMAGES.map(i => i.src))
    for (const c of COURSES) expect(srcs.has(c.image)).toBe(true)
  })
})
