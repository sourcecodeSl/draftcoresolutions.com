import { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import WorkLightbox from '../components/WorkLightbox.jsx'
import { Reveal } from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'
import useSeo from '../hooks/useSeo.js'
import { works, workCategories } from '../data/works.js'

const FILTERS = ['All', ...workCategories]
const EASE = [0.22, 1, 0.36, 1]

// Every third sheet runs full width (and a trailing sheet that would sit alone), so the grid never leaves a gap.
const isWide = (i, n) => i % 3 === 0 || (i % 3 === 1 && i === n - 1)

// Printer's crop marks in the sheet corners; they tighten in on hover.
function CropMarks() {
  const base = 'absolute h-4 w-4 border-ink/40 transition-all duration-500 group-hover:border-accent'
  return (
    <span aria-hidden="true">
      <span className={`${base} left-2 top-2 border-l border-t group-hover:left-3 group-hover:top-3`} />
      <span className={`${base} right-2 top-2 border-r border-t group-hover:right-3 group-hover:top-3`} />
      <span className={`${base} bottom-2 left-2 border-b border-l group-hover:bottom-3 group-hover:left-3`} />
      <span className={`${base} bottom-2 right-2 border-b border-r group-hover:bottom-3 group-hover:right-3`} />
    </span>
  )
}

const WorkCard = forwardRef(function WorkCard({ work, number, wide, onOpen }, ref) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={wide ? 'md:col-span-2' : ''}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="Enlarge"
        aria-label={`Open ${work.title} drawing full size`}
        className={`group block h-full w-full overflow-hidden rounded-2xl border border-line/10 bg-surface text-left shadow-[0_20px_50px_-35px_rgba(15,32,60,0.35)] transition-[border-color,box-shadow] duration-500 hover:border-accent/40 hover:shadow-[0_30px_70px_-30px_rgba(0,108,186,0.45)] ${
          wide ? 'md:grid md:grid-cols-[1.75fr_1fr]' : ''
        }`}
      >
        {/* the sheet */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <img
            src={wide ? work.src : work.thumb}
            alt={`${work.title} — ${work.subtitle}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-3 grayscale transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] sm:p-5"
          />
          {/* scan line sweeping the sheet on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 -translate-y-full bg-gradient-to-b from-transparent via-accent/10 to-transparent opacity-0 transition-[transform,opacity] duration-[1100ms] ease-out group-hover:translate-y-[300%] group-hover:opacity-100"
          />
          <CropMarks />
          <span className="absolute left-4 top-4 rounded-full bg-[#0D182A] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
            {work.category}
          </span>
          <span className="absolute bottom-4 right-4 flex translate-y-3 items-center gap-2 rounded-full bg-[#0D182A] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <Maximize2 className="h-3.5 w-3.5 text-brand-sky" /> View sheet
          </span>
        </div>

        {/* title block, laid out like the one on the drawing */}
        {wide ? (
          <div className="flex flex-col border-t border-line/10 md:border-l md:border-t-0">
            <div className="flex items-baseline justify-between border-b border-line/10 px-5 py-4 lg:px-7">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{work.code}</span>
              <span className="font-mono text-3xl font-medium text-accent lg:text-4xl">{number}</span>
            </div>
            <div className="flex-1 px-5 py-5 lg:px-7 lg:py-7">
              <h3 className="font-display text-2xl font-semibold leading-tight text-ink transition-colors group-hover:text-accent lg:text-3xl">
                {work.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{work.subtitle}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {work.views.map((v) => (
                  <li key={v} className="rounded-full border border-line/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-body">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="grid grid-cols-2 border-t border-line/10 text-xs">
              <div className="border-r border-line/10 px-5 py-3 lg:px-7">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Scale</dt>
                <dd className="mt-0.5 font-mono text-body">{work.scale}</dd>
              </div>
              <div className="px-5 py-3 lg:px-7">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Discipline</dt>
                <dd className="mt-0.5 font-mono text-body">{work.category}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr] border-t border-line/10 text-sm sm:grid-cols-[auto_1fr_auto]">
            <div className="flex flex-col justify-center border-r border-line/10 px-4 py-4 sm:px-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">No.</span>
              <span className="mt-1 font-mono text-lg font-medium text-accent">{number}</span>
            </div>
            <div className="min-w-0 px-4 py-4 sm:px-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{work.code}</span>
              <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-ink transition-colors group-hover:text-accent sm:text-xl">
                {work.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{work.subtitle}</p>
            </div>
            <dl className="col-span-2 flex gap-6 border-t border-line/10 px-4 py-3 sm:col-span-1 sm:flex-col sm:justify-center sm:gap-2 sm:border-l sm:border-t-0 sm:px-5">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Scale</dt>
                <dd className="font-mono text-xs text-body">{work.scale}</dd>
              </div>
            </dl>
          </div>
        )}
      </button>
    </motion.article>
  )
})

export default function Works() {
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)
  useSeo({
    title: 'Our Works',
    description:
      'DraftCore drawing samples — furniture and joinery shop drawings, reflected ceiling plans, furniture layouts and bathroom elevations for hospitality and residential interiors.',
  })

  const visible = filter === 'All' ? works : works.filter((w) => w.category === filter)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Our Works' }]}
        eyebrow="Our Works"
        title="Drawn to be built, detail by detail."
        highlight={[4, 5, 6]}
        text="Shop drawings, joinery details and interior documentation issued by DraftCore. Open any sheet to see it full size and zoom into the detail."
      >
        <Reveal delay={0.3}>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs uppercase tracking-[0.18em]">
            {[
              [String(works.length).padStart(2, '0'), 'Issued sheets'],
              [String(workCategories.length).padStart(2, '0'), 'Disciplines'],
              ['1:1 – 1:20', 'Drawing scales'],
            ].map(([v, l]) => (
              <div key={l}>
                <dd className="font-display text-3xl font-semibold normal-case tracking-tight text-ink">{v}</dd>
                <dt className="mt-1 text-faint">{l}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </PageHero>

      <section className="theme-light relative bg-canvas py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]" role="tablist" aria-label="Filter drawings by discipline">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors ${
                    filter === f ? 'text-obsidian' : 'text-muted hover:text-ink'
                  }`}
                >
                  {filter === f && (
                    <motion.span
                      layoutId="works-filter"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-ice to-brand-sky"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {f}
                    <span className="ml-2 font-mono text-[10px] opacity-60">
                      {f === 'All' ? works.length : works.filter((w) => w.category === f).length}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Click a sheet to enlarge · ← → to browse</p>
          </div>

          <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {visible.map((w, i) => (
                <WorkCard
                  key={w.id}
                  work={w}
                  number={String(i + 1).padStart(2, '0')}
                  wide={isWide(i, visible.length)}
                  onOpen={() => setOpen(i)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {open !== null && <WorkLightbox items={visible} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      </AnimatePresence>

      <CTASection title="Need drawings like these?" primary={{ label: 'Send Your Project', to: '/contact' }} />
    </>
  )
}
