import { PageArrow } from './PageArrow'
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { letter } from './content'
import { LetterReader } from './LetterReader'

type Phase = 'sealed' | 'unsealing' | 'ready' | 'clearing' | 'extracting' | 'reading'
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function ClosedEnvelopeArt() {
  return <svg className="mail-envelope-art" viewBox={letter.envelope.crop.join(' ')} aria-hidden="true"><image href={letter.envelope.src} width={letter.envelope.width} height={letter.envelope.height} /></svg>
}
function OpeningFlap() {
  const [ax, ay, bx, by] = letter.envelope.hinge
  return <div className="mail-opening-closed" aria-hidden="true">
    <div className="mail-opening-body"><ClosedEnvelopeArt /></div>
    <div className="mail-opening-flap" style={{ clipPath: letter.envelope.flapClip, transformOrigin: `${ax / 10}% ${ay / 10}%`, '--hinge-x': (bx - ax) * letter.envelope.crop[2] / letter.envelope.crop[3], '--hinge-y': by - ay } as CSSProperties}><ClosedEnvelopeArt /></div>
  </div>
}
function OpenEnvelope({ pull, clearing, showPaper }: { pull: number; clearing: boolean; showPaper: boolean }) {
  const id = useId().replace(/:/g, '')
  const art = letter.openEnvelope
  return <svg className="mail-open-art" viewBox={art.crop.join(' ')} aria-hidden="true" focusable="false">
    <defs>
      <clipPath id={`${id}-outline`}><path d={art.outline} /></clipPath>
      <clipPath id={`${id}-pocket`}><path d={art.pocket} /></clipPath>
      <clipPath id={`${id}-slot`}><path d={art.slot} /></clipPath>
    </defs>
    <image href={art.src} width={art.width} height={art.height} clipPath={`url(#${id}-outline)`} />
    {showPaper && <g clipPath={`url(#${id}-slot)`}>
      <g className="mail-sliding-paper" style={{ '--paper-offset': `${pull * -55}px`, '--paper-travel': `${-art.pullTravel}px`, transitionDuration: clearing ? `${letter.clearEnvelopeMs}ms` : undefined } as CSSProperties}>
        <image href={letter.paper.src} x="0" y="0" width={art.paperWidth} height={art.paperHeight}
          transform={`matrix(.927 -.375 .375 .927 ${art.paperX} ${art.paperY})`} />
      </g>
    </g>}
    <image href={art.src} width={art.width} height={art.height} clipPath={`url(#${id}-pocket)`} />
  </svg>
}
export function PaperLetter({ previous }: { previous: () => void }) {
  const [phase, setPhase] = useState<Phase>('sealed')
  const [pull, setPull] = useState(0)
  const drag = useRef<{ pointer: number; x: number; y: number } | null>(null)
  useEffect(() => {
    if (phase !== 'unsealing' && phase !== 'clearing' && phase !== 'extracting') return
    const timer = window.setTimeout(() => setPhase(phase === 'unsealing' ? 'ready' : phase === 'clearing' ? 'extracting' : 'reading'), reduced() ? 0 : phase === 'unsealing' ? letter.openMs : phase === 'clearing' ? letter.clearEnvelopeMs : letter.extractMs)
    return () => clearTimeout(timer)
  }, [phase])
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    const distance = Math.max(0, (current.y - event.clientY) * .927 + (current.x - event.clientX) * .375)
    const progress = Math.min(1, distance / letter.pullDistance)
    setPull(progress)
    if (progress >= 1) { drag.current = null; setPhase('clearing') }
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current; drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (current) setPull(0)
  }
  const open = phase !== 'sealed'
  const envelope = open ? letter.openEnvelope : letter.envelope
  return <section id="letter" className={`paper-letter-scene mail-${phase}`} aria-label={letter.label}
    style={{ '--mail-pull': pull, '--mail-ink': letter.ink, '--mail-paper-aspect': letter.paper.aspect } as CSSProperties}>
    <h2 id="letter-title" className="sr-only" tabIndex={-1}>{letter.title}</h2>
    <div className="mail-envelope" style={{ aspectRatio: `${envelope.crop[2]} / ${envelope.crop[3]}` }}>
      {open ? <OpenEnvelope pull={pull} clearing={phase === 'clearing'} showPaper={phase !== 'extracting' && phase !== 'reading'} /> :
        <ClosedEnvelopeArt />}
      {phase === 'unsealing' && <OpeningFlap />}
      <button className="mail-heart" disabled={open} aria-label={letter.openLabel} onClick={() => setPhase('unsealing')}>
        <img src={letter.heart.src} alt={letter.heart.alt} draggable={false} />
      </button>
      {(phase === 'sealed' || phase === 'unsealing' || phase === 'ready') && <p className="mail-operation-hint" aria-live="polite">{phase === 'sealed' ? letter.openHint : phase === 'ready' ? letter.pullHint : ''}</p>}
      {phase === 'ready' && <button className="mail-pull-handle" aria-label={letter.pullLabel} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onLostPointerCapture={() => { if (drag.current) { drag.current = null; setPull(0) } }} onClick={event => { if (event.detail === 0) setPhase('clearing') }} />}
    </div>
    <LetterReader active={phase === 'reading'} />
    <PageArrow direction="previous" label={letter.previous} onClick={previous} />
  </section>
}
