import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Reveal, RevealText } from './Reveal.jsx'

function DraftLines() {
  const draw = (delay) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.8, delay, ease: [0.65, 0, 0.35, 1] },
  })
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 text-accent/25 lg:block"
      viewBox="0 0 600 500"
      fill="none"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <motion.path d="M120 420 H560 M120 420 V120 M120 120 L340 60 L560 120 V420" stroke="currentColor" {...draw(0.2)} />
      <motion.path d="M180 420 V200 H300 V420 M380 420 V240 H500 V420" stroke="currentColor" {...draw(0.6)} />
      <motion.path d="M120 450 H560 M120 444 V456 M560 444 V456" stroke="#3CC8FF" strokeOpacity=".5" {...draw(1)} />
      <motion.circle cx="340" cy="60" r="6" stroke="#3CC8FF" {...draw(1.2)} />
      <text x="310" y="470" className="fill-current font-mono text-[11px]">
        11 200
      </text>
    </svg>
  )
}

// Framed hero image in the right column, with blueprint corner ticks to match the drawing-board look.
function HeroImage({ src, alt }) {
  const tick = 'absolute h-5 w-5 border-accent/60'
  return (
    <Reveal delay={0.25} className="relative mt-12 lg:col-span-5 lg:mt-0">
      <div className="relative overflow-hidden rounded-2xl border border-line/10 bg-surface shadow-[0_30px_80px_-40px_rgba(0,108,186,0.6)]">
        <img src={src} alt={alt} decoding="async" fetchpriority="high" className="block h-auto w-full" />
      </div>
      <span aria-hidden="true">
        <span className={`${tick} -left-2 -top-2 border-l border-t`} />
        <span className={`${tick} -right-2 -top-2 border-r border-t`} />
        <span className={`${tick} -bottom-2 -left-2 border-b border-l`} />
        <span className={`${tick} -bottom-2 -right-2 border-b border-r`} />
      </span>
    </Reveal>
  )
}

export default function PageHero({ eyebrow, title, text, crumbs = [], highlight, image, children }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 lg:pb-24 lg:pt-44">
      <div className="bg-blueprint mask-radial-top absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-brand-electric/20 blur-[130px]"
        aria-hidden="true"
      />
      {!image && <DraftLines />}
      <div className={`container-x relative ${image ? 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-12' : ''}`}>
        <div className={image ? 'lg:col-span-7' : undefined}>
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
              <Link to="/" className="hover:text-accent">
                Home
              </Link>
              {crumbs.map((c) => (
                <span key={c.label} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  {c.to ? (
                    <Link to={c.to} className="hover:text-accent">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-body">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <RevealText
            as="h1"
            text={title}
            highlight={highlight}
            className={`mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl ${
              image ? 'lg:text-6xl' : 'lg:text-7xl'
            }`}
          />
          {text && (
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{text}</p>
            </Reveal>
          )}
          {children}
        </div>
        {image && <HeroImage {...image} />}
      </div>
    </section>
  )
}
