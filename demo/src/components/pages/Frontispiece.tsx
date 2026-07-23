import { imageById } from '../../data/content'

export default function Frontispiece() {
  const img = imageById('frontispiece-emblem')
  return (
    <div className="page-pad noise items-center justify-center gap-5 text-center">
      <img src={img.src} alt={img.alt} className="h-[52%] w-auto object-cover opacity-90" loading="eager" />
      <p className="font-display text-sm italic text-ink/60">"A course well bound is a course well taught."</p>
      <span className="mono text-[0.6rem] tracking-[0.4em] text-gold/60">FRONTISPIECE</span>
    </div>
  )
}
