import { PageArrow } from './PageArrow'
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { gift, type Photo } from './content'
import { cutAlong, interpolate, midway, polygonClip, polygonPath, projectSeam } from './parcelGeometry'

type Parcel = typeof gift.parcels[number]
type Phase = 'sealed' | 'cut' | 'unfolding' | 'opening' | 'opened'
type Side = 'left' | 'right'
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function ParcelArt({ parcel }: { parcel: Parcel }) {
  return <svg className="parcel-art" viewBox={parcel.art.crop.join(' ')} aria-hidden="true" focusable="false">
    <image href={parcel.art.src} width={parcel.art.width} height={parcel.art.height} />
  </svg>
}

function ParcelBox({ parcel, complete, view }: {
  parcel: Parcel; complete: () => void; view: (photo: Photo, trigger: HTMLButtonElement) => void
}) {
  const uid = useId().replace(/[^\w-]/g, '')
  const [phase, setPhase] = useState<Phase>('sealed')
  const [cuts, setCuts] = useState(() => Array<boolean>(gift.cutSegments).fill(false))
  const cutRef = useRef(cuts)
  const cutting = useRef<{ pointer: number; previous: number | null } | null>(null)
  const [openedFlaps, setOpenedFlaps] = useState({ left: false, right: false })
  const [lift, setLift] = useState({ left: 0, right: 0 })
  const flapDrag = useRef<{ pointer: number; side: Side; x: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const done = useRef(complete)
  done.current = complete
  const [backLeft, backRight, frontRight, frontLeft] = parcel.corners
  const seamStart = midway(backLeft, backRight), seamEnd = midway(frontLeft, frontRight)
  const seamMiddle = midway(seamStart, seamEnd)
  const sides = {
    left: { polygon: [backLeft, seamStart, seamEnd, frontLeft], hinge: backLeft, end: frontLeft, sign: -1 },
    right: { polygon: [seamStart, backRight, frontRight, seamEnd], hinge: backRight, end: frontRight, sign: 1 },
  }
  const line = `M${seamStart.join(' ')}L${seamEnd.join(' ')}`
  const opened = phase === 'opening' || phase === 'opened'
  const cut = phase !== 'sealed'
  useEffect(() => {
    if (phase === 'cut' && openedFlaps.left && openedFlaps.right) setPhase('unfolding')
  }, [openedFlaps, phase])
  useEffect(() => {
    if (phase !== 'unfolding' && phase !== 'opening') return
    const timer = window.setTimeout(() => {
      if (phase === 'unfolding') setPhase('opening')
      else { setPhase('opened'); done.current() }
    }, reduced() ? 0 : phase === 'unfolding' ? gift.unfoldMs : gift.revealMs)
    return () => clearTimeout(timer)
  }, [phase])
  function finishCut() {
    cutting.current = null
    const full = Array<boolean>(gift.cutSegments).fill(true)
    cutRef.current = full; setCuts(full); setPhase('cut')
  }
  function sample(event: PointerEvent<SVGPathElement>) {
    const current = cutting.current
    if (!current || current.pointer !== event.pointerId) return
    const rect = box.current!.getBoundingClientRect()
    const start = [seamStart[0] * rect.width / 1000, seamStart[1] * rect.height / 1000]
    const end = [seamEnd[0] * rect.width / 1000, seamEnd[1] * rect.height / 1000]
    const point = projectSeam([event.clientX - rect.left, event.clientY - rect.top], start, end)
    if (point.distance > gift.cutTolerancePx || point.raw < -.2 || point.raw > 1.2) { current.previous = null; return }
    const next = cutAlong(cutRef.current, current.previous, point.t)
    current.previous = point.t; cutRef.current = next; setCuts(next)
    if (next.filter(Boolean).length / next.length >= gift.cutThreshold) finishCut()
  }
  function cutDown(event: PointerEvent<SVGPathElement>) {
    if (event.button !== 0) return
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    cutting.current = { pointer: event.pointerId, previous: null }; sample(event)
  }
  function cutUp(event: PointerEvent<SVGPathElement>) {
    cutting.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  function openFlap(side: Side) {
    flapDrag.current = null
    setLift(current => ({ ...current, [side]: 1 }))
    setOpenedFlaps(current => ({ ...current, [side]: true }))
  }
  function flapDown(event: PointerEvent<HTMLButtonElement>, side: Side) {
    if (event.button !== 0) return
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    flapDrag.current = { pointer: event.pointerId, side, x: event.clientX }
  }
  function flapMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = flapDrag.current
    if (!drag || drag.pointer !== event.pointerId) return
    const distance = (event.clientX - drag.x) * (drag.side === 'left' ? -1 : 1)
    const progress = Math.max(0, Math.min(1, distance / gift.flapDragPx))
    setLift(current => ({ ...current, [drag.side]: progress }))
    if (progress >= 1) openFlap(drag.side)
  }
  function flapUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = flapDrag.current
    flapDrag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (drag) setLift(current => ({ ...current, [drag.side]: 0 }))
  }
  return <article className={`parcel parcel-${parcel.id} parcel-${phase}`} style={{ '--body-clip': parcel.bodyClip, '--box-aspect': `${parcel.art.crop[2]} / ${parcel.art.crop[3]}` } as CSSProperties} aria-label={parcel.label}>
    <div className="parcel-box" ref={box}>
      <svg className="parcel-cavity" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path d={parcel.opening} fill="#81604b" stroke="#9d785c" strokeWidth="12" strokeLinejoin="round" /></svg>
      <div className="parcel-body"><ParcelArt parcel={parcel} /></div>
      {(['left', 'right'] as const).map(side => {
        const data = sides[side], progress = lift[side]
        const degrees = cut ? data.sign * (10 + progress * 135) : 0
        const aspect = parcel.art.crop[2] / parcel.art.crop[3]
        const flapStyle = {
          clipPath: polygonClip(data.polygon), transformOrigin: `${data.hinge[0] / 10}% ${data.hinge[1] / 10}%`,
          transform: `perspective(900px) rotate3d(${(data.end[0] - data.hinge[0]) * aspect}, ${data.end[1] - data.hinge[1]}, 0, ${degrees}deg)`,
        }
        return <div key={side} className={`parcel-flap parcel-flap-${side}`} style={flapStyle}>
          <div className="parcel-flap-front" style={{ opacity: progress > .6 ? 0 : 1 }}>
            <ParcelArt parcel={parcel} />
            <svg className="parcel-flap-tape" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
              <path d={line} stroke="#e5a0c2" strokeWidth="58" />
              {cuts.map((visited, index) => {
                if (!visited) return null
                const start = interpolate(seamStart, seamEnd, index / cuts.length), end = interpolate(seamStart, seamEnd, (index + 1) / cuts.length)
                return <path key={index} d={`M${start.join(' ')}L${(start[0] + end[0]) / 2 + (index % 2 ? 3 : -3)} ${(start[1] + end[1]) / 2}L${end.join(' ')}`} fill="none" stroke="#72503f" strokeWidth="9" strokeLinecap="round" />
              })}
            </svg>
          </div>
          <svg className="parcel-flap-back" style={{ opacity: progress > .6 ? 1 : 0 }} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path d={polygonPath(data.polygon)} fill="#d7b99a" stroke="#987457" strokeWidth="8" /></svg>
        </div>
      })}
      {(phase === 'sealed' || phase === 'cut') && <p className="parcel-seam-hint" style={{ left: `${seamMiddle[0] / 10}%`, top: `${seamMiddle[1] / 10}%` }} aria-live="polite">{cut ? gift.openHint : gift.cutHint}</p>}
      {phase === 'sealed' && <svg className="parcel-seam-guide" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs><marker id={`cut-arrow-${uid}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M1 1L6 4L1 7" fill="none" stroke="#754c49" strokeWidth="1.3" /></marker></defs>
        <path d={line} fill="none" stroke="#754c49" strokeWidth="3" strokeDasharray="10 9" markerEnd={`url(#cut-arrow-${uid})`} pointerEvents="none" />
        <path className="parcel-cut-input" d={line} fill="none" stroke="transparent" strokeWidth="240" role="button" tabIndex={0} aria-label={gift.cutLabel.replace('{parcel}', parcel.label)}
          onPointerDown={cutDown} onPointerMove={sample} onPointerUp={cutUp} onPointerCancel={cutUp} onLostPointerCapture={() => { cutting.current = null }}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); finishCut() } }} />
      </svg>}
      {phase === 'cut' && <>
        <svg className="parcel-flap-arrows" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d={`M${seamMiddle[0] - 30} ${seamMiddle[1]}h-85m20 -15l-20 15l20 15M${seamMiddle[0] + 30} ${seamMiddle[1]}h85m-20 -15l20 15l-20 15`} fill="none" stroke="#704f47" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {(['left', 'right'] as const).map(side => !openedFlaps[side] && <button key={side} className={`parcel-flap-handle parcel-flap-handle-${side}`} style={{ clipPath: polygonClip(sides[side].polygon) }}
          aria-label={(side === 'left' ? gift.leftLabel : gift.rightLabel).replace('{parcel}', parcel.label)}
          onPointerDown={event => flapDown(event, side)} onPointerMove={flapMove} onPointerUp={flapUp} onPointerCancel={flapUp}
          onLostPointerCapture={() => { const drag = flapDrag.current; if (drag) { flapDrag.current = null; setLift(current => ({ ...current, [drag.side]: 0 })) } }}
          onClick={event => { if (event.detail === 0) openFlap(side) }} />)}
      </>}
    </div>
    <button className="parcel-present" disabled={phase !== 'opened'} aria-hidden={!opened} tabIndex={phase === 'opened' ? 0 : -1}
      aria-label={`${gift.zoom}${parcel.image.alt}`} onClick={event => view(parcel.image, event.currentTarget)}>
      <img src={parcel.image.src} alt={parcel.image.alt} draggable={false} />
    </button>
    <div className="parcel-note" aria-hidden={!opened}>
      <img src={gift.note.src} alt="" draggable={false} />
      <p aria-label={parcel.blessing}>{parcel.blessingLines.map((line, index) => <span key={index}>{line}</span>)}</p>
    </div>
  </article>
}
export function GiftParcels({ previous, next, view }: {
  previous: () => void; next: () => void; view: (photo: Photo, trigger: HTMLButtonElement) => void
}) {
  const [finished, setFinished] = useState<string[]>([])
  return <section id="gift" className="parcels-scene" aria-label={gift.label}>
    <h2 id="gift-title" className="sr-only" tabIndex={-1}>{gift.label}</h2>
    <div className="parcels-workspace">
      {gift.parcels.map(parcel => <ParcelBox key={parcel.id} parcel={parcel} view={view} complete={() => setFinished(current => current.includes(parcel.id) ? current : [...current, parcel.id])} />)}
    </div>
    <PageArrow direction="previous" label={gift.previous} onClick={previous} />
    {finished.length === gift.parcels.length && <PageArrow direction="next" label={gift.next} onClick={next} />}
  </section>
}
