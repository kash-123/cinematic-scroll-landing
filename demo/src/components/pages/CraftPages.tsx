import { FEATURES_A, FEATURES_B, imageById, type Feature } from '../../data/content'

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map(f => (
        <li key={f.title} className="border-l border-gold/30 pl-4">
          <h3 className="font-display text-xl font-semibold text-ink">{f.title}</h3>
          <p className="mt-1 font-display text-[0.95rem] leading-relaxed text-ink/70">{f.body}</p>
        </li>
      ))}
    </ul>
  )
}

function IllustrationPage({ imgId, chapter, title, blurb, anchorId }: { imgId: string; chapter: string; title: string; blurb: string; anchorId?: string }) {
  const img = imageById(imgId)
  return (
    <div id={anchorId} className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">{chapter}</span>
      <img src={img.src} alt={img.alt} className="my-4 max-h-[55%] w-full object-cover" loading="lazy" />
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 font-display text-sm italic leading-relaxed text-ink/60">{blurb}</p>
      </div>
    </div>
  )
}

export const CraftLeft = () => (
  <IllustrationPage anchorId="ch-1" imgId="craft-inkwell" chapter="CHAPTER I" title="The Craft"
    blurb="Everything a teaching hand needs — laid out in the order a teacher reaches for it." />
)
export const CraftRight = () => (
  <div className="page-pad noise justify-center"><FeatureList items={FEATURES_A} /></div>
)
export const CraftContLeft = () => (
  <IllustrationPage imgId="craft-seal" chapter="CHAPTER I · CONTINUED" title="Sealed & Delivered"
    blurb="From discussion to certification, the academy travels with its learners." />
)
export const CraftContRight = () => (
  <div className="page-pad noise justify-center"><FeatureList items={FEATURES_B} /></div>
)
