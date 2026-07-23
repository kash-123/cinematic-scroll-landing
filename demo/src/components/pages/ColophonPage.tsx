import { imageById, TRIAL } from '../../data/content'

export default function ColophonLeft() {
  const img = imageById('colophon-candle')
  return (
    <div id="ch-4" className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER IV · BEGIN</span>
      <img src={img.src} alt={img.alt} className="my-3 max-h-[34%] w-full object-cover" loading="lazy" />
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink">{TRIAL.heading}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {TRIAL.points.map(p => (
            <li key={p} className="font-display text-[0.95rem] text-ink/75">
              <span className="mr-2 text-gold">✦</span>{p}
            </li>
          ))}
        </ul>
      </div>
      <p className="mono text-[0.55rem] leading-relaxed tracking-[0.15em] text-ink/40">{TRIAL.credit.toUpperCase()}</p>
    </div>
  )
}
