import { BRAND, TRIAL } from '../../data/content'

export default function BackCoverFace() {
  return (
    <div className="page-pad noise items-center justify-center gap-6 text-center">
      <span className="mono text-[0.6rem] tracking-[0.5em] text-gold/60">THE FINAL PAGE</span>
      <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-semibold text-ink">Write the next chapter yourself.</h2>
      <a
        href="#ch-4"
        onClick={e => e.preventDefault()}
        className="border border-gold bg-gold/10 px-10 py-4 font-display text-xl tracking-wide text-gold transition-colors hover:bg-gold hover:text-obsidian"
        aria-describedby="cta-note"
      >
        {TRIAL.cta}
      </a>
      <p className="font-display text-sm italic text-ink/60">{TRIAL.ctaSub}</p>
      <p id="cta-note" className="mono text-[0.55rem] tracking-[0.2em] text-ink/35">DEMO BUILD — BUTTON INTENTIONALLY INERT</p>
      <span className="mono mt-4 text-[0.55rem] tracking-[0.4em] text-ink/30">{BRAND} · MMXXVI</span>
      <div className="cta-glint" aria-hidden="true" />
    </div>
  )
}
