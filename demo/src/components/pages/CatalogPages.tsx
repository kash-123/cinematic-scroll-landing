import { COURSES, type Course } from '../../data/content'

function CourseCard({ c }: { c: Course }) {
  return (
    <figure className="flex flex-col gap-2">
      <img src={c.image} alt={c.alt} className="aspect-[2/3] w-full object-cover" loading="lazy" />
      <figcaption>
        <span className="font-display text-lg leading-tight text-ink">{c.title}</span>
        <span className="mono mt-1 block text-[0.6rem] tracking-[0.25em] text-gold/70">✦ {c.lessons} LESSONS</span>
      </figcaption>
    </figure>
  )
}

function CatalogHalf({ courses, anchorId, headed }: { courses: Course[]; anchorId?: string; headed?: boolean }) {
  return (
    <div id={anchorId} className="page-pad noise justify-center gap-5">
      {headed && <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER II · THE CATALOG</span>}
      <div className="grid grid-cols-2 gap-5">{courses.map(c => <CourseCard key={c.id} c={c} />)}</div>
    </div>
  )
}

export const CatalogLeft = () => <CatalogHalf courses={COURSES.slice(0, 2)} anchorId="ch-2" headed />
export const CatalogRight = () => <CatalogHalf courses={COURSES.slice(2)} />
