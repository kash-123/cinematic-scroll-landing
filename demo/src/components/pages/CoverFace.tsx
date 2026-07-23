import { BRAND, COVER_HINT, TAGLINE } from '../../data/content'

export default function CoverFace({ onOpen }: { onOpen?: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="page-pad noise w-full cursor-pointer items-center justify-center gap-6 text-center" aria-label="Open the book">
      <span className="mono text-[0.6rem] tracking-[0.5em] text-gold/70">A MOODLE-POWERED ACADEMY · EST. MMXXVI</span>
      <svg viewBox="0 0 32 32" className="h-16 w-16" aria-hidden="true">
        <path d="M16 8c-2.5-1.6-5.5-2-9-2v18c3.5 0 6.5.4 9 2 2.5-1.6 5.5-2 9-2V6c-3.5 0-6.5.4-9 2z" fill="none" stroke="#C9A45C" strokeWidth="1.2" />
        <path d="M16 8v18" stroke="#C9A45C" strokeWidth="0.9" />
      </svg>
      <h1 className="foil font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-none tracking-[0.18em]">{BRAND}</h1>
      <p className="font-display text-lg italic text-ink/80">{TAGLINE}</p>
      <span className="mono mt-6 motion-safe:animate-pulse text-[0.65rem] tracking-[0.4em] text-ink/50">▼ {COVER_HINT}</span>
    </button>
  )
}
