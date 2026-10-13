import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Maximize2 } from 'lucide-react'
import SectionHeading from '../SectionHeading.jsx'
import SheetRuler from '../SheetRuler.jsx'
import WorkLightbox from '../WorkLightbox.jsx'
import { Reveal } from '../Reveal.jsx'
import { works } from '../../data/works.js'

const EASE = [0.22, 1, 0.36, 1]
const PICKS = ['sofa-3-seater', 'daybed-joinery', 'ceiling-layout']
// resting pose of each sheet on the "drafting table"; they square up on hover
const POSE = [
  { rotate: -3, y: 18 },
  { rotate: 1.5, y: -6 },
  { rotate: -1, y: 24 },
]

function Sheet({ work, number, pose, drift, onOpen }) {
  return (
    <motion.div style={{ y: drift }} className="w-[78vw] shrink-0 snap-center sm:w-[58vw] lg:w-auto">
      <motion.button
        type="button"
        onClick={onOpen}
        data-cursor="Enlarge"
        aria-label={`Open ${work.title} drawing full size`}
        variants={{ hidden: { opacity: 0, y: 60, rotate: 0 }, show: { opacity: 1, ...pose } }}
        whileHover={{ rotate: 0, y: -14, scale: 1.04, zIndex: 10 }}
        whileFocus={{ rotate: 0, y: -14, scale: 1.04, zIndex: 10 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="group relative block w-full text-left"
      >
        <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)] ring-1 ring-black/5">
          <img
            src={work.thumb}
            alt={`${work.title} — ${work.subtitle}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-2 grayscale transition-transform duration-700 group-hover:scale-105"
          />
          {/* masking-tape strip pinning the sheet down */}
          <span aria-hidden="true" className="absolute -top-1 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#e8dfc6]/80 shadow-sm" />
          <span className="absolute bottom-3 right-3 flex translate-y-2 items-center gap-1.5 rounded-full bg-[#0D182A] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <Maximize2 className="h-3 w-3 text-brand-sky" /> View
          </span>
        </span>
        <span className="mt-5 flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">{number}</span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold text-ink transition-colors group-hover:text-accent">{work.title}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              {work.category} · {work.scale}
            </span>
          </span>
        </span>
      </motion.button>
    </motion.div>
  )
}

// Home teaser for /works: three issued sheets laid on the table, plus a link to the full set.
export default function WorksPreview({ index = '02' }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(null)
  const picks = PICKS.map((id) => works.find((w) => w.id === id))
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = [useTransform(scrollYProgress, [0, 1], [30, -30]), useTransform(scrollYProgress, [0, 1], [60, -60]), useTransform(scrollYProgress, [0, 1], [20, -40])]

  return (
    <section ref={ref} className="relative overflow-clip pb-16 pt-24 lg:pb-24 lg:pt-32">
      <SheetRuler className="top-0" />
      <div className="bg-blueprint mask-radial absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-brand-electric/15 blur-[120px]" aria-hidden="true" />

      <div className="container-x relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={index}
            eyebrow="Our works"
            title="Sheets straight off our drawing board."
            highlight={[3, 4, 5]}
            text="A few of the shop drawings, joinery details and room documentation we have issued. Open one to zoom in to the detail."
          />
          <Reveal delay={0.2} className="shrink-0">
            <Link
              to="/works"
              className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink"
            >
              <span className="border-b border-line/20 pb-1 transition-colors group-hover:border-accent group-hover:text-accent">
                View all {works.length} sheets
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line/15 transition-all group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-obsidian">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ staggerChildren: 0.12 }}
          className="-mx-4 mt-16 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-20 lg:grid lg:grid-cols-4 lg:gap-10 lg:overflow-visible lg:px-0"
        >
          {picks.map((w, i) => (
            <Sheet
              key={w.id}
              work={w}
              number={String(i + 1).padStart(2, '0')}
              pose={POSE[i]}
              drift={drift[i]}
              onOpen={() => setOpen(works.indexOf(w))}
            />
          ))}

          {/* the rest of the set, still in the drawer */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
            className="w-[78vw] shrink-0 snap-center sm:w-[58vw] lg:w-auto"
          >
            <Link
              to="/works"
              data-cursor="All works"
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-md border border-dashed border-accent/40 p-5 transition-colors hover:border-accent hover:bg-accent/[0.06]"
            >
              {works
                .filter((w) => !PICKS.includes(w.id))
                .slice(0, 3)
                .map((w, i) => (
                  <img
                    key={w.id}
                    src={w.thumb}
                    alt=""
                    loading="lazy"
                    className="absolute right-[-26%] top-1/2 w-[62%] rounded-sm bg-white opacity-20 shadow-xl grayscale transition-all duration-700 group-hover:opacity-50"
                    style={{ transform: `translateY(-50%) translateX(${i * -12}%) rotate(${(i - 1) * 6}deg)` }}
                  />
                ))}
              <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Full set</span>
              <span className="relative z-10">
                <span className="block font-display text-5xl font-semibold text-ink">+{works.length - picks.length}</span>
                <span className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  View all works <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open !== null && <WorkLightbox items={works} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  )
}
