import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { flushSync } from 'react-dom'
import { memories, ui, type Photo } from './content'

type Point = { x: number; y: number }
type HangingPhoto = { index: number; slot: number }
type Drag = {
  index: number
  element: HTMLDivElement
  ready: boolean
  target: number | null
  pointer: number
  start: Point
  offset: Point
  direction: number
  turnX: number
  extremeX: number
  progress: number
  moved: boolean
}

const startPosition = { x: 0.16, y: 0.78 }

function FramedPhoto({ photo, progress = 1 }: { photo?: Photo; progress?: number }) {
  return <div className="memory-frame" style={{ aspectRatio: `${memories.frame.width} / ${memories.frame.height}` }}>
    <div className="memory-window" style={{
      left: `calc(${memories.frame.window.left} - 2px)`, top: `calc(${memories.frame.window.top} - 2px)`,
      width: `calc(${memories.frame.window.width} + 4px)`, height: `calc(${memories.frame.window.height} + 4px)`,
    }}>
      {photo && <img src={photo.src} alt={progress === 1 ? photo.alt : ''} draggable={false}
        style={{ opacity: progress, filter: `blur(${(1 - progress) * 11}px) contrast(${.35 + progress * .65}) saturate(${.3 + progress * .7})` }} />}
    </div>
    <img className="memory-frame-texture" src={memories.frame.src} alt="" draggable={false} />
  </div>
}

function RotateIcon() {
  return <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M19.7 10a8 8 0 1 0-1.5 7M20 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function PhotoLab({ previous, next }: { previous: () => void; next: () => void }) {
  const [hung, setHung] = useState<HangingPhoto[]>([])
  const [progress, setProgress] = useState(0)
  const [read, setRead] = useState(() => new Set<number>())
  const [extracted, setExtracted] = useState(false)
  const [back, setBack] = useState(false)
  const [position, setPosition] = useState(startPosition)
  const [hintAnchor, setHintAnchor] = useState({ x: 16, y: 50 })
  const [dragging, setDragging] = useState(false)
  const [hoverSlot, setHoverSlot] = useState<number | null>(null)
  const [settling, setSettling] = useState<number | null>(null)
  const [review, setReview] = useState<number | null>(null)
  const [reviewBack, setReviewBack] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const paper = useRef<HTMLDivElement>(null)
  const slots = useRef(new Map<number, HTMLDivElement>())
  const drag = useRef<Drag | null>(null)
  const hungRef = useRef<HangingPhoto[]>([])
  const readRef = useRef(new Set<number>())
  const pointerHandlers = useRef<{ move: (event: PointerEvent) => void; finish: (event: PointerEvent, cancelled?: boolean) => void } | null>(null)
  const pausedSwing = useRef({ direction: 0, leg: 0 })
  const dialog = useRef<HTMLDialogElement>(null)
  const reviewTrigger = useRef<HTMLButtonElement | null>(null)
  const current = hung.length
  const photo = memories.photos[current]
  const eligible = progress === 1 && read.has(current)

  useEffect(() => {
    if (settling === null) return
    const timer = window.setTimeout(() => setSettling(null), 720)
    return () => window.clearTimeout(timer)
  }, [settling])

  useEffect(() => {
    const element = dialog.current
    if (review !== null && element && !element.open) element.showModal()
    if (review === null && element?.open) element.close()
  }, [review])

  // All drag offsets are stage-local CSS pixels. Convert client coordinates once,
  // so page zoom and a scaled stage cannot change the paper's drop anchor.
  function geometry() {
    const element = stage.current!
    const bounds = element.getBoundingClientRect()
    const scaleX = bounds.width / element.offsetWidth
    const scaleY = bounds.height / element.offsetHeight
    const width = extracted ? paper.current!.offsetWidth : Math.min(element.offsetWidth * .22, 270)
    return { bounds, scaleX, scaleY, width, height: width * memories.frame.height / memories.frame.width }
  }

  function clampPosition(client: Point, offset: Point) {
    const { bounds, scaleX, scaleY, width, height } = geometry()
    const stageWidth = bounds.width / scaleX
    const stageHeight = bounds.height / scaleY
    const headroom = 64
    const x = Math.max(width / 2 + 18, Math.min(stageWidth - width / 2 - 48, (client.x - bounds.left) / scaleX - offset.x))
    const y = Math.max(height / 2 + headroom, Math.min(stageHeight - height / 2 - 18, (client.y - bounds.top) / scaleY - offset.y))
    return { x: x / stageWidth, y: y / stageHeight }
  }

  function setDropTarget(slot: number | null) {
    const session = drag.current
    if (!session || session.target === slot) return
    // The active pointer session owns both the visible highlight and the drop.
    session.target = slot
    flushSync(() => setHoverSlot(slot))
  }

  function findSlot(client: Point, offset: Point) {
    const { bounds, height, scaleX, scaleY } = geometry()
    const center = clampPosition(client, offset)
    const anchor = { x: center.x * bounds.width / scaleX, y: center.y * bounds.height / scaleY - height / 2 }
    const candidates: { slot: number; distance: number; reach: number }[] = []
    for (const [slot, element] of slots.current) {
      if (hungRef.current.some(item => item.slot === slot)) continue
      const rect = element.getBoundingClientRect()
      const dx = anchor.x - (rect.left + rect.width / 2 - bounds.left) / scaleX
      const dy = anchor.y - (rect.top - bounds.top) / scaleY
      // A generous area below the rope catches a paper held near its bottom.
      const reach = Math.hypot(dx / 240, dy / (dy >= 0 ? 280 : 190))
      candidates.push({ slot, distance: Math.hypot(dx, dy), reach })
    }
    candidates.sort((a, b) => a.distance - b.distance)
    const closest = candidates.find(item => item.reach <= 1)
    const previous = candidates.find(item => item.slot === drag.current?.target)
    if (previous && previous.reach <= 1.45 && (!closest || previous.distance <= closest.distance + 45)) return previous.slot
    return closest?.slot ?? null
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || drag.current || (event.target as Element).closest('button')) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const point = { x: event.clientX, y: event.clientY }
    const { scaleX, scaleY } = geometry()
    drag.current = {
      index: current, element: event.currentTarget,
      ready: progress === 1 && readRef.current.has(current), target: null,
      pointer: event.pointerId, start: point,
      offset: { x: (point.x - rect.left - rect.width / 2) / scaleX, y: (point.y - rect.top - rect.height / 2) / scaleY },
      direction: pausedSwing.current.direction,
      turnX: point.x - pausedSwing.current.direction * pausedSwing.current.leg,
      extremeX: point.x, progress, moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    if (drag.current.ready) setDropTarget(findSlot(point, drag.current.offset))
  }

  function moveDrag(event: PointerEvent) {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    // Recover a release outside the captured element without waiting for a click.
    if (event.pointerType === 'mouse' && event.buttons === 0) { finishDrag(event); return }
    const point = { x: event.clientX, y: event.clientY }
    if (!state.moved && Math.hypot(point.x - state.start.x, point.y - state.start.y) < 7) return
    state.moved = true
    setExtracted(true)
    setPosition(clampPosition(point, state.offset))

    // Credit horizontal travel only after a deliberate direction reversal.
    // Long one-way drags and tiny pointer jitter cannot develop the photo.
    const travel = point.x - state.extremeX
    if (!state.direction && Math.abs(travel) >= 18) {
      state.direction = Math.sign(travel)
      state.extremeX = point.x
    } else if (state.direction && Math.sign(travel) === state.direction) {
      state.extremeX = point.x
    } else if (state.direction && Math.abs(travel) >= 18) {
      const leg = Math.abs(state.extremeX - state.turnX)
      if (leg >= 34) {
        state.progress = Math.min(1, state.progress + Math.min(leg, 80) / 280)
        setProgress(state.progress)
      }
      state.turnX = state.extremeX
      state.extremeX = point.x
      state.direction *= -1
    }
    setDropTarget(state.ready ? findSlot(point, state.offset) : null)
  }

  function finishDrag(event: PointerEvent, cancelled = false) {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    const latest = { x: event.clientX, y: event.clientY }
    const moved = state.moved || Math.hypot(latest.x - state.start.x, latest.y - state.start.y) >= 7
    // Use the latest release position for the paper; an already highlighted
    // target is authoritative. If the final move was skipped, select and paint
    // from this same position before committing the drop.
    if (!cancelled && moved) {
      setPosition(clampPosition(latest, state.offset))
      if (state.target === null && state.ready) setDropTarget(findSlot(latest, state.offset))
    }
    const target = state.target
    const slot = !cancelled && target !== null ? target : null
    pausedSwing.current = { direction: state.direction, leg: Math.abs(state.extremeX - state.turnX) }
    // Finish exactly once, before releasing capture or changing the photo DOM.
    // A late lostpointercapture from this photo must not cancel the next photo.
    drag.current = null
    flushSync(() => { setHoverSlot(null); setDragging(false) })
    if (state.element.hasPointerCapture(event.pointerId)) state.element.releasePointerCapture(event.pointerId)
    if (slot === null) return
    pausedSwing.current = { direction: 0, leg: 0 }
    if (hungRef.current.some(item => item.index === state.index || item.slot === slot)) return
    const next = [...hungRef.current, { index: state.index, slot }]
    hungRef.current = next
    setHung(next)
    setSettling(state.index)
    setProgress(0)
    setExtracted(false)
    setBack(false)
    setPosition(startPosition)
  }

  function flip() {
    if (progress !== 1 || dragging) return
    if (!back) {
      const nextRead = new Set(readRef.current).add(current)
      readRef.current = nextRead
      setRead(nextRead)
    }
    setBack(!back)
    setDropTarget(null)
  }

  useLayoutEffect(() => { pointerHandlers.current = { move: moveDrag, finish: finishDrag } })

  useEffect(() => {
    // Observe the real release at window capture phase. It runs even if the
    // pointer is over a hung photo, capture was lost, or React replaced the paper.
    const move = (event: PointerEvent) => pointerHandlers.current?.move(event)
    const up = (event: PointerEvent) => pointerHandlers.current?.finish(event)
    const cancel = (event: PointerEvent) => pointerHandlers.current?.finish(event, true)
    window.addEventListener('pointermove', move, true)
    window.addEventListener('pointerup', up, true)
    window.addEventListener('pointercancel', cancel, true)
    return () => {
      window.removeEventListener('pointermove', move, true)
      window.removeEventListener('pointerup', up, true)
      window.removeEventListener('pointercancel', cancel, true)
    }
  }, [])

  function closeReview() {
    setReview(null)
  }

  const reviewPhoto = review === null ? undefined : memories.photos[review]
  const hint = photo ? progress < 1 ? memories.takeHint : eligible ? memories.hangHint : '' : ''
  const followHint = Boolean(hint)

  useLayoutEffect(() => {
    if (!followHint || !stage.current || !paper.current) return
    const update = () => {
      const bounds = stage.current!.getBoundingClientRect()
      const rect = paper.current!.getBoundingClientRect()
      const scaleY = bounds.height / stage.current!.offsetHeight
      setHintAnchor({
        x: Math.max(65, Math.min(bounds.width - 65, rect.left + rect.width / 2 - bounds.left)) / bounds.width * 100,
        y: Math.max(40 * scaleY, rect.top - bounds.top - 24 * scaleY) / bounds.height * 100,
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(stage.current)
    observer.observe(paper.current)
    return () => observer.disconnect()
  }, [followHint, position.x, position.y, extracted])

  return <section id="memories" className="photo-lab" aria-labelledby="memories-title">
    <h2 className="sr-only" id="memories-title" tabIndex={-1}>{memories.title}</h2>
    <div className="lab-stage" ref={stage}>
      {memories.stickers.map(sticker => <svg key={sticker.id} className={`lab-sticker lab-sticker-${sticker.id}`} viewBox={sticker.crop.join(' ')} role="img" aria-label={sticker.alt}>
        <image href={memories.sheet.src} width={memories.sheet.width} height={memories.sheet.height} />
      </svg>)}
      <span className="rope-tape rope-tape-left" aria-hidden="true" />
      <span className="rope-tape rope-tape-right" aria-hidden="true" />
      <svg className="lab-rope" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 10 Q500 80 1000 10" />
      </svg>
      {memories.photos.map((_, slot) => {
        const item = hung.find(value => value.slot === slot)
        const x = 13 + slot * 74 / (memories.photos.length - 1)
        const t = (x - 4) / 92
        const ropeHeight = (10 + 140 * t * (1 - t)) * 80 / 90
        const slotStyle = {
          left: `${x}%`, top: `calc(23% + ${ropeHeight}px)`,
          '--hanging-angle': `${[-3, 2, -1.5, 3, -2][slot % 5]}deg`,
          '--hanging-drop': `${[3, 8, 0, 6, 4][slot % 5]}px`,
        } as CSSProperties
        return <div key={slot} ref={element => {
          if (element) slots.current.set(slot, element)
          else slots.current.delete(slot)
        }} className={`lab-slot ${hoverSlot === slot ? 'slot-near' : ''} ${eligible && dragging && !item ? 'slot-ready' : ''} ${item?.index === settling ? 'just-hung' : ''}`}
          style={slotStyle} aria-label={`${memories.slotLabel} ${slot + 1}`}>
          <img className="lab-clip" src={memories.clips[slot % memories.clips.length]} alt="" aria-hidden="true" />
          {item && <button className="hanging-photo" aria-label={`${memories.reviewLabel} · ${memories.photos[item.index].alt}`}
            onClick={event => {
              reviewTrigger.current = event.currentTarget
              setReviewBack(false)
              setReview(item.index)
            }}>
            <FramedPhoto photo={memories.photos[item.index]} />
          </button>}
        </div>
      })}
      {photo && <>
        {Array.from({ length: memories.photos.length - current - 1 }, (_, index) =>
          <div className="lab-blank-paper" key={index} style={{ '--paper-offset': `${index * 3}px`, '--paper-angle': `${index % 2 ? 4 : -3}deg` } as CSSProperties} aria-hidden="true"><FramedPhoto /></div>)}
        <div key={current} ref={paper} className={`lab-paper ${dragging ? 'paper-dragging' : ''} ${extracted ? 'paper-extracted' : ''} ${back ? 'paper-back-up' : ''}`}
          role="group" aria-label={`${memories.paperLabel} ${current + 1}`}
          style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
          onPointerDown={startDrag}>
          <div className="lab-paper-turn">
            <div className="lab-front" aria-hidden={back}>
              <FramedPhoto photo={photo} progress={progress} />
            </div>
            <div className="lab-back" aria-hidden={!back}><p>{photo.back}</p></div>
          </div>
          <div className="lab-drag-surface" aria-hidden="true" />
          {progress === 1 && <button className="paper-flip-corner" aria-label={back ? memories.flipFront : memories.flipBack} aria-pressed={back}
            onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); flip() }}>
            <RotateIcon />
          </button>}
        </div>
      </>}
      <div className="lab-spare-clips" aria-hidden="true">
        {memories.clips.slice(0, 2).map((src, index) => <img key={src} src={src} alt="" style={{ transform: `rotate(${index ? -28 : 66}deg)` }} />)}
      </div>
      <button className="lab-return" onClick={previous}>← {ui.previous}</button>
      {hung.length === memories.photos.length && <button className="lab-next-arrow" aria-label={memories.nextLabel} onClick={next}>
        <svg viewBox="0 0 40 20" width="40" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M2 10h34M28 2l8 8-8 8" /></svg>
      </button>}
      {hint && <div className={`lab-instructions ${followHint ? 'lab-photo-hint' : ''}`} aria-live="polite"
        style={followHint ? { left: `${hintAnchor.x}%`, top: `${hintAnchor.y}%` } : undefined}><p>{hint}{followHint && <span aria-hidden="true"> ↙</span>}</p></div>}
      {photo && extracted && progress < 1 && <progress className="sr-only" aria-label={memories.progressLabel} value={progress} max={1} />}

    </div>
    <dialog ref={dialog} className="lightbox lab-review" aria-label={reviewPhoto?.alt}
      onClose={() => { closeReview(); reviewTrigger.current?.focus({ preventScroll: true }) }}
      onClick={event => { if (event.target === event.currentTarget) closeReview() }}>
      {reviewPhoto && <div className="lightbox-inner">
        <button autoFocus className="close" onClick={closeReview}>{ui.close} ×</button>
        <div className={`lab-review-paper ${reviewBack ? 'review-back-up' : ''}`}>
          <div style={{ visibility: reviewBack ? 'hidden' : 'visible' }}><FramedPhoto photo={reviewPhoto} /></div>
          {reviewBack && <p>{reviewPhoto.back}</p>}
        </div>
        <button className="text-button review-flip" aria-label={reviewBack ? memories.flipFront : memories.flipBack} aria-pressed={reviewBack} onClick={() => setReviewBack(!reviewBack)}>
          <RotateIcon />
        </button>
      </div>}
    </dialog>
  </section>
}
