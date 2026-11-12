import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { cover, memories, longDistance, sharedHours, letter, gift, ui, music, type Photo } from './content'
import { dayRange, initialOffset, localTime, offsetAtClock } from './time'
import { PacificMap } from './PacificMap'
import { PhotoLab } from './PhotoLab'
import { CalendarMemories } from './CalendarMemories'
import { useBackgroundMusic } from './useBackgroundMusic'
import './style.css'

function Chapter({ id, number, label, title, hint, children }: {
  id: string; number: string; label: string; title: string; hint?: string; children: ReactNode
}) {
  return <section id={id} className="chapter" aria-labelledby={`${id}-title`}>
    <header className="chapter-heading">
      <span className="eyebrow"><span>{number}</span><i />{label}</span>
      <h2 tabIndex={-1} id={`${id}-title`}>{title}</h2>
      {hint && <p className="chapter-hint">{hint}</p>}
    </header>
    {children}
  </section>
}

type ViewPhoto = (photo: Photo, trigger: HTMLButtonElement) => void

function PhotoFrame({ photo, open, giftPhoto = false }: { photo: Photo; open: (trigger: HTMLButtonElement) => void; giftPhoto?: boolean }) {
  return <figure className={`print ${giftPhoto ? 'gift-print' : ''}`}>
    <button className="photo-button" onClick={event => open(event.currentTarget)} aria-label={`${ui.preview} · ${photo.alt}`}>
      <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.position }} loading={giftPhoto ? 'eager' : 'lazy'} />
      <span className="zoom" aria-hidden="true">＋</span>
    </button>
    {photo.caption && <figcaption>{photo.caption}</figcaption>}
  </figure>
}

function PhotoDialog({ photo, close, restore }: { photo: Photo | null; close: () => void; restore: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (photo && dialog && !dialog.open) dialog.showModal()
    if (!photo && dialog?.open) dialog.close()
  }, [photo])
  return <dialog ref={ref} className="lightbox" aria-label={photo?.alt} onClose={() => { close(); restore() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    {photo && <div className="lightbox-inner">
      <button autoFocus className="close" onClick={close}>{ui.close} <span aria-hidden="true">×</span></button>
      <figure>
        <img src={photo.src} alt={photo.alt} />
        {photo.caption && <figcaption>{photo.caption}</figcaption>}
      </figure>
    </div>}
  </dialog>
}

const zones = sharedHours.zones
const dateZone = zones[sharedHours.dateReference]
const range = dayRange(sharedHours.date, dateZone)

function sky(minutes: number) {
  const stops = [
    [0, 41, 47, 70], [300, 50, 53, 76], [420, 151, 104, 118],
    [540, 110, 147, 169], [840, 94, 133, 158], [1080, 145, 93, 103],
    [1200, 54, 53, 76], [1440, 41, 47, 70],
  ]
  const next = stops.findIndex(([at]) => at > minutes)
  const [from, ...dark] = stops[next - 1]
  const [to, ...light] = stops[next]
  const mix = (minutes - from) / (to - from)
  return `rgb(${dark.map((value, index) => Math.round(value + (light[index] - value) * mix)).join(',')})`
}

const callOffset = offsetAtClock(range.start, range.length, sharedHours.call.reference, sharedHours.call.time)

function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

function SharedHours({ complete, unlocked }: { complete: () => void; unlocked: boolean }) {
  const [offset, setOffset] = useState(() => initialOffset(range.start, range.length, dateZone, sharedHours.initialTime))
  const instant = range.start + offset * 60_000
  const times = { vancouver: localTime(instant, zones.vancouver), xian: localTime(instant, zones.xian) }
  const { reference, time } = sharedHours.call
  const calling = localTime(instant, reference).clock === time
  const [found, setFound] = useState(false)
  const revealTimer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  function select(next: number) {
    setOffset(next)
    if (next !== callOffset || found) return
    setFound(true)
    if (reducedMotion()) complete()
    else revealTimer.current = window.setTimeout(complete, 370)
  }

  const showMessage = calling || (found && !unlocked)
  const cities = [
    { key: 'vancouver', ...longDistance.cities[1] },
    { key: 'xian', ...longDistance.cities[0] },
  ] as const

  return <>
    <div className="clock-grid">
      {cities.map(city => {
        const current = times[city.key]
        const daylight = current.minutes >= 390 && current.minutes < 1110
        return <article className="clock" key={city.key} style={{ backgroundColor: sky(current.minutes) }}>
          <span className={`celestial ${daylight ? 'sun' : 'moon'}`} aria-hidden="true" />
          <div className="clock-city">{city.shortName}<span>{city.english}</span></div>
          <time className="clock-time" dateTime={new Date(instant).toISOString()}>{current.clock}</time>
          <div className="clock-date">{current.date.replaceAll('-', '.')}<span>{ui.localTime}</span></div>
        </article>
      })}
      <p className={`call-message ${showMessage ? 'calling' : ''}`} aria-live="polite">
        {showMessage && <><span aria-hidden="true">♥</span>{sharedHours.message}</>}
      </p>
    </div>
    <div className="slider">
      <label htmlFor="hours">{sharedHours.instruction}</label>
      <input id="hours" type="range" min="0" max={range.length - 1} value={offset}
        aria-label={sharedHours.slider}
        aria-valuetext={cities.map(city => `${city.shortName} ${times[city.key].date} ${times[city.key].clock}`).join('，')}
        onChange={event => select(event.currentTarget.valueAsNumber)}
        onPointerUp={event => {
          // A pixel on the native track may represent more than one minute.
          if (callOffset !== null && Math.abs(event.currentTarget.valueAsNumber - callOffset) <= 2) select(callOffset)
        }} />
      <div className="slider-scale" aria-hidden="true"><span>00:00</span><span>{longDistance.cities[sharedHours.dateReference === 'vancouver' ? 1 : 0].shortName} · {sharedHours.date}</span><span>23:59</span></div>

    </div>
  </>
}

function Letter({ complete, unlocked }: { complete: () => void; unlocked: boolean }) {
  const [open, setOpen] = useState(false)
  const paper = useRef<HTMLElement>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (open) paper.current?.focus({ preventScroll: true })
  }, [open])
  return <div className={`letter-stage ${open ? 'letter-open' : ''} ${unlocked ? 'letter-settled' : ''}`}>
    <div className="envelope" aria-hidden="true"><span className="envelope-flap"/><span className="wax">♡</span></div>
    {open ? <article className="letter-paper" ref={paper} tabIndex={-1}>
      <p>{letter.greeting}</p>
      {letter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <p className="signature">{letter.signature}</p>
    </article> : <button className="primary" onClick={() => {
      setOpen(true)
      if (reducedMotion()) complete()
      else timer.current = window.setTimeout(complete, 900)
    }}>{letter.open}<span aria-hidden="true">↗</span></button>}
  </div>
}

function GiftBox({ view }: { view: ViewPhoto }) {
  const [step, setStep] = useState<'tied' | 'untied' | 'opened'>('tied')
  const opened = step === 'opened'
  const [settled, setSettled] = useState(false)
  const keyboardOpen = useRef(false)
  const reveal = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!opened) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => {
      setSettled(true)
      const element = reveal.current
      if (!element || !element.getClientRects().length) return
      if (keyboardOpen.current && document.activeElement === document.body) {
        element.querySelector('button')?.focus({ preventScroll: true })
      }
      const bounds = element.getBoundingClientRect()
      if (bounds.top < 12 || bounds.bottom > window.innerHeight - 12) {
        element.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' })
      }
    }, reduced ? 0 : 1170)
    return () => clearTimeout(timer)
  }, [opened])

  function open(fromKeyboard: boolean) {
    keyboardOpen.current = fromKeyboard
    setStep(step === 'tied' ? 'untied' : 'opened')
  }

  const box = <span className="box-art" aria-hidden="true">
    <span className="box-base" /><span className="box-lid"><span className="bow left" /><span className="bow right" /><span className="knot" /></span>
  </span>

  return <div className={`gift-stage ${step} ${settled ? "gift-settled" : ""}`}>
    {opened ? <>
      <div className="gift-box-static">{box}</div>
      <div className="gift-reveal" ref={reveal}>
        <PhotoFrame photo={gift.image} open={trigger => view(gift.image, trigger)} giftPhoto />
        {gift.note && <p className="gift-note">{gift.note}</p>}
      </div>
    </> : <>
      <div className="gift-box-static">{box}</div>
      <div className="gift-actions">
        <p className="gift-prompt">{gift.prompt}</p>
        <button className="primary" onClick={event => open(event.detail === 0)}>{step === 'tied' ? gift.untie : gift.lift}<span aria-hidden="true">↗</span></button>
      </div>
    </>}
  </div>
}

function Cover({ turn, turning, light }: { turn: () => void; turning: boolean; light: () => void }) {
  const [lit, setLit] = useState(false)
  const keyboardLight = useRef(false)
  const photograph = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!lit || !keyboardLight.current) return
    const timer = window.setTimeout(() => photograph.current?.focus({ preventScroll: true }), reducedMotion() ? 0 : 1800)
    return () => window.clearTimeout(timer)
  }, [lit])

  const sheet = <image href={cover.sheet.src} width={cover.sheet.width} height={cover.sheet.height} />

  return <section className={`collage-cover ${lit ? 'collage-lit' : ''} ${turning ? 'turning' : ''}`} aria-labelledby="cover-title">
    <h1 id="cover-title" tabIndex={-1} className="sr-only">{cover.title}</h1>
    <img className="collage-paper" src={cover.background.src} alt="" aria-hidden="true" />
    <div className="collage-illumination" aria-hidden="true" />
    <svg className="collage-title collage-sticker" viewBox="0 0 770 240" role="img" aria-label={cover.title}>
      {cover.titlePieces.map((piece, index) => <svg key={index} viewBox={piece.crop.join(' ')}
        x={piece.x} y={piece.y} width={piece.width} height={piece.height} overflow="hidden">{sheet}</svg>)}
    </svg>
    {cover.image?.src && <button ref={photograph} className="collage-photo" disabled={!lit} aria-label={cover.enterLabel} onClick={turn}>
      <img src={cover.image.src} alt={cover.image.alt} draggable={false} />
    </button>}
    {cover.stickers.map(sticker => <svg key={sticker.id} className={`collage-sticker collage-${sticker.id}`}
      viewBox={sticker.crop.join(' ')} role="img" aria-label={sticker.alt}>
      {sticker.outline ? <>
        <defs><clipPath id={`cutout-${sticker.id}`}><path d={sticker.outline} /></clipPath></defs>
        <g clipPath={`url(#cutout-${sticker.id})`}>{sheet}</g>
      </> : sheet}
    </svg>)}
    <div className="collage-shade" aria-hidden="true" />
    <button className="desktop-candle" disabled={lit} aria-label={lit ? cover.litLabel : cover.lightHint}
      onClick={event => {
        keyboardLight.current = event.detail === 0
        setLit(true)
        light()
      }}>
      <img src={cover.candle.src} alt={cover.candle.alt} />
      {lit && <span className="candle-flame" aria-hidden="true"><i /></span>}
      {!lit && <span className="candle-hint">{cover.lightHint}<span aria-hidden="true"> ↙</span></span>}
    </button>
    <div className="cover-turn" aria-hidden="true" />
  </section>
}

const pageIds = ['cover', 'memories', 'calendar', 'distance', 'hours-chapter', 'letter', 'gift']

function App() {
  const backgroundMusic = useBackgroundMusic()
  const [page, setPage] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [unlocked, setUnlocked] = useState(() => new Set([0]))
  const [photo, setPhoto] = useState<Photo | null>(null)
  const photoTrigger = useRef<HTMLElement | null>(null)
  const pageTimer = useRef<number>(undefined)

  useEffect(() => {
    document.title = cover.title
    return () => window.clearTimeout(pageTimer.current)
  }, [])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById(`${pageIds[page]}-title`)?.focus({ preventScroll: true })
  }, [page])

  function unlock(index: number) {
    setUnlocked(current => current.has(index) ? current : new Set(current).add(index))
  }

  function turn(next: number) {
    if (leaving) return
    if (reducedMotion()) {
      setPage(next)
      return
    }
    setLeaving(true)
    pageTimer.current = window.setTimeout(() => {
      setPage(next)
      setLeaving(false)
    }, page === 0 ? 430 : 135)
  }

  function view(photo: Photo, trigger: HTMLButtonElement) {
    photoTrigger.current = trigger
    setPhoto(photo)
  }

  function closePhoto() {
    setPhoto(null)
  }

  const number = (index: number) => String(index + 1).padStart(2, '0')
  const pages = [
    <Cover turn={() => turn(1)} turning={leaving && page === 0} light={backgroundMusic.play} />,
    <PhotoLab previous={() => turn(0)} next={() => turn(2)} />,
    <CalendarMemories view={view} active={page === 2} previous={() => turn(1)} next={() => turn(3)} />,
    <Chapter id="distance" number="04" {...longDistance}>
      <PacificMap complete={() => unlock(3)} />
      <p className="distance-caption">{longDistance.message[0]}<strong>{longDistance.distance}</strong>{longDistance.message[1]}</p>
    </Chapter>,
    <Chapter id="hours-chapter" number="05" {...sharedHours}>
      <SharedHours complete={() => unlock(4)} unlocked={unlocked.has(4)} />
    </Chapter>,
    <Chapter id="letter" number="06" {...letter}>
      <Letter complete={() => unlock(5)} unlocked={unlocked.has(5)} />
    </Chapter>,
    <Chapter id="gift" number="07" {...gift}><GiftBox view={view} /></Chapter>,
  ]

  return <div className={page === 1 ? 'photo-lab-page' : page === 2 ? 'calendar-collage-page' : undefined}>
    {(page === 1 || page === 2) && <img className={page === 1 ? "lab-background" : "calendar-background"} src={cover.background.src} alt="" aria-hidden="true" />}
    <header className="masthead" hidden={page <= 2}>
      <span><b aria-hidden="true">♡</b> {ui.album}</span>
      <span aria-live="polite">{number(page)} / {number(pages.length - 1)}</span>
    </header>
    <main className={page <= 2 ? "cover-main" : undefined}>
      {pages.map((content, index) => <div key={pageIds[index]} hidden={index !== page}
        className={`album-page ${leaving && page === index && page > 0 ? 'page-leaving' : ''}`}>
        {content}
        {index > 2 && <nav className="page-nav">
          <button className="text-button" onClick={() => turn(index - 1)}><span aria-hidden="true">← </span>{ui.previous}</button>
          {index < pages.length - 1 && unlocked.has(index) && <button className="primary page-next" onClick={() => turn(index + 1)}>
            {ui.next}<span aria-hidden="true">→</span>
          </button>}
        </nav>}
      </div>)}
    </main>
    <audio ref={backgroundMusic.audio} src={music.src} loop preload="metadata"
      onPlay={() => backgroundMusic.setPlaying(true)} onPause={() => backgroundMusic.setPlaying(false)} />
    {backgroundMusic.requested && <button className={`music-toggle ${page === 0 ? 'music-on-cover' : ''}`}
      onClick={backgroundMusic.toggle} aria-label={backgroundMusic.playing ? music.pause : music.resume}
      title={backgroundMusic.playing ? music.pause : music.resume}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        {backgroundMusic.playing ? <><path d="M9 6v12M15 6v12" /></> : <path d="M9 5l10 7-10 7Z" />}
      </svg>
    </button>}
    <PhotoDialog photo={photo} close={closePhoto} restore={() => photoTrigger.current?.focus({ preventScroll: true })} />
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
