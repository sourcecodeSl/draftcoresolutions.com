import { useId } from 'react'
import { motion } from 'framer-motion'

// Self-drawing technical illustrations, one per service (viewBox 400 × 300).
// Strokes use currentColor; `L` animates pathLength, `F` fades a filled shape, `T` fades a label.
// `Sheet` shows a crop of a real DraftCore drawing, tinted with currentColor and scanned in.

const EASE = [0.65, 0, 0.35, 1]

function L({ d, i = 0, w = 1.4, dash, o = 1 }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={w}
      strokeOpacity={o}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration: 1.1, delay: i * 0.06, ease: EASE }, opacity: { duration: 0.2, delay: i * 0.06 } }}
    />
  )
}

function F({ children, i = 0 }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 + i * 0.07, ease: EASE }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      {children}
    </motion.g>
  )
}

function T({ x, y, children, i = 0, anchor = 'middle', size = 9, rotate }) {
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontFamily="JetBrains Mono, monospace"
      letterSpacing="1"
      fill="currentColor"
      fillOpacity="0.75"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.9 + i * 0.05 }}
    >
      {children}
    </motion.text>
  )
}

// ── 01 BIM: isometric massing model ─────────────────────────────────────────
const S = 13
const iso = (x, y, z) => [200 + (x - y) * S * 0.866, 200 + (x + y) * S * 0.5 - z * S]
const poly = (pts, close = true) => `M${pts.map((p) => iso(...p).map((n) => n.toFixed(1)).join(' ')).join(' L')}${close ? ' Z' : ''}`
function box(x, y, z, w, d, h) {
  const b = [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]
  const t = b.map(([a, c, e]) => [a, c, e + h])
  return [poly(b), poly(t), ...b.map((p, k) => poly([p, t[k]], false))]
}
function Bim() {
  const tower = box(-2, -2, 1.4, 4, 4, 9)
  const floors = Array.from({ length: 8 }, (_, k) => poly([[-2, -2, 2.4 + k], [2, -2, 2.4 + k], [2, 2, 2.4 + k], [-2, 2, 2.4 + k]]))
  const parts = [...box(-5.5, -4.5, 0, 11, 9, 1.4), ...box(-5.2, -2.8, 1.4, 2.6, 5, 4.4), ...box(2.6, -2.8, 1.4, 2.6, 5, 3), ...tower, ...box(-1.3, -1.3, 10.4, 2.6, 2.6, 1)]
  const ground = Array.from({ length: 7 }, (_, k) => poly([[-8 + k * 2.6, -7, 0], [-8 + k * 2.6, 7, 0]], false))
  return (
    <>
      {ground.map((d, k) => (
        <L key={`g${k}`} d={d} w={0.6} o={0.25} i={k * 0.3} />
      ))}
      {parts.map((d, k) => (
        <L key={k} d={d} i={k * 0.35} />
      ))}
      {floors.map((d, k) => (
        <L key={`f${k}`} d={d} w={0.8} o={0.55} i={8 + k * 0.5} />
      ))}
      <F i={2}>
        <path d={poly([[-2, -2, 10.4], [2, -2, 10.4], [2, 2, 10.4], [-2, 2, 10.4]])} fill="currentColor" fillOpacity="0.18" />
      </F>
      <L d="M258 70 L300 44 H360" w={0.8} i={14} />
      <T x={330} y={38} i={2}>
        LOD 350
      </T>
      <T x={330} y={60} i={3} size={7}>
        REVIT · ID + ARCH
      </T>
    </>
  )
}

// ── Real drawing crop ───────────────────────────────────────────────────────
// `src` is a white-on-black line mask (public/media/drawings), so the lines take currentColor.
const base = import.meta.env.BASE_URL
function Sheet({ src, w = 400, h = 300 }) {
  const id = useId().replace(/:/g, '')
  return (
    <>
      <defs>
        <mask id={`${id}m`}>
          <image href={`${base}${src}`} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
        </mask>
        <clipPath id={`${id}c`}>
          <motion.rect height={h} initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 1.4, ease: EASE }} />
        </clipPath>
      </defs>
      <rect width={w} height={h} fill="currentColor" mask={`url(#${id}m)`} clipPath={`url(#${id}c)`} />
      <motion.rect
        y="0"
        width="1.5"
        height={h}
        fill="currentColor"
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: w, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, ease: EASE }}
      />
    </>
  )
}

// A standalone sheet at the drawing's own proportions (`w` × `h` = mask pixel size).
export function DrawingSheet({ src, w, h, className = '' }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-hidden="true">
      <Sheet src={src} w={w} h={h} />
    </svg>
  )
}

// ── 02 CAD: hotel room reflected ceiling plan ───────────────────────────────
function Plan() {
  return <Sheet src="media/drawings/hotel-room-rcp.png" />
}

// ── 03 Shop drawings: 3-seater sofa, elevation + plan ───────────────────────
function Sofa() {
  return <Sheet src="media/drawings/sofa-shop-drawing.png" />
}

// ── 04 Interior design: mood board ──────────────────────────────────────────
function Mood() {
  const chips = ['#0D182A', '#3CC8FF', '#C8A46A', '#E9E4DC', '#5B7552']
  return (
    <>
      <L d="M30 30 H370 V270 H30 Z" w={1} o={0.5} />
      <F i={0}>
        <rect x="50" y="50" width="100" height="120" rx="4" fill="#B48A63" />
        <path d="M50 70 Q100 62 150 72 M50 96 Q100 88 150 98 M50 122 Q100 116 150 126 M50 148 Q100 140 150 150" stroke="#8A6444" strokeWidth="1.2" fill="none" />
      </F>
      <F i={1}>
        <rect x="162" y="50" width="70" height="70" rx="4" fill="#D9D3C9" />
        <path d="M170 64 L200 80 M190 100 L226 90 M168 108 L186 116" stroke="#b9b1a4" strokeWidth="1" fill="none" />
      </F>
      <F i={2}>
        <rect x="162" y="128" width="70" height="42" rx="4" fill="#4C5F68" />
      </F>
      {chips.map((c, k) => (
        <F key={c} i={3 + k}>
          <circle cx={62 + k * 34} cy={205} r="13" fill={c} stroke="currentColor" strokeOpacity="0.3" />
        </F>
      ))}
      <L d="M250 196 H350 V232 H250 Z M258 178 H342 V196 M250 206 H240 V232 H250 M350 206 H360 V232 H350 M256 232 V244 M344 232 V244" w={1.3} i={2} />
      <L d="M300 30 V70 M280 94 L320 94 L310 70 L290 70 Z" w={1.2} i={4} />
      <L d="M300 100 m-18 0 a18 18 0 1 0 36 0" w={0.6} dash="2 3" o={0.6} i={6} />
      <T x={100} y={186} i={1}>OAK</T>
      <T x={197} y={44} i={2}>TRAVERTINE</T>
      <T x={197} y={184} i={3}>BOUCLÉ</T>
      <T x={300} y={262} i={4}>FF-01 · SOFA</T>
      <T x={130} y={250} i={5}>PALETTE A</T>
    </>
  )
}

// ── 05 Project delivery: programme chart ────────────────────────────────────
function Programme() {
  const rows = [
    ['CD', 70, 60],
    ['SD', 110, 70],
    ['DD', 160, 80],
    ['TND', 225, 45],
    ['IFC', 255, 55],
    ['SITE', 290, 70],
  ]
  return (
    <>
      <L d="M60 36 V250 H370" w={1.4} />
      {[110, 160, 210, 260, 310, 360].map((x, k) => (
        <L key={x} d={`M${x} 40 V250`} w={0.6} dash="2 4" o={0.35} i={1 + k * 0.4} />
      ))}
      {rows.map(([label, x, w], k) => (
        <g key={label}>
          <T x={52} y={68 + k * 32} anchor="end" i={k}>
            {label}
          </T>
          <motion.rect
            x={x}
            y={56 + k * 32}
            width={w}
            height={16}
            rx={3}
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.2"
            style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.4 + k * 0.15, ease: EASE }}
          />
          <F i={4 + k}>
            <path d={`M${x + w + 8} ${64 + k * 32} l6 -6 l6 6 l-6 6 z`} fill="currentColor" />
          </F>
        </g>
      ))}
      <L d="M240 30 V256" w={1.2} dash="5 4" i={10} />
      <T x={240} y={24} i={6}>TODAY</T>
      <L d="M84 274 l5 5 l10 -10 M154 274 l5 5 l10 -10 M224 274 l5 5 l10 -10" w={1.6} i={12} />
      <T x={130} y={292} i={7} size={7}>QA · SNAGGING · HANDOVER</T>
    </>
  )
}

// ── 06 FF&E: armchair, front + side elevation ───────────────────────────────
function Armchair() {
  return <Sheet src="media/drawings/armchair-shop-drawing.png" />
}

// ── 07 Custom joinery: daybed niche, elevation + section ────────────────────
function Joinery() {
  return <Sheet src="media/drawings/daybed-joinery.png" />
}

const DRAWINGS = [Bim, Plan, Sofa, Mood, Programme, Armchair, Joinery]

export default function ServiceDrawing({ index, className = '' }) {
  const Drawing = DRAWINGS[index] || Bim
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-hidden="true">
      <Drawing />
    </svg>
  )
}
