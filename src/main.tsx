import { PageArrow, PageArrowScope } from './PageArrow'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import { cover, memories, longDistance, sharedHours, letter, ui, music, type Photo } from './content'
import { dayRange, initialOffset, localTime, offsetAtClock } from './time'
import { CouponDraw } from './CouponDraw'
import { HandDrawnLandscape } from './HandDrawnLandscape'
import { GiftParcels } from './GiftParcels'
import { PaperLetter } from './PaperLetter'
import { PhotoLab } from './PhotoLab'
import { CalendarMemories } from './CalendarMemories'
import { useBackgroundMusic } from './useBackgroundMusic'
import './style.css'

type ViewPhoto = (photo: Photo, trigger: HTMLButtonElement) => void

function PhotoDialog({ photo, close, restore }: { photo: Photo | null; close: () => void; restore: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const photoViewport = useRef<HTMLElement>(null)
  useEffect(() => {
    const dialog = ref.current
    photoViewport.current?.scrollTo({ top: 0, left: 0 })
    if (photo && dialog && !dialog.open) dialog.showModal()
    if (!photo && dialog?.open) dialog.close()
  }, [photo])
  return <dialog ref={ref} className={`lightbox ${photo?.preview === 'scroll' ? 'lightbox-scroll' : ''}`} aria-label={photo?.alt} onClose={() => { close(); restore() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    {photo && <div className="lightbox-inner">
      <button autoFocus className="close" onClick={close}>{ui.close} <span aria-hidden="true">×</span></button>
      {photo.preview === 'scroll' && <p className="photo-scroll-hint">{ui.scrollPhotoHint}</p>}
      <figure ref={photoViewport} className={photo.preview === 'scroll' ? 'photo-scroll-viewport' : undefined}
        tabIndex={photo.preview === 'scroll' ? 0 : undefined} aria-label={photo.preview === 'scroll' ? ui.scrollPhotoHint : undefined}>
        <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        {photo.caption && <figcaption>{photo.caption}</figcaption>}
      </figure>
    </div>}
  </dialog>
}

const zones = sharedHours.zones
const dateZone = zones[sharedHours.dateReference]
const range = dayRange(sharedHours.date, dateZone)

const callOffset = offsetAtClock(range.start, range.length, sharedHours.call.reference, sharedHours.call.time)

function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

function SharedHours({ complete, unlocked }: { complete: () => void; unlocked: boolean }) {
  const [offset, setOffset] = useState(() => initialOffset(range.start, range.length, dateZone, sharedHours.initialTime))
  const instant = range.start + offset * 60_000
  const times = { vancouver: localTime(instant, zones.vancouver), xian: localTime(instant, zones.xian) }
  const [found, setFound] = useState(false)
  const revealTimer = useRef<number>(undefined)
  const keyboardSliding = useRef(false)
  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  function select(next: number) {
    const selected = !keyboardSliding.current && callOffset !== null && Math.abs(next - callOffset) <= sharedHours.call.snapMinutes ? callOffset : next
    setOffset(selected)
    if (selected !== callOffset || found) return
    setFound(true)
    if (reducedMotion()) complete()
    else revealTimer.current = window.setTimeout(complete, sharedHours.people.revealMs)
  }

  const showMessage = found || unlocked
  const approach = showMessage ? 1 : Math.max(0, 1 - Math.abs(offset - (callOffset ?? 720)) / sharedHours.people.approachMinutes)
  const cities = [
    { key: 'vancouver', ...longDistance.cities[1] },
    { key: 'xian', ...longDistance.cities[0] },
  ] as const

  return <div className={`paper-hours ${showMessage ? 'hours-reunited' : ''} ${unlocked ? 'hours-reunion-settled' : ''}`}>
    <div className="paper-clock-grid">
      {cities.map(city => {
        const current = times[city.key]
        return <article className={`paper-clock paper-clock-${city.key}`} key={city.key} aria-label={city.shortName}>
          <span className="clock-tape" aria-hidden="true" />
          <div className="paper-clock-cutout">
            <div className="paper-sky" aria-hidden="true">
              <HandDrawnLandscape minutes={current.minutes} mirror={city.key === 'xian'} />
            </div>
            <div className="paper-clock-caption">
              <h3>{city.shortName}<span>{city.english}</span></h3>
              <time dateTime={new Date(instant).toISOString()}><strong>{current.clock}</strong></time>
            </div>
          </div>
        </article>
      })}
    </div>
    <div className="hours-people-stage" aria-hidden="true">
      {(['girl', 'boy'] as const).map((person, index) => <div className={`hours-person hours-person-${person}`} key={person}
        style={{ left: `${50 + (index === 0 ? -1 : 1) * (7.5 + 26.5 * (1 - approach))}%`, '--bump-direction': index === 0 ? 1 : -1 } as CSSProperties}>
        <div className="hours-person-bump"><img src={sharedHours.people[person].src} alt="" draggable={false} /></div>
      </div>)}
      {showMessage && <span className="hours-reunion-heart">♥</span>}
    </div>
    <p className={`paper-call-message ${showMessage ? 'calling' : ''}`} aria-live="polite">{showMessage ? sharedHours.message : ''}</p>
    <div className="paper-hours-slider" style={{
      '--hours-heart-image': `url(${JSON.stringify(sharedHours.sliderHeart.src)})`,
      '--hours-heart-width': `${sharedHours.sliderHeart.width}px`,
      '--hours-heart-height': `${sharedHours.sliderHeart.height}px`,
      '--hours-target-opacity': sharedHours.sliderHeart.targetOpacity,
      '--hours-target-position': `${(callOffset ?? 0) / (range.length - 1) * 100}%`,
    } as CSSProperties}>
      <label htmlFor="hours">{sharedHours.instruction}</label>
      <div className="paper-hours-track">
        {callOffset !== null && <div className="hours-target-rail" aria-hidden="true"><span className="hours-target-heart" /></div>}
      <input id="hours" type="range" min="0" max={range.length - 1} value={offset}
        aria-label={sharedHours.slider}
        aria-valuetext={cities.map(city => `${city.shortName} ${times[city.key].clock}`).join('，')}
        onKeyDown={() => { keyboardSliding.current = true }}
        onPointerDown={() => { keyboardSliding.current = false }}
        onChange={event => select(event.currentTarget.valueAsNumber)} />
      </div>
      <div className="paper-hours-scale" aria-hidden="true"><span>00:00</span><span>{longDistance.cities[sharedHours.dateReference === 'vancouver' ? 1 : 0].shortName}</span><span>23:59</span></div>
    </div>
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
    {lit && <PageArrow direction="next" label={cover.nextLabel} onClick={turn} />}
  </section>
}

const pageIds = ['cover', 'memories', 'calendar', 'coupons', 'hours-chapter', 'gift', 'letter']

function App() {
  const backgroundMusic = useBackgroundMusic()
  const [page, setPage] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [unlocked, setUnlocked] = useState(() => new Set([0]))
  const [photo, setPhoto] = useState<Photo | null>(null)
  const photoTrigger = useRef<HTMLElement | null>(null)
  const pageTimer = useRef<number>(undefined)

  // Local review shortcut only; removed from production by Vite.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const preview = () => { if (window.location.hash === '#preview-calendar') setPage(2); if (window.location.hash === '#preview-hours') setPage(4); if (window.location.hash === '#preview-coupons') setPage(3); if (window.location.hash === '#preview-parcels') setPage(5); if (window.location.hash === '#preview-letter' || window.location.hash === '#preview-letter-curl') setPage(6) }
    preview()
    window.addEventListener('hashchange', preview)
    return () => window.removeEventListener('hashchange', preview)
  }, [])

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

  const pages = [
    <Cover turn={() => turn(1)} turning={leaving && page === 0} light={backgroundMusic.play} />,
    <PhotoLab previous={() => turn(0)} next={() => turn(2)} />,
    <CalendarMemories view={view} active={page === 2} previous={() => turn(1)} next={() => turn(3)} />,
    <CouponDraw previous={() => turn(2)} next={() => turn(4)} />,
    <section id="hours-chapter" className="paper-hours-chapter" aria-label={sharedHours.label}>
      <SharedHours complete={() => unlock(4)} unlocked={unlocked.has(4)} />
    </section>,
    <GiftParcels view={view} previous={() => turn(4)} next={() => turn(6)} />,
    <PaperLetter previous={() => turn(5)} />,
  ]

  return <div className={page === 1 ? 'photo-lab-page' : page === 2 ? 'calendar-collage-page' : page === 4 ? 'hours-collage-page' : page === 3 ? 'coupons-collage-page' : page === 5 ? 'parcels-collage-page' : page === 6 ? 'letter-collage-page' : undefined}>
    {(page >= 1) && <img className={page === 1 ? "lab-background" : "calendar-background"} src={cover.background.src} alt="" aria-hidden="true" />}
    <main className="cover-main">
      {pages.map((content, index) => <PageArrowScope key={pageIds[index]} active={index === page && !leaving}><div hidden={index !== page}
        className={`album-page ${leaving && page === index && page > 0 ? 'page-leaving' : ''}`}>
        {content}
        {index === 4 && <nav className="paper-hours-nav" aria-label="翻页"><PageArrow direction="previous" label={ui.previous} onClick={() => turn(3)} />{unlocked.has(4) && <PageArrow direction="next" label={ui.next} onClick={() => turn(5)} />}</nav>}

      </div></PageArrowScope>)}
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
