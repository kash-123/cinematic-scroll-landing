import { imageById, STATS, STATS_NOTE, TESTIMONIAL } from '../../data/content'

export const RecordLeft = () => {
  const img = imageById('record-armillary')
  return (
    <div id="ch-3" className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER III · THE RECORD</span>
      <img src={img.src} alt={img.alt} className="my-3 max-h-[38%] w-full object-cover" loading="lazy" />
      <dl className="flex flex-col gap-3">
        {STATS.map(s => (
          <div key={s.label} className="flex items-baseline justify-between border-b border-gold/20 pb-2">
            <dt className="mono text-[0.65rem] tracking-[0.3em] text-ink/55">{s.label.toUpperCase()}</dt>
            <dd className="mono text-2xl text-gold">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mono mt-2 text-[0.55rem] tracking-[0.2em] text-ink/40">{STATS_NOTE.toUpperCase()}</p>
    </div>
  )
}

export const RecordRight = () => (
  <div className="page-pad noise justify-center gap-6">
    <span className="font-display text-6xl leading-none text-gold/40">"</span>
    <blockquote className="font-display text-2xl italic leading-relaxed text-ink/90">{TESTIMONIAL.quote}</blockquote>
    <p className="mono text-[0.65rem] tracking-[0.25em] text-ink/55">
      — {TESTIMONIAL.name.toUpperCase()}<br />{TESTIMONIAL.role.toUpperCase()}
    </p>
  </div>
)
