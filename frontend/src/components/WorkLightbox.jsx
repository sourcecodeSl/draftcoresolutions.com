import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowUpRight } from 'lucide-react'
import { lockScroll } from '../lib/smoothScroll.js'

const EASE = [0.22, 1, 0.36, 1]
const ZOOM = 2.6

// Fit-to-stage size of a sheet with aspect `w / h`.
function useFit(ref, w, h) {
  const [fit, setFit] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => {
      const s = Math.min(el.clientWidth / w, el.clientHeight / h)
      setFit({ w: Math.floor(w * s), h: Math.floor(h * s) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, w, h])
  return fit
}

// Full-screen sheet viewer: click to zoom at a point, drag (or scroll) to pan, arrows / swipe to browse.
export default function WorkLightbox({ items, index, onIndex, onClose }) {
  const item = items[index]
  const stage = useRef(null)
  const closeBtn = useRef(null)
  const drag = useRef(null)
  const swiped = useRef(false)
  const zoomAt = useRef(null)
  const [zoomed, setZoomed] = useState(false)
  const [dir, setDir] = useState(0)
  const [loaded, setLoaded] = useState({})
  const fit = useFit(stage, item.w, item.h)

  const go = (step) => {
    setDir(step)
    setZoomed(false)
    onIndex((index + step + items.length) % items.length)
  }

  useEffect(() => {
    const prevFocus = document.activeElement
    lockScroll(true)
    closeBtn.current?.focus()
    return () => {
      lockScroll(false)
      prevFocus?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // warm the neighbouring sheets so browsing feels instant
  useEffect(() => {
    ;[1, -1].forEach((s) => {
      const img = new Image()
      img.src = items[(index + s + items.length) % items.length].src
    })
  }, [index, items])

  // while the sheet grows, keep the clicked point in the middle of the stage
  const followZoom = (latest) => {
    const el = stage.current
    if (!zoomed || !el || !zoomAt.current) return
    const [fx, fy] = zoomAt.current
    el.scrollLeft = fx * parseFloat(latest.width) - el.clientWidth / 2
    el.scrollTop = fy * parseFloat(latest.height) - el.clientHeight / 2
  }

  const toggleZoom = (e) => {
    if (zoomed) return setZoomed(false)
    if (e?.currentTarget && e.clientX !== undefined) {
      const r = e.currentTarget.getBoundingClientRect()
      zoomAt.current = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
    } else zoomAt.current = [0.5, 0.5]
    setZoomed(true)
  }

  // mouse drag-to-pan while zoomed (touch uses native scrolling)
  const onPointerDown = (e) => {
    if (!zoomed || e.pointerType !== 'mouse') return
    const el = stage.current
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    stage.current.scrollLeft = d.left - dx
    stage.current.scrollTop = d.top - dy
  }
  const endDrag = () => {
    setTimeout(() => (drag.current = null), 0)
  }
  const onImageClick = (e) => {
    if (drag.current?.moved || swiped.current) return
    toggleZoom(e)
  }

  const size = zoomed ? { width: fit.w * ZOOM, height: fit.h * ZOOM } : { width: fit.w, height: fit.h }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} drawing`}
      className="theme-dark fixed inset-0 z-[85] flex flex-col bg-[#060b14]/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      {/* top bar */}
      <header className="relative z-10 flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <span className="hidden rounded-md border border-accent/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent sm:inline">
          {item.code}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold text-ink sm:text-lg">{item.title}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {item.category} · Scale {item.scale}
          </p>
        </div>
        <span className="hidden font-mono text-xs text-muted sm:block">
          <span className="text-ink">{String(index + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => toggleZoom()}
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line/15 text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        </button>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[#060b14] transition-transform hover:rotate-90"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* sheet stage */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={stage}
          data-lenis-prevent
          className={`absolute inset-0 mx-4 sm:mx-16 lg:mx-20 ${zoomed ? 'overflow-auto [scrollbar-width:thin]' : 'overflow-hidden'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={item.id}
              custom={dir}
              variants={{
                enter: (d) => ({ opacity: 0, x: d * 80, scale: 0.97 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (d) => ({ opacity: 0, x: d * -80, scale: 0.97 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              drag={zoomed ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragStart={() => (swiped.current = true)}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1)
                else if (info.offset.x > 70) go(-1)
                setTimeout(() => (swiped.current = false), 0)
              }}
              className={zoomed ? 'mx-auto w-max' : 'flex h-full w-full items-center justify-center'}
            >
              <motion.img
                src={item.src}
                alt={`${item.title} — ${item.subtitle}`}
                draggable={false}
                onLoad={() => setLoaded((l) => ({ ...l, [item.id]: true }))}
                onClick={onImageClick}
                animate={size}
                onUpdate={followZoom}
                transition={{ duration: 0.45, ease: EASE }}
                style={{ backgroundImage: `url(${item.thumb})`, backgroundSize: '100% 100%' }}
                className={`max-w-none select-none rounded-sm bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ${
                  zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                }`}
              />
            </motion.div>
          </AnimatePresence>
          {!loaded[item.id] && (
            <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Plotting full sheet…
            </span>
          )}
        </div>

        {[-1, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            aria-label={s < 0 ? 'Previous drawing' : 'Next drawing'}
            className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line/15 bg-[#060b14]/70 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent sm:flex ${
              s < 0 ? 'left-3 lg:left-5' : 'right-3 lg:right-5'
            }`}
          >
            {s < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        ))}
      </div>

      {/* filmstrip + caption */}
      <footer className="relative z-10 flex flex-col gap-3 px-4 pb-4 pt-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="hidden max-w-md text-sm text-muted lg:block">
          {item.subtitle}
          <Link to={`/services/${item.service}`} onClick={onClose} className="ml-2 inline-flex items-center gap-1 text-accent hover:underline">
            Related service <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {items.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setDir(i > index ? 1 : -1)
                setZoomed(false)
                onIndex(i)
              }}
              aria-label={`Show ${w.title}`}
              aria-current={i === index}
              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border bg-white transition-all sm:h-14 sm:w-[76px] ${
                i === index ? 'border-accent opacity-100 ring-2 ring-accent/40' : 'border-transparent opacity-40 hover:opacity-80'
              }`}
            >
              <img src={w.thumb} alt="" className="h-full w-full object-cover object-left-top" loading="lazy" />
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint sm:hidden">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} · Swipe to browse · Tap to zoom
        </p>
      </footer>
    </motion.div>
  )
}
