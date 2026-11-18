import { PageArrow } from './PageArrow'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { coupons } from './content'

type Point = [number, number]
type DrawState = { order: string[]; selected: string | null; strokes: Point[][]; scratched: boolean; revealed: number }
const ids = coupons.cards.map(card => card.id)
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function initial(): DrawState {
  const order = [...ids]
  for (let i = order.length - 1; i > 0; i--) {
    const random = new Uint32Array(1)
    crypto.getRandomValues(random)
    const j = random[0] % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return { order, selected: null, strokes: [], scratched: false, revealed: 0 }
}

function ScratchCoat({ strokes, save, finish }: { strokes: Point[][]; save: (stroke: Point[]) => void; finish: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef<Point[] | null>(null)
  const lastCheck = useRef(0)
  const finished = useRef(false)
  const allStrokes = useRef(strokes)
  const saveRef = useRef(save)
  saveRef.current = save
  function erase(points: Point[]) {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !points.length) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 48; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(points[0][0] * 800, points[0][1] * 240)
    for (const [x, y] of points.slice(1)) ctx.lineTo(x * 800, y * 240)
    if (points.length === 1) { ctx.arc(points[0][0] * 800, points[0][1] * 240, 24, 0, Math.PI * 2); ctx.fill() }
    else ctx.stroke()
  }
  useEffect(() => {
    const ctx = canvas.current!.getContext('2d', { willReadFrequently: true })!
    ctx.globalCompositeOperation = 'source-over'
    const silver = ctx.createLinearGradient(0, 0, 800, 240)
    silver.addColorStop(0, '#b3b4b1'); silver.addColorStop(.36, '#deded9'); silver.addColorStop(.65, '#bdbeba'); silver.addColorStop(1, '#d4d4cf')
    ctx.fillStyle = silver; ctx.fillRect(0, 0, 800, 240)
    // Fine deterministic speckles give the coating a foil-like grain.
    for (let i = 0; i < 7000; i++) { ctx.fillStyle = i % 2 ? '#ffffff25' : '#55595019'; ctx.fillRect((i * 127) % 800, (i * 73) % 240, 1.5, 1) }
    allStrokes.current.forEach(erase)
    return () => { if (drawing.current?.length) saveRef.current(drawing.current) }
  }, [])
  function point(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect()
    return [Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))]
  }
  function check() {
    if (finished.current) return
    const pixels = canvas.current!.getContext('2d')!.getImageData(0, 0, 800, 240).data
    let clear = 0, total = 0
    for (let i = 3; i < pixels.length; i += 16) { total++; if (pixels[i] < 128) clear++ }
    if (clear / total >= coupons.scratchThreshold) { finished.current = true; finish() }
  }
  function stop(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    save(drawing.current); drawing.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    check()
  }
  return <canvas className="coupon-coat" ref={canvas} width="800" height="240" aria-label={coupons.scratchLabel}
    onPointerDown={event => { if (event.button !== 0 || finished.current) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); drawing.current = [point(event)]; erase(drawing.current) }}
    onPointerMove={event => {
      if (!drawing.current || finished.current) return
      const next = point(event), prev = drawing.current[drawing.current.length - 1]
      drawing.current.push(next); erase([prev, next])
      if (performance.now() - lastCheck.current > 100) { lastCheck.current = performance.now(); check() }
    }} onPointerUp={stop} onPointerCancel={stop} />
}

export function CouponDraw({ previous, next }: { previous: () => void; next: () => void }) {
  const [state, setState] = useState(initial)
  const [revealing, setRevealing] = useState(false)
  const [nextReady, setNextReady] = useState(() => state.revealed === 3)
  useEffect(() => {
    if (state.revealed !== 3) return
    const timer = window.setTimeout(() => setNextReady(true), reduce() ? 0 : 700)
    return () => clearTimeout(timer)
  }, [state.revealed])
  useEffect(() => {
    if (!revealing || state.revealed >= 3) return
    const timer = window.setTimeout(() => setState(s => ({ ...s, revealed: s.revealed + 1 })), reduce() ? 0 : coupons.revealIntervalMs)
    return () => clearTimeout(timer)
  }, [revealing, state.revealed])
  const others = state.order.filter(id => id !== state.selected)
  return <section id="coupons" className={`coupon-scene ${state.selected ? 'coupon-drawn' : ''} ${state.scratched ? 'coupon-scratched' : ''}`} aria-label={coupons.label} style={{ '--coupon-paper': `url(${JSON.stringify(coupons.background.src)})` } as CSSProperties}>
    <p className="coupon-hint">{!state.selected ? coupons.drawHint : !state.scratched ? coupons.scratchHint : '\u00a0'}</p>
    <div className="coupon-table">
      {state.order.map((id, index) => {
        const card = coupons.cards.find(c => c.id === id)!
        const chosen = state.selected === id
        const otherIndex = others.indexOf(id)
        const visible = chosen || (!!state.selected && otherIndex < state.revealed)
        return <div key={id} data-other={otherIndex} className={`coupon-slot ${chosen ? 'coupon-chosen' : ''} ${visible ? 'coupon-face-up' : ''}`}
          style={{ '--slot': index, '--other': otherIndex, '--ticket-ink': card.color } as CSSProperties}>
          <div className="coupon-turn">
            <button className="coupon-back" disabled={!!state.selected} aria-label={state.selected ? coupons.backLabel : coupons.chooseLabel.replace('{n}', String(index + 1))}
              onClick={() => setState(s => s.selected ? s : { ...s, selected: id })}>
              <span aria-hidden="true">♡</span>
            </button>
            <div className="coupon-front" aria-hidden={!visible || (chosen && !state.scratched)}>
              <img className="coupon-face-art" src={card.face} alt="" draggable={false} />
              <div className="coupon-reward">
                <div className="coupon-writing"><h2>{card.title}</h2><p>{card.rewardLines.map((line, index) => <span key={index}>{line}</span>)}</p></div>
                {card.sticker ? <img className="coupon-sticker" src={card.sticker} alt="" draggable={false} /> : <svg className="coupon-sticker" viewBox={coupons.heart.crop.join(' ')} aria-hidden="true"><image href={coupons.heart.sheet.src} width={coupons.heart.sheet.width} height={coupons.heart.sheet.height} /></svg>}
              </div>
            </div>
          </div>
          {chosen && !state.scratched && <ScratchCoat strokes={state.strokes} save={stroke => setState(s => s.selected === id && !s.scratched ? { ...s, strokes: [...s.strokes, stroke] } : s)} finish={() => setState(s => ({ ...s, scratched: true }))} />}
        </div>
      })}
      {state.scratched && state.revealed < 3 && <button className="coupon-reveal" disabled={revealing} onClick={() => setRevealing(true)}>{coupons.reveal}</button>}
    </div>
    <PageArrow direction="previous" label={coupons.previous} onClick={previous} />
    {nextReady && <PageArrow direction="next" label={coupons.next} onClick={next} />}
  </section>
}
