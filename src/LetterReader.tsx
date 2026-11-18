import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { letter } from './content'

export function LetterReader({ active = true }: { active?: boolean }) {
  const config = letter.reading
  const [back, setBack] = useState(false)
  const [motion, setMotion] = useState<{ progress: number; fromBack: boolean } | null>(null)
  const [layout, setLayout] = useState({ width: 560, height: 650, split: 3 })
  const sheet = useRef<HTMLElement>(null), measure = useRef<HTMLDivElement>(null)
  const busy = useRef(false), frame = useRef(0)
  useLayoutEffect(() => {
    let alive = true
    function arrange() {
      const node = measure.current!, paper = sheet.current!
      if (!alive || !paper.clientWidth) return
      const maxWidth = Math.min(720, window.innerWidth - 48)
      const initialHeight = Math.max(560, Math.min(800, window.innerHeight - 110))
      let result = { width: maxWidth, height: initialHeight, split: 3 }
      function contentHeight(parts: readonly string[], width: number, height: number) {
        node.style.width = `${width * .8}px`; node.style.height = `${height * .64}px`
        node.replaceChildren(...parts.map(text => { const p = document.createElement('p'); p.textContent = text; return p }))
        const last = node.lastElementChild as HTMLElement | null
        return last ? last.offsetTop + last.offsetHeight : 0
      }
      // Keep all original paragraphs intact and enlarge the paper before changing typography.
      outer: for (let height = initialHeight; height <= initialHeight + 420; height += 28) {
        const start = Math.min(480, maxWidth)
        const widths = Array.from({ length: Math.ceil((maxWidth - start) / 12) + 1 }, (_, i) => Math.min(maxWidth, start + i * 12))
        for (const width of widths) {
          let best: { split: number; balance: number } | null = null
          for (let split = 1; split < letter.paragraphs.length; split++) {
            const front = contentHeight(letter.paragraphs.slice(0, split), width, height)
            const reverse = contentHeight(letter.paragraphs.slice(split), width, height)
            if (Math.max(front, reverse) <= height * .64 - 3 && (!best || Math.abs(front - reverse) < best.balance)) best = { split, balance: Math.abs(front - reverse) }
          }
          if (best) { result = { width, height, split: best.split }; break outer }
        }
      }
      node.replaceChildren()
      setLayout(old => JSON.stringify(old) === JSON.stringify(result) ? old : result)
    }
    const observer = new ResizeObserver(arrange); observer.observe(sheet.current!)
    window.addEventListener('resize', arrange); document.fonts.ready.then(arrange); arrange()
    return () => { alive = false; observer.disconnect(); window.removeEventListener('resize', arrange) }
  }, [])
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  function flip() {
    if (!active || busy.current) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setBack(current => !current); return }
    busy.current = true
    const started = performance.now(), fromBack = back
    setMotion({ progress: 0, fromBack })
    function tick(now: number) {
      const progress = Math.min(1, (now - started) / config.flipMs)
      if (progress === 1) { setBack(!fromBack); setMotion(null); busy.current = false; return }
      setMotion({ progress, fromBack })
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }
  function key(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip() }
  }
  const sides = [letter.paragraphs.slice(0, layout.split), letter.paragraphs.slice(layout.split)]
  const hint = back ? config.toFront : config.toBack
  const t = motion?.progress || 0
  const r = Math.max(0, Math.min(1, (t - .12) / .75))
  const rotation = r * r * (3 - 2 * r)
  const angle = motion ? (motion.fromBack ? -180 + rotation * 180 : -rotation * 180) : back ? -180 : 0
  const lift = motion ? Math.sin(Math.PI * t) : 0
  const landing = t > .86 ? (t - .86) / .14 : 0
  const bounce = Math.sin(landing * Math.PI * 2) * (1 - landing) * 2
  const rightLift = motion ? 16 * Math.sin(Math.PI * Math.min(1, t / .42)) : 0
  const bend = motion ? layout.width * .014 * Math.sin(Math.PI * rotation) : 0
  function face(parts: readonly string[], index: number, clip?: string) {
    return <div className={`mail-paper-face duplex-face duplex-${index === 0 ? 'front' : 'back'}`} aria-hidden={!!motion || back !== !!index} style={clip ? { clipPath: clip } : undefined}>
      <img className="mail-stationery" src={letter.paper.src} alt={letter.paper.alt} draggable={false} />
      <div className="mail-handwriting">{parts.map((text, i) => <p key={i}>{text}</p>)}</div>
      {motion && <div className="duplex-sheen" style={{ opacity: lift * .12 }} />}
    </div>
  }
  return <article ref={sheet} className="mail-reading-sheet duplex-reader" role="button" tabIndex={active ? 0 : -1}
    aria-label={hint} aria-pressed={back} aria-disabled={!active} onClick={flip} onKeyDown={key} aria-busy={!!motion} data-side={back ? 'back' : 'front'}
    style={{ '--mail-ink': letter.ink, '--duplex-width': `${layout.width}px`, '--duplex-height': `${layout.height}px`, '--curl-font': `${config.fontPx}px`, '--curl-leading': config.lineHeight, '--curl-paragraph-gap': `${config.paragraphGap}em`, '--duplex-ms': `${config.flipMs}ms` } as CSSProperties}>
    <div ref={measure} className="mail-handwriting mail-measure duplex-measure" aria-hidden="true" />
    <div className="duplex-shadow" aria-hidden="true" style={{ opacity: .17 - lift * .075, filter: `blur(${8 + lift * 12}px)`, transform: `translateY(${9 + lift * 5}px) scale(${1 + lift * .035},${1 + lift * .02})` }} />
    <div className={`duplex-turner ${motion ? 'duplex-in-motion' : ''}`} style={{ transform: `translate3d(0,${-lift * 6 + bounce}px,${lift * 18}px) rotateY(${angle}deg) rotateZ(${-lift * .3}deg)` }}>
      {motion ? Array.from({ length: 24 }, (_, i) => {
        const u = (i + .5) / 24, x = u * layout.width
        const z = rightLift * u + bend * Math.sin(Math.PI * u)
        const tangent = -Math.atan((rightLift + bend * Math.PI * Math.cos(Math.PI * u)) / layout.width)
        const left = Math.max(0, i * 100 / 24 - .04), right = Math.max(0, 100 - (i + 1) * 100 / 24 - .04)
        return <div key={i} className="duplex-strip" aria-hidden="true" style={{ transform: `translate3d(${x}px,0,${z}px) rotateY(${tangent}rad) translateX(${-x}px)` }}>
          {face(sides[0], 0, `inset(0 ${right}% 0 ${left}%)`)}
          {face(sides[1], 1, `inset(0 ${left}% 0 ${right}%)`)}
        </div>
      }) : sides.map((parts, index) => <div key={index} className="duplex-static-face">{face(parts, index)}</div>)}
      <div className="duplex-paper-edge" aria-hidden="true" />
    </div>
    <p className="duplex-hint" aria-live="polite">{hint}</p>
  </article>
}
