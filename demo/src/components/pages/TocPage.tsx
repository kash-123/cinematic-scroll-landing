import { TOC } from '../../data/content'

export default function TocPage({ onNav }: { onNav?: (spread: number, hash: string) => void }) {
  return (
    <nav className="page-pad noise justify-center" aria-label="Table of contents">
      <span className="mono mb-6 text-[0.65rem] tracking-[0.45em] text-gold/70">TABLE OF CONTENTS</span>
      <ol className="flex flex-col gap-5">
        {TOC.map(t => (
          <li key={t.hash}>
            <a
              href={`#${t.hash}`}
              className="group block border-b border-gold/20 pb-3"
              onClick={e => {
                if (!onNav) return
                e.preventDefault()
                history.replaceState(null, '', `#${t.hash}`)
                onNav(t.spread, t.hash)
              }}
            >
              <span className="mono mr-4 text-xs text-gold/80">{t.num}.</span>
              <span className="font-display text-2xl text-ink group-hover:text-gold">{t.title}</span>
              <span className="mono float-right mt-2 text-[0.6rem] tracking-[0.2em] text-ink/45">{t.sub.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
