export const BRAND = 'THE CODEX ACADEMY'
export const TAGLINE = 'Learning, bound beautifully.'
export const COVER_HINT = 'Scroll to open'

export interface TocEntry { num: string; title: string; sub: string; hash: string; spread: number }
export const TOC: TocEntry[] = [
  { num: 'I', title: 'The Craft', sub: 'Tools of the teaching trade', hash: 'ch-1', spread: 2 },
  { num: 'II', title: 'The Catalog', sub: 'Courses, bound in gold', hash: 'ch-2', spread: 4 },
  { num: 'III', title: 'The Record', sub: 'Outcomes worth inscribing', hash: 'ch-3', spread: 5 },
  { num: 'IV', title: 'Begin', sub: 'Your first thirty days', hash: 'ch-4', spread: 6 },
]

// index = current spread (0 = cover)
export const CHAPTER_HEADS = ['', 'Contents', 'Chapter I — The Craft', 'Chapter I — The Craft', 'Chapter II — The Catalog', 'Chapter III — The Record', 'Chapter IV — Begin']

export interface Feature { title: string; body: string }
export const FEATURES_A: Feature[] = [
  { title: 'Course Builder', body: 'Drag chapters, lessons, and media into courses that read like a well-kept book — structured, ordered, findable.' },
  { title: 'Assessments', body: 'Quizzes, assignments, and rubrics with instant feedback. Every attempt recorded neatly in the margin.' },
  { title: 'Gradebook', body: 'A living ledger: weighted grades, custom scales, and exports your registrar will actually accept.' },
]
export const FEATURES_B: Feature[] = [
  { title: 'Forums & Live Halls', body: 'Threaded discussion beside every lesson, and BigBlueButton lecture halls one click away.' },
  { title: 'In Every Pocket', body: 'The full academy on iOS and Android. Offline lessons sync the moment learners resurface.' },
  { title: 'Seals & Certificates', body: 'Badges and completion certificates issued automatically — verifiable by anyone you choose.' },
]

export interface Course { id: string; title: string; lessons: number; image: string; alt: string }
export const COURSES: Course[] = [
  { id: 'astronomy', title: 'Astronomy & Navigation', lessons: 12, image: '/images/catalog-astrolabe.webp', alt: 'Brass astrolabe rim-lit in gold against a dark background' },
  { id: 'mathematics', title: 'Mathematics & Logic', lessons: 16, image: '/images/catalog-compass.webp', alt: 'Gold drafting compass standing on dark parchment' },
  { id: 'sciences', title: 'Natural Sciences', lessons: 14, image: '/images/catalog-botany.webp', alt: 'Botanical specimen preserved under a glass dome, gold rim light' },
  { id: 'humanities', title: 'Rhetoric & Humanities', lessons: 11, image: '/images/catalog-lyre.webp', alt: 'Gold lyre emerging from darkness with volumetric fog' },
]

export interface Stat { value: string; label: string }
export const STATS: Stat[] = [
  { value: '12,000+', label: 'learners bound' },
  { value: '48', label: 'institutions' },
  { value: '94%', label: 'completion rate' },
]
export const STATS_NOTE = 'Figures illustrative — demo edition.'

export const TESTIMONIAL = {
  quote: 'We moved three faculties into the Codex in one term. Our students stopped asking where things were — everything reads in order, like it should.',
  name: 'Prof. A. Whitmore',
  role: 'Dean of Studies, Hartwell College (fictional)',
}

export const TRIAL = {
  heading: 'Thirty days, the whole library.',
  points: ['Every feature unlocked', 'Up to 500 learners', 'No card required', 'Import your existing Moodle courses'],
  credit: 'Set in Cormorant. Powered by Moodle™ — the open-source LMS. This is a fictional demonstration; no data is collected.',
  cta: 'Begin your trial',
  ctaSub: 'The first page is already turned.',
}

export interface Img { id: string; src: string; alt: string }
export const IMAGES: Img[] = [
  { id: 'frontispiece-emblem', src: '/images/frontispiece-emblem.webp', alt: 'Gold emblem plate: an open tome encircled by a laurel wreath' },
  { id: 'craft-inkwell', src: '/images/craft-inkwell.webp', alt: 'Quill and brass inkwell, single gold rim light' },
  { id: 'craft-seal', src: '/images/craft-seal.webp', alt: 'Wax seal stamp resting on dark documents' },
  { id: 'catalog-astrolabe', src: '/images/catalog-astrolabe.webp', alt: 'Brass astrolabe rim-lit in gold against a dark background' },
  { id: 'catalog-compass', src: '/images/catalog-compass.webp', alt: 'Gold drafting compass standing on dark parchment' },
  { id: 'catalog-botany', src: '/images/catalog-botany.webp', alt: 'Botanical specimen preserved under a glass dome, gold rim light' },
  { id: 'catalog-lyre', src: '/images/catalog-lyre.webp', alt: 'Gold lyre emerging from darkness with volumetric fog' },
  { id: 'record-armillary', src: '/images/record-armillary.webp', alt: 'Armillary sphere in obsidian and gold, volumetric fog' },
  { id: 'colophon-candle', src: '/images/colophon-candle.webp', alt: 'Lit candle beside a stack of dark leather tomes' },
  { id: 'cover-og', src: '/og/cover-og.jpg', alt: 'Closed obsidian book with gold foil lettering, three-quarter view' },
]
export const imageById = (id: string): Img => {
  const img = IMAGES.find(i => i.id === id)
  if (!img) throw new Error(`unknown image id: ${id}`)
  return img
}
